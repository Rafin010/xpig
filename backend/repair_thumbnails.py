import os
import sys
import asyncio
import subprocess
import tempfile
import urllib.request
import logging

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.taxonomy import Category, Tag
from app.models.video import Video, VideoSource
from app.models.storage import StorageNode
from app.services.storage_service import StorageService
from sqlalchemy import text

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("repair_thumbnails")

async def repair_missing_thumbnails():
    async with SessionLocal() as db:
        # Get active storage node
        node_row = (await db.execute(text("SELECT id, name, account_id, access_key_id, secret_access_key, bucket_name, public_url FROM storage_nodes WHERE is_active = true"))).mappings().first()
        if not node_row:
            logger.error("No active storage node found!")
            return
        
        node = StorageNode(
            id=node_row["id"],
            name=node_row["name"],
            account_id=node_row["account_id"],
            access_key_id=node_row["access_key_id"],
            secret_access_key=node_row["secret_access_key"],
            bucket_name=node_row["bucket_name"],
            public_url=node_row["public_url"]
        )

        # Find videos without thumbnail
        query = text("""
            SELECT v.id, v.title, v.thumbnail_url, v.preview_url, v.status,
                   vs.source_url
            FROM videos v
            LEFT JOIN video_sources vs ON v.id = vs.video_id
            WHERE v.status = 'PUBLISHED' AND (v.thumbnail_url IS NULL OR v.thumbnail_url = '')
        """)
        rows = (await db.execute(query)).mappings().all()
        logger.info(f"Found {len(rows)} published videos missing thumbnails.")

        for r in rows:
            vid = r["id"]
            title = r["title"]
            video_url = r["source_url"] or r["preview_url"]

            if not video_url:
                logger.warning(f"Video {vid} has no stream URL. Unpublishing to DRAFT status...")
                await db.execute(text(f"UPDATE videos SET status = 'DRAFT' WHERE id = {vid}"))
                await db.commit()
                continue

            logger.info(f"Processing Video {vid}: '{title}' using stream {video_url}")
            
            with tempfile.TemporaryDirectory() as tmpdir:
                thumb_path = os.path.join(tmpdir, f"thumb_{vid}.jpg")
                
                # Extract frame at 4s using ffmpeg directly from stream with browser User-Agent
                cmd = [
                    "ffmpeg", "-y", "-user_agent", "Mozilla/5.0", "-ss", "00:00:04", "-i", video_url,
                    "-frames:v", "1", "-q:v", "2", thumb_path
                ]
                proc = subprocess.run(cmd, capture_output=True, timeout=30)
                
                # Fallback to 1s if 4s failed
                if not os.path.exists(thumb_path) or os.path.getsize(thumb_path) == 0:
                    fallback_cmd = [
                        "ffmpeg", "-y", "-user_agent", "Mozilla/5.0", "-ss", "00:00:01", "-i", video_url,
                        "-frames:v", "1", "-q:v", "2", thumb_path
                    ]
                    subprocess.run(fallback_cmd, capture_output=True, timeout=20)
                
                # Fallback to 0s if 1s failed
                if not os.path.exists(thumb_path) or os.path.getsize(thumb_path) == 0:
                    fallback_cmd0 = [
                        "ffmpeg", "-y", "-user_agent", "Mozilla/5.0", "-i", video_url,
                        "-frames:v", "1", "-q:v", "2", thumb_path
                    ]
                    subprocess.run(fallback_cmd0, capture_output=True, timeout=20)

                if os.path.exists(thumb_path) and os.path.getsize(thumb_path) > 0:
                    thumb_dest = f"videos/{vid}/thumb.jpg"
                    logger.info(f"Uploading thumbnail for Video {vid} to R2: {thumb_dest}")
                    
                    thumb_url = StorageService.upload_file_to_r2(
                        thumb_path,
                        thumb_dest,
                        node
                    )
                    
                    if thumb_url:
                        await db.execute(text("UPDATE videos SET thumbnail_url = :url WHERE id = :vid"), {"url": thumb_url, "vid": vid})
                        await db.commit()
                        logger.info(f"SUCCESS: Video {vid} updated with thumbnail: {thumb_url}")
                else:
                    logger.error(f"Failed to extract thumbnail for Video {vid}")

    logger.info("Repair process finished.")

if __name__ == "__main__":
    asyncio.run(repair_missing_thumbnails())
