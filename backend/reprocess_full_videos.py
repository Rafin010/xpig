import os
import sys
import glob
import asyncio
import shutil
import logging

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.main import app
from app.db.session import SessionLocal
from app.models.video import Video, VideoSource
from app.worker.tasks import process_video_task
from sqlalchemy import select

TARGET_DIR = r"D:\XPIG-STORAG"
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("reprocess")

async def reprocess_batch(limit=10):
    print(f"Scanning {TARGET_DIR} for MP4 source files...")
    mp4_files = sorted(glob.glob(os.path.join(TARGET_DIR, "**", "*.mp4"), recursive=True))
    if not mp4_files:
        print("No source files found in target dir!")
        return

    print(f"Total source files available: {len(mp4_files)}")

    # Fetch recently created/published videos from DB to reprocess
    async with SessionLocal() as db:
        stmt = select(Video).order_by(Video.id.desc()).limit(limit)
        result = await db.execute(stmt)
        recent_videos = result.scalars().all()

    if not recent_videos:
        print("No videos found in DB.")
        return

    print(f"Starting reprocessing for {len(recent_videos)} videos (IDs: {[v.id for v in recent_videos]})...")
    print("----------------------------------------------------------------------")

    for idx, video in enumerate(recent_videos):
        # Match with an mp4 file (cycling or mapping by index)
        file_idx = (video.id - 1) % len(mp4_files)
        filepath = mp4_files[file_idx]
        filename = os.path.basename(filepath)
        
        print(f"\n[{idx+1}/{len(recent_videos)}] Processing Video ID {video.id} ({video.title[:40]}...)")
        print(f"   -> Source File: {filename}")
        
        staging_dir = f"D:/tmp/reprocess_uploads/{video.id}"
        os.makedirs(staging_dir, exist_ok=True)
        input_copy = os.path.join(staging_dir, f"input_{video.id}.mp4")
        shutil.copy2(filepath, input_copy)
        
        output_dir = f"D:/tmp/reprocess_out/{video.id}"
        os.makedirs(output_dir, exist_ok=True)
        
        try:
            res = await process_video_task(None, video.id, input_copy, output_dir)
            if res.get("status") == "success":
                print(f"   -> [SUCCESS] Video ID {video.id} full video uploaded: {res.get('url')}")
            else:
                print(f"   -> [FAILED] {res.get('message')}")
        except Exception as e:
            print(f"   -> [ERROR] Failed processing: {e}")
        finally:
            if os.path.exists(staging_dir):
                shutil.rmtree(staging_dir, ignore_errors=True)
            if os.path.exists(output_dir):
                shutil.rmtree(output_dir, ignore_errors=True)

    print("\nBatch reprocessing completed!")

if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    asyncio.run(reprocess_batch(count))
