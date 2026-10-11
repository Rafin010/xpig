from typing import Any, List, Optional
import os
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy import select, delete, desc
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
    from sqlalchemy import desc
    result = await db.execute(
        select(Video)
        .options(selectinload(Video.sources))
        .where(Video.status == "PUBLISHED")
        .order_by(desc(Video.id))
        .offset(skip)
        .limit(limit)
    )
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
    return {"status": "ok", "views": video.views or 0, "total_watch_seconds": video.total_watch_seconds or 0}

class LikePayload(BaseModel):
    action: Optional[str] = "toggle"
    is_liked: Optional[bool] = None

@router.post("/{video_id}/like")
async def toggle_video_like(
    video_id: int,
    payload: Optional[LikePayload] = None,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalars().first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    current_likes = video.likes or 0
    if payload and payload.is_liked is not None:
        if payload.is_liked:
            current_likes += 1
            new_is_liked = True
        else:
            current_likes = max(0, current_likes - 1)
            new_is_liked = False
    elif payload and payload.action == "unlike":
        current_likes = max(0, current_likes - 1)
        new_is_liked = False
    elif payload and payload.action == "like":
        current_likes += 1
        new_is_liked = True
    else:
        current_likes += 1
        new_is_liked = True

    video.likes = current_likes
    await db.commit()
    return {"status": "ok", "likes": video.likes, "is_liked": new_is_liked}

@router.delete("/{video_id}")
async def delete_video(
    video_id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Permanently delete video and all associated video sources.
    """
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalars().first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Remove all video sources
    await db.execute(delete(VideoSource).where(VideoSource.video_id == video_id))
    await db.delete(video)
    await db.commit()
    return {"success": True, "message": f"Video {video_id} deleted successfully"}

class VideoUpdatePayload(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[str] = None
    status: Optional[str] = None
    thumbnail_url: Optional[str] = None

@router.patch("/{video_id}")
async def update_video(
    video_id: int,
    payload: VideoUpdatePayload,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Update video title, description, visibility, and status.
    """
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalars().first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if payload.title is not None:
        video.title = payload.title.strip()
    if payload.description is not None:
        video.description = payload.description.strip()
    if payload.visibility is not None:
        video.visibility = payload.visibility
    if payload.status is not None:
        video.status = payload.status
    if payload.thumbnail_url is not None:
        video.thumbnail_url = payload.thumbnail_url

    await db.commit()
    await db.refresh(video)
    return {"success": True, "video": video}

@router.post("/admin-upload")
async def admin_direct_upload(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(""),
    visibility: Optional[str] = Form("PUBLIC"),
    status: Optional[str] = Form("PUBLISHED"),
    thumbnail_url: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Ultra-fast direct upload from admin's device to Cloudflare R2 storage.
    """
    from app.services.storage import storage_service
    from app.models.storage import StorageNode
    
    # 1. Save temp file
    os.makedirs("temp", exist_ok=True)
    temp_ext = os.path.splitext(file.filename or ".mp4")[1] or ".mp4"
    temp_filename = f"temp/{uuid.uuid4()}{temp_ext}"
    
    file_bytes = await file.read()
    file_size = len(file_bytes)
    
    with open(temp_filename, "wb") as f:
        f.write(file_bytes)
        
    try:
        # 2. Upload to Cloudflare R2
        r2_object_name = f"videos/admin/{uuid.uuid4()}{temp_ext}"
        r2_video_url = storage_service.upload_file(
            temp_filename, 
            object_name=r2_object_name, 
            content_type=file.content_type or "video/mp4"
        )
        
        # 3. Create Video Record
        new_video = Video(
            title=title.strip(),
            description=(description or "").strip(),
            visibility=visibility or "PUBLIC",
            status=status or "PUBLISHED",
            thumbnail_url=thumbnail_url or "https://pub-1080459c8c0a45b9a545f0b3b3fb21c1.r2.dev/videos/default_thumb.jpg",
            preview_url=r2_video_url,
            creator_id=1,
            views=0,
            likes=0,
            total_watch_seconds=0
        )
        db.add(new_video)
        await db.commit()
        await db.refresh(new_video)
        
        # 4. Attach VideoSource
        new_source = VideoSource(
            video_id=new_video.id,
            source_type="DIRECT_URL",
            source_provider="CLOUDFLARE_R2",
            source_url=r2_video_url,
            resolution="Original",
            mime_type=file.content_type or "video/mp4"
        )
        db.add(new_source)
        
        # 5. Update active storage node bytes
        active_node_res = await db.execute(select(StorageNode).where(StorageNode.is_active == True))
        active_node = active_node_res.scalars().first()
        if active_node:
            active_node.total_used_bytes = (active_node.total_used_bytes or 0) + file_size
            
        await db.commit()
        await db.refresh(new_video)
        
        return {
            "success": True,
            "message": "Video uploaded successfully to Cloudflare R2",
            "video": {
                "id": new_video.id,
                "title": new_video.title,
                "description": new_video.description,
                "thumbnail_url": new_video.thumbnail_url,
                "preview_url": new_video.preview_url,
                "status": new_video.status,
                "visibility": new_video.visibility,
                "created_at": new_video.created_at.isoformat() if new_video.created_at else None,
                "views": new_video.views,
                "likes": new_video.likes
            }
        }
    finally:
        if os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except Exception:
                pass

