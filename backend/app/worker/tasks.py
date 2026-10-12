import os
import asyncio
import logging
import subprocess
from pathlib import Path
from app.db.session import SessionLocal
from app.models.video import Video, VideoSource
from app.models.storage import StorageNode
from app.services.storage_service import StorageService

logger = logging.getLogger(__name__)

async def process_video_task(ctx, video_id: int, input_path: str, output_dir: str):
    logger.info(f"Starting video processing for video_id={video_id}")
    
    os.makedirs(output_dir, exist_ok=True)
    watermarked_path = os.path.join(output_dir, f"video_{video_id}_wm.mp4")
    watermark_image = "D:/_Xpig/backend/watermark.png"
    
    file_size_bytes = os.path.getsize(input_path)
    
    ffmpeg_cmd = [
        "ffmpeg", "-y", "-i", input_path, "-i", watermark_image,
        "-filter_complex", "[1:v]scale=w=trunc(iw*0.15/2)*2:h=-2[wm];[0:v][wm]overlay=W-w-10:H-h-10:eof_action=repeat[outv]",
        "-map", "[outv]", "-map", "0:a?",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast", "-crf", "23",
        "-c:a", "copy",
        watermarked_path
    ]
    
    logger.info(f"Executing: {' '.join(ffmpeg_cmd)}")
    
    loop = asyncio.get_running_loop()
    process = await loop.run_in_executor(
        None,
        lambda: subprocess.run(ffmpeg_cmd, capture_output=True)
    )
    
    if process.returncode != 0:
        logger.error(f"FFmpeg failed: {process.stderr.decode()}")
        return {"status": "error", "message": "FFmpeg processing failed"}
        
    final_file_size = os.path.getsize(watermarked_path)
    
    thumbnail_path = os.path.join(output_dir, f"thumb_{video_id}.jpg")
    ffmpeg_thumb_cmd = [
        "ffmpeg", "-y", "-ss", "00:00:05", "-i", input_path,
        "-frames:v", "1", "-q:v", "2", thumbnail_path
    ]
    logger.info(f"Extracting thumbnail: {' '.join(ffmpeg_thumb_cmd)}")
    await loop.run_in_executor(
        None,
        lambda: subprocess.run(ffmpeg_thumb_cmd, capture_output=True)
    )
    
    preview_path = os.path.join(output_dir, f"preview_{video_id}.mp4")
    ffmpeg_preview_cmd = [
        "ffmpeg", "-y", "-ss", "00:00:05", "-t", "00:00:05", "-i", input_path,
        "-vf", "scale=640:-2", "-an", "-c:v", "libx264", "-crf", "28", "-preset", "ultrafast", preview_path
    ]
    logger.info(f"Extracting preview clip: {' '.join(ffmpeg_preview_cmd)}")
    await loop.run_in_executor(
        None,
        lambda: subprocess.run(ffmpeg_preview_cmd, capture_output=True)
    )
    
    # --- PHASE 1: Quick DB check to get active R2 node credentials ---
    async with SessionLocal() as db:
        active_node = await StorageService.get_active_node(db, final_file_size)
        if not active_node:
            logger.error("No available R2 storage node found!")
            return {"status": "error", "message": "Storage limit reached"}
            
        node_id = active_node.id
        node_data = StorageNode(
            id=active_node.id,
            name=active_node.name,
            account_id=active_node.account_id,
            access_key_id=active_node.access_key_id,
            secret_access_key=active_node.secret_access_key,
            bucket_name=active_node.bucket_name,
            public_url=active_node.public_url
        )
    # DB session is now CLOSED during network uploads!
    
    # --- PHASE 2: Upload assets to Cloudflare R2 ---
    thumbnail_url = None
    if os.path.exists(thumbnail_path):
        thumb_dest = f"videos/{video_id}/thumb.jpg"
        logger.info(f"Uploading thumbnail to R2 node {node_data.name} at {thumb_dest}")
        thumbnail_url = await loop.run_in_executor(
            None,
            StorageService.upload_file_to_r2,
            thumbnail_path,
            thumb_dest,
            node_data
        )
        
    preview_url = None
    if os.path.exists(preview_path):
        preview_dest = f"videos/{video_id}/preview.mp4"
        logger.info(f"Uploading preview clip to R2 node {node_data.name} at {preview_dest}")
        preview_url = await loop.run_in_executor(
            None,
            StorageService.upload_file_to_r2,
            preview_path,
            preview_dest,
            node_data
        )
        
    destination_name = f"videos/{video_id}/video_wm.mp4"
    logger.info(f"Uploading to R2 node {node_data.name} at {destination_name}")
    
    public_url = await loop.run_in_executor(
        None, 
        StorageService.upload_file_to_r2,
        watermarked_path,
        destination_name,
        node_data
    )
    
    # --- PHASE 3: Quick DB commit with a fresh connection ---
    async with SessionLocal() as db:
        node = await db.get(StorageNode, node_id)
        if node:
            node.total_used_bytes += final_file_size
            
        video = await db.get(Video, video_id)
        if video:
            video.status = "PUBLISHED"
            if thumbnail_url:
                video.thumbnail_url = thumbnail_url
            if preview_url:
                video.preview_url = preview_url
        
        source = VideoSource(
            video_id=video_id,
            source_type="DIRECT_URL",
            source_provider="CLOUDFLARE_R2",
            source_url=public_url,
            resolution="Original",
            mime_type="video/mp4"
        )
        db.add(source)
        await db.commit()
        logger.info(f"Video {video_id} successfully published at {public_url}")
        
    # --- Clean up local temp files ---
    try:
        os.remove(input_path)
        os.remove(watermarked_path)
        if os.path.exists(thumbnail_path):
            os.remove(thumbnail_path)
        if os.path.exists(preview_path):
            os.remove(preview_path)
    except Exception as e:
        logger.warning(f"Failed to cleanup temp files: {e}")
        
    return {"status": "success", "video_id": video_id, "url": public_url}
