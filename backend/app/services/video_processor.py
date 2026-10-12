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
        
    # Scale logo to 7% video width and set opacity to 40% (0.40)
    cmd = [
        "ffmpeg", "-y", "-i", input_path, "-i", watermark_path,
        "-filter_complex", "[1:v]scale=w=trunc(iw*0.07/2)*2:h=-2,format=rgba,colorchannelmixer=aa=0.40[wm];[0:v][wm]overlay=W-w-15:H-h-15:eof_action=repeat[outv]",
        "-map", "[outv]", "-map", "0:a?",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
        "-c:a", "copy",
        output_path
    ]
    import subprocess
    subprocess.run(cmd, check=True, capture_output=True)

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
