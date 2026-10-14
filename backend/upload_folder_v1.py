import os
import sys
import glob
import json
import random
import asyncio
import shutil
import logging
import re
import subprocess

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.taxonomy import Category, Tag, video_category_table, video_tag_table
from app.models.video import Video
from app.worker.tasks import process_video_task

TARGET_DIR = r"D:\_Xpig\v1"
ADMIN_USER_ID = 1
CHECKPOINT_FILE = os.path.join(os.path.dirname(__file__), "processed_files_v1.json")

PREFIXES = [
    "Deshi Viral", "Exclusive Hot", "Deshi Leaked", "Trending Hot", 
    "Secret Viral", "Hot Romantic", "Uncut Deshi", "Real Viral", 
    "Exclusive Deshi", "Hot Romance", "Spicy Deshi", "Deshi Romance", 
    "Midnight Hot", "Secret Deshi", "Sensual Viral", "Pure Deshi", 
    "Super Hot", "Deshi College Girl", "Viral Deshi", "Extreme Hot", 
    "Sweet Deshi", "Passionate Hot", "Deshi Bhabhi", "Secret Romance",
    "Deshi Girlfriend", "Hot Leaked", "Viral Secret", "Spicy Romance",
    "Hot Deshi Scene", "Sensational Viral", "Wild Romance", "Deshi Lovers"
]

CORES = [
    "Viral Video Clip", "Private Scandal", "Hot Romance Moment", 
    "Deshi Scandal Tape", "Viral Bedroom Scene", "Leaked Romance Video", 
    "Romantic Scandal Clip", "Unseen Deshi Moment", "Hot Viral Romance", 
    "Secret Room Scandal", "Midnight Viral Video", "Romantic Couple Tape", 
    "Deshi Hot Video", "Viral Romantic Clip", "Secret Romance Scene",
    "Private Hotel Scene", "Uncut Romantic Tape", "Passionate Love Moment",
    "Secret Lover Tape", "Private Romance Session", "Intimate Romance Moment"
]

SUFFIXES = [
    "Full HD Video", "Uncut Clip", "Full HD Recording", "Trending Clip", 
    "Viral Romance", "Exclusive Tape", "Must Watch Clip", "Private Clip", 
    "Watch Online", "Top Trending Video", "Special Edition", "Exclusive Release",
    "Raw Uncut Version", "Original Recording", "Leaked Session", "Premium HD"
]

USED_TITLES = set()

def generate_custom_title():
    while True:
        p = random.choice(PREFIXES)
        c = random.choice(CORES)
        s = random.choice(SUFFIXES)
        title = f"{p} {c} - {s}"
        # Ensure absolutely NO digits/numbers
        title = re.sub(r'\d+', '', title).strip()
        # Clean extra spaces
        title = re.sub(r'\s+', ' ', title)
        if title not in USED_TITLES:
            USED_TITLES.add(title)
            return title

def is_valid_video(filepath):
    """Check if file is a valid video with ffprobe and size > 50KB"""
    if os.path.getsize(filepath) < 50000:
        return False
    try:
        res = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filepath],
            capture_output=True, text=True, timeout=10
        )
        if res.returncode == 0 and res.stdout.strip():
            return True
    except Exception:
        pass
    return False

async def run_upload(limit=None):
    valid_exts = {'.mp4', '.mov', '.mkv', '.webm', '.avi'}
    all_files = sorted([
        os.path.join(TARGET_DIR, f) for f in os.listdir(TARGET_DIR)
        if os.path.splitext(f)[1].lower() in valid_exts
    ])

    processed_set = set()
    if os.path.exists(CHECKPOINT_FILE):
        try:
            with open(CHECKPOINT_FILE, "r") as f:
                processed_set = set(json.load(f))
        except Exception:
            pass

    pending_files = [f for f in all_files if os.path.basename(f) not in processed_set]

    print(f"Total video files in {TARGET_DIR}: {len(all_files)}")
    print(f"Already processed: {len(processed_set)}")
    print(f"Pending to upload: {len(pending_files)}")

    if limit:
        pending_files = pending_files[:limit]
        print(f"Processing next {limit} files in this run...")

    print("=" * 60)

    for i, filepath in enumerate(pending_files, 1):
        filename = os.path.basename(filepath)
        
        # Verify valid video
        if not is_valid_video(filepath):
            print(f"\n[{i}/{len(pending_files)}] Skipping invalid or non-video file: {filename}")
            processed_set.add(filename)
            with open(CHECKPOINT_FILE, "w") as f:
                json.dump(list(processed_set), f, indent=2)
            continue

        title = generate_custom_title()
        assert not re.search(r'\d', title), f"Error: Title '{title}' has numbers!"

        print(f"\n[{i}/{len(pending_files)}] Uploading: {filename}")
        print(f"   -> Custom Title: '{title}'")

        try:
            # 1. Create Video record in DB
            async with SessionLocal() as db:
                video = Video(
                    title=title,
                    description=f"Exclusive uncut video: {title}. Watch in Full HD 1080p on XPIG.",
                    creator_id=ADMIN_USER_ID,
                    status="PUBLISHED",
                    visibility="PUBLIC",
                    duration=0
                )
                db.add(video)
                await db.commit()
                await db.refresh(video)
                video_id = video.id
                print(f"   [DB] Created Video ID {video_id}")

            # 2. Stage file for FFMPEG
            staging_dir = f"D:/tmp/pig_uploads/{video_id}"
            os.makedirs(staging_dir, exist_ok=True)
            ext = os.path.splitext(filename)[1].lower()
            input_path = os.path.join(staging_dir, f"raw_{video_id}{ext}")
            shutil.copy2(filepath, input_path)

            output_dir = f"D:/tmp/pig_hls/{video_id}"

            # 3. Process video, watermark, thumb, preview & upload to Cloudflare R2
            print(f"   [PROCESSING & R2] Watermarking & uploading Video ID {video_id}...")
            result = await process_video_task(None, video_id, input_path, output_dir)

            if result.get("status") == "success":
                print(f"   [SUCCESS] Uploaded to Cloudflare R2: {result.get('url')}")
                processed_set.add(filename)
                with open(CHECKPOINT_FILE, "w") as f:
                    json.dump(list(processed_set), f, indent=2)
            else:
                print(f"   [FAILED] {result.get('message')}")

            # Clean up temp directories
            if os.path.exists(staging_dir):
                shutil.rmtree(staging_dir, ignore_errors=True)
            if os.path.exists(output_dir):
                shutil.rmtree(output_dir, ignore_errors=True)

        except Exception as e:
            print(f"   [ERROR] Failed processing {filename}: {e}")

    print("\n" + "=" * 60)
    print("Batch upload cycle completed!")

if __name__ == "__main__":
    limit_arg = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else None
    asyncio.run(run_upload(limit=limit_arg))
