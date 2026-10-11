from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.video import Video, VideoSource
from app.models.user import User
import os
import uuid
try:
    from app.services.video_processor import add_watermark, extract_thumbnail
    from app.services.storage import storage_service
except ImportError:
    pass # Wait until user installs requirements

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

import json
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional

class InvitePayload(BaseModel):
    email: str

class HeartbeatPayload(BaseModel):
    email: str
    duration_increment: Optional[int] = 1

def get_telemetry(user: User) -> dict:
    if user.age_verification_status and user.age_verification_status.startswith("{"):
        try:
            return json.loads(user.age_verification_status)
        except Exception:
            pass
    return {
        "lat": None,
        "lng": None,
        "maps_url": None,
        "ip": None,
        "duration_mins": 0,
        "is_online": False
    }

def update_telemetry(user: User, data: dict):
    current = get_telemetry(user)
    current.update(data)
    user.age_verification_status = json.dumps(current)

@router.post("/cofounders")
async def add_cofounder(payload: InvitePayload, db: AsyncSession = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    result = await db.execute(select(User).where(User.email == clean_email))
    user = result.scalars().first()
    
    if user:
        user.is_cofounder = True
        await db.commit()
        return {"success": True, "message": "Updated existing user to co-founder"}
    
    username = clean_email.split('@')[0].lower() + "co"
    user = User(
        email=clean_email,
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
    
    data = []
    now = datetime.now(timezone.utc)
    for u in users:
        t = get_telemetry(u)
        is_currently_online = False
        if u.last_active:
            # Active within last 3 minutes is considered online
            active_time = u.last_active
            if active_time.tzinfo is None:
                active_time = active_time.replace(tzinfo=timezone.utc)
            diff_mins = (now - active_time).total_seconds() / 60
            is_currently_online = diff_mins < 3

        data.append({
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "last_active": u.last_active.isoformat() if u.last_active else None,
            "is_online": is_currently_online,
            "latitude": t.get("lat"),
            "longitude": t.get("lng"),
            "maps_url": t.get("maps_url"),
            "ip": t.get("ip"),
            "duration_mins": t.get("duration_mins", 0)
        })
    return data

@router.post("/cofounders/heartbeat")
async def cofounder_heartbeat(payload: HeartbeatPayload, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email.strip().lower()))
    user = result.scalars().first()
    if not user or not user.is_cofounder:
        raise HTTPException(status_code=404, detail="Co-founder not found")
    
    user.last_active = datetime.now(timezone.utc)
    t = get_telemetry(user)
    new_dur = t.get("duration_mins", 0) + (payload.duration_increment or 1)
    update_telemetry(user, {"duration_mins": new_dur, "is_online": True})
    await db.commit()
    return {"status": "ok", "duration_mins": new_dur}

@router.delete("/cofounders/{user_id}")
async def revoke_cofounder(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_cofounder = False
    await db.commit()
    return {"success": True, "message": "Revoked co-founder access"}


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
    creator_id: int = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Receives raw video, creates DB entry as PENDING, and kicks off background task.
    """
    # Skipping auth check for now, frontend should pass creator_id of logged-in user
        
    if not file.filename.endswith(".mp4"):
        raise HTTPException(status_code=400, detail="Only MP4 files are supported for now")

    # 1. Create DB entry as PENDING
    new_video = Video(
        title=title,
        description=description,
        creator_id=creator_id,
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
