const fs = require('fs');

const path = "d:/_Xpig/backend/app/api/v1/videos.py";
let code = fs.readFileSync(path, 'utf8');

// Add imports
if (!code.includes('from app.api.deps import get_current_user')) {
    code = code.replace(
        "from app.models.video import Video, VideoSource", 
        "from app.models.video import Video, VideoSource\nfrom app.api.deps import get_current_user\nfrom app.models.user import User\nimport uuid"
    );
}

// 1. Update create_video
const oldCreate = `async def create_video(
    video_in: VideoCreateWithStatus,
    db: AsyncSession = Depends(get_db)
) -> Any:
    # In production, extract user_id from auth token
    user_id = 1`;

const newCreate = `async def create_video(
    video_in: VideoCreateWithStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    user_id = current_user.id`;

if (code.includes(oldCreate)) {
    code = code.replace(oldCreate, newCreate);
} else {
    code = code.replace(oldCreate.replace(/\n/g, '\r\n'), newCreate);
}

// 2. Update upload_video and fix path traversal
const oldUpload = `async def upload_video(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Secure endpoint for uploading a video file.
    Validates MIME type, streams file to staging, and enqueues processing job.
    """
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Must be a video.")
        
    user_id = 1 # Mock authenticated user`;

const newUpload = `async def upload_video(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Secure endpoint for uploading a video file.
    Validates MIME type, streams file to staging, and enqueues processing job.
    """
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Must be a video.")
        
    user_id = current_user.id`;

if (code.includes(oldUpload)) {
    code = code.replace(oldUpload, newUpload);
} else {
    code = code.replace(oldUpload.replace(/\n/g, '\r\n'), newUpload);
}

// Fix Path Traversal
const oldPath = `    input_path = os.path.join(staging_dir, file.filename)`;
const newPath = `    # Fix Path Traversal Risk
    ext = os.path.splitext(file.filename)[1]
    safe_filename = f"{uuid.uuid4()}{ext}"
    input_path = os.path.join(staging_dir, safe_filename)`;

if (code.includes(oldPath)) {
    code = code.replace(oldPath, newPath);
} else {
    code = code.replace(oldPath.replace(/\n/g, '\r\n'), newPath);
}

fs.writeFileSync(path, code);
console.log("Updated videos.py with JWT auth and Path Traversal fix.");
