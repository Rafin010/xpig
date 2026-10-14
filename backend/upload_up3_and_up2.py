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
from app.models.video import Video
from app.worker.tasks import process_video_task
from sqlalchemy import text

TARGET_FOLDERS = [
    r"D:\_Xpig\up-3",
    r"D:\_Xpig\Uplode-2"
]
ADMIN_USER_ID = 1
CHECKPOINT_FILE = os.path.join(os.path.dirname(__file__), "processed_files_up_batches.json")

PREFIXES = [
    "Deshi Viral", "Exclusive Hot", "Deshi Leaked", "Trending Hot", 
    "Secret Viral", "Hot Romantic", "Uncut Deshi", "Real Viral", 
    "Exclusive Deshi", "Hot Romance", "Spicy Deshi", "Deshi Romance", 
    "Midnight Hot", "Secret Deshi", "Sensual Viral", "Pure Deshi", 
    "Super Hot", "Deshi College Girl", "Viral Deshi", "Extreme Hot", 
    "Sweet Deshi", "Passionate Hot", "Deshi Bhabhi", "Secret Romance",
    "Deshi Girlfriend", "Hot Leaked", "Viral Secret", "Spicy Romance",
    "Hot Deshi Scene", "Sensational Viral", "Wild Romance", "Deshi Lovers",
    "Midnight Deshi", "Ultra Hot", "Private Deshi", "Scandalous Deshi",
    "Forbidden Romance", "Tempting Hot", "Seductive Deshi", "Viral Midnight"
]

CORES = [
    "Viral Video Clip", "Private Scandal", "Hot Romance Moment", 
    "Deshi Scandal Tape", "Viral Bedroom Scene", "Leaked Romance Video", 
    "Romantic Scandal Clip", "Unseen Deshi Moment", "Hot Viral Romance", 
    "Secret Room Scandal", "Midnight Viral Video", "Romantic Couple Tape", 
    "Deshi Hot Video", "Viral Romantic Clip", "Secret Romance Scene",
    "Private Hotel Scene", "Uncut Romantic Tape", "Passionate Love Moment",
    "Secret Lover Tape", "Private Romance Session", "Intimate Romance Moment",
    "Deshi Intimate Clip", "Late Night Scandal", "Hidden Romance Video",
    "Sensational Bedroom Tape", "Sweet Romantic Clip", "Deshi Passion Tape"
]

SUFFIXES = [
    "Full HD Video", "Uncut Clip", "Full HD Recording", "Trending Clip", 
    "Viral Romance", "Exclusive Tape", "Must Watch Clip", "Private Clip", 
    "Watch Online", "Top Trending Video", "Special Edition", "Exclusive Release",
    "Raw Uncut Version", "Original Recording", "Leaked Session", "Premium HD",
    "Uncensored Cut", "HQ Stream", "Ultra HD Special", "Full Length Recording"
]

USED_TITLES = set()

def generate_custom_title():
    for _ in range(1000):
        p = random.choice(PREFIXES)
        c = random.choice(CORES)
        s = random.choice(SUFFIXES)
        title = f"{p} {c} - {s}"
        # Strictly remove any digits
        title = re.sub(r'\d+', '', title).strip()
        title = re.sub(r'\s+', ' ', title)
        if title not in USED_TITLES:
            USED_TITLES.add(title)
            return title
    # Fallback unique title
    adj = random.choice(["Sensational", "Breathtaking", "Exquisite", "Forbidden", "Intense"])
    noun = random.choice(["Deshi Romance", "Midnight Passion", "Secret Scandal", "Viral Intimacy"])
    return f"{adj} {noun} Special Cut"

def is_valid_video(filepath):
    if not os.path.exists(filepath):
        return False
    try:
        if os.path.getsize(filepath) < 50000:
            return False
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
    
    # Collect all video files from all target folders
    all_files = []
    for folder in TARGET_FOLDERS:
        if not os.path.exists(folder):
            print(f"Warning: Folder not found: {folder}")
            continue
        folder_files = sorted([
            os.path.join(folder, f) for f in os.listdir(folder)
            if os.path.splitext(f)[1].lower() in valid_exts
        ])
        all_files.extend(folder_files)
        print(f"Discovered in {folder}: {len(folder_files)} videos")

    # Load checkpoint
    processed_set = set()
    if os.path.exists(CHECKPOINT_FILE):
        try:
            with open(CHECKPOINT_FILE, "r") as f:
                processed_set = set(json.load(f))
        except Exception:
            pass

    pending_files = [f for f in all_files if os.path.basename(f) not in processed_set]

    print("=" * 60)
    print(f"TOTAL VIDEOS ACROSS FOLDERS: {len(all_files)}")
    print(f"ALREADY PROCESSED: {len(processed_set)}")
    print(f"PENDING TO UPLOAD: {len(pending_files)}")
    print("=" * 60)

    if limit:
        pending_files = pending_files[:limit]
        print(f"Processing next {limit} files in this batch...")

    categories_list = [1, 2, 3, 4, 5, 6, 7, 8, 9]

    for i, filepath in enumerate(pending_files, 1):
        filename = os.path.basename(filepath)
        
        # Verify valid video
        if not is_valid_video(filepath):
            print(f"\n[{i}/{len(pending_files)}] Skipping invalid or missing file: {filename}")
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
                
                # Add 2 categories to video_categories
                selected_cats = random.sample(categories_list, 2)
                for cat_id in selected_cats:
                    await db.execute(text(
                        "INSERT INTO video_categories (video_id, category_id) VALUES (:v, :c) ON CONFLICT DO NOTHING"
                    ), {"v": video_id, "c": cat_id})
                await db.commit()
                
                print(f"   [DB] Created Video ID {video_id} (Categories: {selected_cats})")

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
    print("ALL BATCH UPLOADS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    limit_arg = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else None
    asyncio.run(run_upload(limit=limit_arg))
