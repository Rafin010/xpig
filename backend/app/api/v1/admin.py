from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.video import Video, VideoSource
from app.models.user import User
from app.api.deps import get_current_user
from app.services.video_processor import add_watermark, extract_thumbnail
from app.services.storage import storage_service
import os
import uuid

router = APIRouter()

@router.get("/stats")
async def get_platform_stats(db: AsyncSession = Depends(get_db)):
    """Return real counts from the database."""
    total_videos = await db.scalar(select(func.count(Video.id)))
    total_users = await db.scalar(select(func.count(User.id)))
    
    total_views = await db.scalar(select(func.sum(Video.views)))
    total_watch_seconds = await db.scalar(select(func.sum(Video.total_watch_seconds)))
    
    return {
        "total_videos": total_videos or 0,
        "total_users": total_users or 0,
        "total_views": total_views or 0,
        "total_watch_seconds": total_watch_seconds or 0
    }

from pydantic import BaseModel

class InvitePayload(BaseModel):
    email: str

@router.post("/cofounders")
async def add_cofounder(payload: InvitePayload, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalars().first()
    
    if user:
        # Just update their role
        user.is_cofounder = True
        await db.commit()
        return {"success": True, "message": "Updated existing user to co-founder"}
    
    # Create placeholder user
    username = payload.email.split('@')[0].lower() + "co"
    user = User(
        email=payload.email,
        username=username,
        hashed_password="invited_cofounder",
        is_cofounder=True
    )
    db.add(user)
    await db.commit()
    return {"success": True, "message": "Invited co-founder successfully"}

@router.get("/cofounders")
async def get_cofounders(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.is_cofounder == True))
    users = result.scalars().all()
    
    return [
        {
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "last_active": u.last_active.isoformat() if u.last_active else None
        }
        for u in users
    ]

# --- Upload Pipeline Background Task ---
async def process_and_upload_video(
    temp_video_path: str, 
    video_id: int, 
    db: AsyncSession
):
    try:
        processed_video_path = temp_video_path.replace(".mp4", "_watermarked.mp4")
        thumbnail_path = temp_video_path.replace(".mp4", "_thumb.jpg")
        
        # 1. Add Watermark
        print(f"[{video_id}] Processing watermark...")
        await add_watermark(temp_video_path, processed_video_path)
        
        # 2. Extract Thumbnail
        print(f"[{video_id}] Extracting thumbnail...")
        await extract_thumbnail(processed_video_path, thumbnail_path)
        
        # 3. Upload to R2
        print(f"[{video_id}] Uploading to R2...")
        video_url = storage_service.upload_file(processed_video_path, content_type="video/mp4")
        thumbnail_url = storage_service.upload_file(thumbnail_path, content_type="image/jpeg")
        
        # 4. Update Database
        print(f"[{video_id}] Updating database...")
        async with db.begin():
            video = await db.get(Video, video_id)
            video.status = "PUBLISHED"
            video.thumbnail_url = thumbnail_url
            
            new_source = VideoSource(
                video_id=video_id,
                source_type="OBJECT_STORAGE",
                source_provider="CloudflareR2",
                source_url=video_url,
                mime_type="video/mp4"
            )
            db.add(new_source)
        await db.commit()
        print(f"[{video_id}] Processing complete!")
        
    except Exception as e:
        print(f"[{video_id}] Error in background task: {e}")
        # Mark as FAILED
        async with db.begin():
            video = await db.get(Video, video_id)
            if video:
                video.status = "FAILED"
        await db.commit()
    finally:
        # Cleanup temp files
        for p in [temp_video_path, processed_video_path, thumbnail_path]:
            if os.path.exists(p):
                os.remove(p)

@router.post("/videos/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    description: str = Form(""),
    category: str = Form("All"),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Receives raw video, creates DB entry as PENDING, and kicks off background task.
    """
    if not current_user.is_superuser and not current_user.is_cofounder:
        raise HTTPException(status_code=403, detail="Not authorized to upload")
        
    if not file.filename.endswith(".mp4"):
        raise HTTPException(status_code=400, detail="Only MP4 files are supported for now")

    # 1. Create DB entry as PENDING
    new_video = Video(
        title=title,
        description=description,
        creator_id=current_user.id,
        status="PROCESSING",
        visibility="PUBLIC",
        category=category
    )
    db.add(new_video)
    await db.commit()
    await db.refresh(new_video)
    
    # 2. Save raw file to temp
    os.makedirs("temp", exist_ok=True)
    temp_path = f"temp/{uuid.uuid4()}.mp4"
    with open(temp_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    # 3. Add to Background Tasks
    background_tasks.add_task(
        process_and_upload_video, 
        temp_path, 
        new_video.id, 
        db
    )
    
    return {"message": "Upload started, processing in background.", "video_id": new_video.id}
