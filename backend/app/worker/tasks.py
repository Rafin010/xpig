import os
import asyncio
import logging
from pathlib import Path
from app.db.session import SessionLocal
from app.models.video import Video, VideoSource
from app.services.storage_service import StorageService

logger = logging.getLogger(__name__)

async def process_video_task(ctx, video_id: int, input_path: str, output_dir: str):
    """
    Executes FFmpeg to add a watermark, then uploads the video to Cloudflare R2
    using the active storage node logic.
    """
    logger.info(f"Starting video processing for video_id={video_id}")
    
    os.makedirs(output_dir, exist_ok=True)
    watermarked_path = os.path.join(output_dir, f"video_{video_id}_wm.mp4")
    watermark_image = "D:/_Xpig/backend/watermark.png"
    
    # Check file size for space allocation
    # (Using the original file size as a rough estimate for the final file size)
    file_size_bytes = os.path.getsize(input_path)
    
    # FFmpeg command to add watermark
    # scale watermark to reasonable size (e.g., 150px wide), place in bottom-right corner
    ffmpeg_cmd = [
        "ffmpeg", "-y", "-i", input_path, "-i", watermark_image,
        "-filter_complex", "[1][0]scale2ref=w='iw*15/100':h='ow/mdar'[wm][vid];[vid][wm]overlay=W-w-10:H-h-10",
        "-c:a", "copy",
        watermarked_path
    ]
    
    logger.info(f"Executing: {' '.join(ffmpeg_cmd)}")
    
    # Run FFmpeg process
    process = await asyncio.create_subprocess_exec(
        *ffmpeg_cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await process.communicate()
    
    if process.returncode != 0:
        logger.error(f"FFmpeg failed: {stderr.decode()}")
        return {"status": "error", "message": "FFmpeg processing failed"}
        
    final_file_size = os.path.getsize(watermarked_path)
    
    # Extract thumbnail
    thumbnail_path = os.path.join(output_dir, f"thumb_{video_id}.jpg")
    ffmpeg_thumb_cmd = [
        "ffmpeg", "-y", "-ss", "00:00:05", "-i", input_path,
        "-frames:v", "1", "-q:v", "2", thumbnail_path
    ]
    logger.info(f"Extracting thumbnail: {' '.join(ffmpeg_thumb_cmd)}")
    thumb_process = await asyncio.create_subprocess_exec(
        *ffmpeg_thumb_cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    await thumb_process.communicate()
    
    # Extract 5-second lightweight preview clip
    preview_path = os.path.join(output_dir, f"preview_{video_id}.mp4")
    ffmpeg_preview_cmd = [
        "ffmpeg", "-y", "-ss", "00:00:05", "-t", "00:00:05", "-i", input_path,
        "-vf", "scale=640:-2", "-an", "-c:v", "libx264", "-crf", "28", "-preset", "ultrafast", preview_path
    ]
    logger.info(f"Extracting preview clip: {' '.join(ffmpeg_preview_cmd)}")
    preview_process = await asyncio.create_subprocess_exec(
        *ffmpeg_preview_cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    await preview_process.communicate()
    
    # Connect to DB to handle storage
    async with SessionLocal() as db:
        active_node = await StorageService.get_active_node(db, final_file_size)
        
        if not active_node:
            logger.error("No available R2 storage node found!")
            return {"status": "error", "message": "Storage limit reached"}
            
        # Upload Thumbnail if it was successfully created
        thumbnail_url = None
        loop = asyncio.get_running_loop()
        if os.path.exists(thumbnail_path):
            thumb_dest = f"videos/{video_id}/thumb.jpg"
            logger.info(f"Uploading thumbnail to R2 node {active_node.name} at {thumb_dest}")
            thumbnail_url = await loop.run_in_executor(
                None,
                StorageService.upload_file_to_r2,
                thumbnail_path,
                thumb_dest,
                active_node
            )
            
        # Upload Preview if it was successfully created
        preview_url = None
        if os.path.exists(preview_path):
            preview_dest = f"videos/{video_id}/preview.mp4"
            logger.info(f"Uploading preview clip to R2 node {active_node.name} at {preview_dest}")
            preview_url = await loop.run_in_executor(
                None,
                StorageService.upload_file_to_r2,
                preview_path,
                preview_dest,
                active_node
            )
            
        destination_name = f"videos/{video_id}/video_wm.mp4"
        logger.info(f"Uploading to R2 node {active_node.name} at {destination_name}")
        
        # Upload Video via boto3
        public_url = await loop.run_in_executor(
            None, 
            StorageService.upload_file_to_r2,
            watermarked_path,
            destination_name,
            active_node
        )
        
        # Update Node usage
        active_node.total_used_bytes += final_file_size
        
        # Update Video record
        video = await db.get(Video, video_id)
        video.status = "PUBLISHED"
        if thumbnail_url:
            video.thumbnail_url = thumbnail_url
        if preview_url:
            video.preview_url = preview_url
        
        # Add VideoSource
        source = VideoSource(
            video_id=video.id,
            source_type="DIRECT_URL",
            source_provider="CLOUDFLARE_R2",
            source_url=public_url,
            resolution="Original",
            mime_type="video/mp4"
        )
        db.add(source)
        
        await db.commit()
        logger.info(f"Video {video_id} successfully published at {public_url}")
        
        # Clean up local files
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
