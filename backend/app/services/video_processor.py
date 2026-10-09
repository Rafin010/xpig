import ffmpeg
import os
import asyncio

async def add_watermark(input_path: str, output_path: str, watermark_path: str = "watermark.png"):
    """
    Overlays a watermark image onto the video at the bottom right corner.
    """
    try:
        # Run ffmpeg synchronously via asyncio.to_thread
        await asyncio.to_thread(_run_ffmpeg, input_path, output_path, watermark_path)
        return True
    except Exception as e:
        print(f"Error processing video: {e}")
        return False

def _run_ffmpeg(input_path, output_path, watermark_path):
    # Ensure paths are absolute if needed, or relative to current dir
    if not os.path.exists(watermark_path):
        raise FileNotFoundError(f"Watermark not found at {watermark_path}")
        
    main = ffmpeg.input(input_path)
    logo = ffmpeg.input(watermark_path)
    
    # Scale logo and overlay at bottom right
    # 10px padding from right (W-w-10), 10px from bottom (H-h-10)
    (
        ffmpeg
        .filter([main, logo], 'overlay', 'W-w-10', 'H-h-10')
        .output(output_path, vcodec='libx264', acodec='copy')
        .overwrite_output()
        .run(capture_stdout=True, capture_stderr=True)
    )

async def extract_thumbnail(input_path: str, output_path: str, time: str = "00:00:02"):
    """
    Extracts a frame from the video to use as thumbnail.
    """
    try:
        await asyncio.to_thread(_run_ffmpeg_thumbnail, input_path, output_path, time)
        return True
    except Exception as e:
        print(f"Error extracting thumbnail: {e}")
        return False

def _run_ffmpeg_thumbnail(input_path, output_path, time):
    (
        ffmpeg
        .input(input_path, ss=time)
        .filter('scale', 1280, -1)
        .output(output_path, vframes=1)
        .overwrite_output()
        .run(capture_stdout=True, capture_stderr=True)
    )
