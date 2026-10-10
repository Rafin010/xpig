const fs = require('fs');

const path = "d:/_Xpig/backend/app/worker/tasks.py";
let code = fs.readFileSync(path, 'utf8');

// 1. Add preview extraction logic right after thumbnail extraction
const oldThumbLogic = `    await thumb_process.communicate()`;
const newPreviewLogic = `    await thumb_process.communicate()
    
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
    await preview_process.communicate()`;

if (code.includes(oldThumbLogic)) {
  code = code.replace(oldThumbLogic, newPreviewLogic);
}

// 2. Upload Preview clip right after thumbnail upload
const oldThumbUpload = `            thumbnail_url = await loop.run_in_executor(
                None,
                StorageService.upload_file_to_r2,
                thumbnail_path,
                thumb_dest,
                active_node
            )`;

const newPreviewUpload = `            thumbnail_url = await loop.run_in_executor(
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
            )`;

if (code.includes(oldThumbUpload)) {
  code = code.replace(oldThumbUpload, newPreviewUpload);
}

// 3. Update Video record with preview_url
const oldVideoUpdate = `        if thumbnail_url:
            video.thumbnail_url = thumbnail_url`;

const newVideoUpdate = `        if thumbnail_url:
            video.thumbnail_url = thumbnail_url
        if preview_url:
            video.preview_url = preview_url`;

if (code.includes(oldVideoUpdate)) {
  code = code.replace(oldVideoUpdate, newVideoUpdate);
}

// 4. Cleanup preview_path
const oldCleanup = `            if os.path.exists(thumbnail_path):
                os.remove(thumbnail_path)`;

const newCleanup = `            if os.path.exists(thumbnail_path):
                os.remove(thumbnail_path)
            if os.path.exists(preview_path):
                os.remove(preview_path)`;

if (code.includes(oldCleanup)) {
  code = code.replace(oldCleanup, newCleanup);
}

fs.writeFileSync(path, code);
console.log("Updated tasks.py with preview extraction and upload.");
