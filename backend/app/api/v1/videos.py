from typing import Any, List, Optional
import os
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from arq import create_pool
from arq.connections import RedisSettings

from app.db.session import get_db
from app.models.video import Video, VideoSource
from app.api.deps import get_current_user
from app.models.user import User
import uuid
from app.schemas.video import Video as VideoSchema, VideoCreate, VideoSourceCreate
from app.services.media_provider import SelfHostedProvider # Replace with factory

router = APIRouter()

from sqlalchemy.orm import selectinload

@router.get("/", response_model=List[VideoSchema])
async def get_videos(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(Video).options(selectinload(Video.sources)).offset(skip).limit(limit))
    videos = result.scalars().all()
    return videos

class VideoCreateWithStatus(VideoCreate):
    status: Optional[str] = "PUBLISHED"

@router.post("/", response_model=VideoSchema)
async def create_video(
    video_in: VideoCreateWithStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    user_id = current_user.id 
    
    video = Video(
        title=video_in.title,
        description=video_in.description,
        visibility=video_in.visibility,
        thumbnail_url=video_in.thumbnail_url,
        status=video_in.status,
        creator_id=user_id
    )
    db.add(video)
    await db.commit()
    await db.refresh(video)
    return video

@router.post("/{video_id}/sources")
async def add_video_source(
    video_id: int,
    source_in: VideoSourceCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Attach an external source or upload URL to the video.
    Validates permissions using MediaProvider.
    """
    video_result = await db.execute(select(Video).where(Video.id == video_id))
    video = video_result.scalars().first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    provider = SelfHostedProvider()
    is_valid = await provider.validate_source(source_in.source_url)
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Source URL is invalid or unauthorized")
        
    source = VideoSource(
        video_id=video.id,
        source_type=source_in.source_type,
        source_provider=source_in.source_provider,
        source_url=source_in.source_url,
        resolution=source_in.resolution,
        mime_type=source_in.mime_type
    )
    
    db.add(source)
    await db.commit()
    return {"message": "Source added successfully"}

@router.get("/{video_id}", response_model=VideoSchema)
async def get_video(
    video_id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(Video).options(selectinload(Video.sources)).where(Video.id == video_id))
    video = result.scalars().first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    # In a real app, check visibility and user permissions (age gate verification)
    return video

@router.post("/upload")
async def upload_video(
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
        
    user_id = current_user.id
    
    # 1. Create Video DB record in 'PENDING' state
    video = Video(
        title=title,
        description=description,
        visibility="PRIVATE",
        creator_id=user_id,
        status="PENDING"
    )
    db.add(video)
    await db.commit()
    await db.refresh(video)
    
    # 2. Save raw file to a staging directory
    staging_dir = f"D:/tmp/pig_uploads/{video.id}"
    os.makedirs(staging_dir, exist_ok=True)
    # Fix Path Traversal Risk
    ext = os.path.splitext(file.filename)[1]
    safe_filename = f"{uuid.uuid4()}{ext}"
    input_path = os.path.join(staging_dir, safe_filename)
    
    async with aiofiles.open(input_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
        
    output_dir = f"D:/tmp/pig_hls/{video.id}"
    
    # 3. Use FastAPI BackgroundTasks
    from app.worker.tasks import process_video_task
    background_tasks.add_task(process_video_task, None, video.id, input_path, output_dir)
    
    return {"status": "uploading", "video_id": video.id, "title": video.title}

from pydantic import BaseModel

class PingPayload(BaseModel):
    watch_time: int
    is_new_view: bool = False

@router.post("/{video_id}/ping")
async def ping_video(
    video_id: int,
    payload: PingPayload,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalars().first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    video.total_watch_seconds = (video.total_watch_seconds or 0) + payload.watch_time
    if payload.is_new_view:
        video.views = (video.views or 0) + 1
        
    await db.commit()
    return {"status": "ok"}
