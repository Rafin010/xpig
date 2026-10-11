import os
import sys
import glob
import random
import asyncio
import shutil
import logging

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.main import app
from app.db.session import SessionLocal
from app.models.video import Video
from app.worker.tasks import process_video_task

TARGET_DIR = r"D:\_Xpig\XPIG-STORAG"
ADMIN_USER_ID = 1

DESHI_PREFIXES = ["Exclusive viral", "New leaked", "Secret camera", "Hot scandal", "Trending viral", "Hidden camera", "Leaked private tape", "Village girl", "Exclusive hidden"]
DESHI_SUFFIXES = ["full video", "part 1", "uncut", "hd recording", "must watch", "scandal", "real video"]

def generate_title(index):
    return f"{random.choice(DESHI_PREFIXES)} deshi link {random.choice(DESHI_SUFFIXES)} - Vol {index}"

async def main():
    print(f"Scanning {TARGET_DIR} for MP4 files...")
    mp4_files = sorted(glob.glob(os.path.join(TARGET_DIR, "**", "*.mp4"), recursive=True))
    
    if not mp4_files:
        print("No MP4 files found.")
        return

    # SKIP FIRST 25 FILES WHICH WERE ALREADY PUBLISHED SUCCESSFULLY
    skip_count = 102
    remaining_files = mp4_files[skip_count:]
    
    print(f"Found {len(mp4_files)} videos. Skipping first {skip_count}. Starting Sequential Processing for {len(remaining_files)} videos...")
    print("----------------------------------------------------------")
    
    for i, filepath in enumerate(remaining_files, skip_count + 1):
        filename = os.path.basename(filepath)
        title = generate_title(i)
        print(f"\n[{i}/{len(mp4_files)}] Processing: {filename}\n   -> Title: '{title}'")
        
        try:
            async with SessionLocal() as db:
                video = Video(
                    title=title,
                    description="Auto-uploaded from XPIG-STORAG bulk archive.",
                    visibility="PRIVATE",
                    creator_id=ADMIN_USER_ID,
                    status="PENDING"
                )
                db.add(video)
                await db.commit()
                await db.refresh(video)
                video_id = video.id
                
            print(f"   [DB] Created Video ID {video_id}")
            
            staging_dir = f"D:/tmp/pig_uploads/{video_id}"
            os.makedirs(staging_dir, exist_ok=True)
            input_path = os.path.join(staging_dir, f"raw_{video_id}.mp4")
            shutil.copy2(filepath, input_path)
            
            output_dir = f"D:/tmp/pig_hls/{video_id}"
            
            print(f"   [FFMPEG] Starting video processing for ID {video_id}...")
            # We pass None for 'ctx' since process_video_task doesn't use it directly
            result = await process_video_task(None, video_id, input_path, output_dir)
            if result.get("status") == "success":
                print(f"   [SUCCESS] Finished processing {filename}")
            else:
                print(f"   [FAILED] {result.get('message')}")
            
            if os.path.exists(staging_dir):
                shutil.rmtree(staging_dir)
            if os.path.exists(output_dir):
                shutil.rmtree(output_dir)
                
        except Exception as e:
            print(f"   [ERROR] Failed processing {filename}: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())


