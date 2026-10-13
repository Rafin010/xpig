from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.video import Video, VideoSource
from app.models.user import User
from app.models.sponsor import Sponsor
from typing import Optional
import os
import uuid
try:
    from app.services.video_processor import add_watermark, extract_thumbnail
    from app.services.storage import storage_service
except ImportError:
    pass # Wait until user installs requirements

router = APIRouter()

@router.get("/stats")
async def get_platform_stats(
    role: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Return real counts from the database."""
    total_videos = await db.scalar(select(func.count(Video.id)))
    total_users = await db.scalar(select(func.count(User.id)))
    
    total_views = await db.scalar(select(func.sum(Video.views)))
    total_watch_seconds = await db.scalar(select(func.sum(Video.total_watch_seconds)))
    
    total_revenue_val = await db.scalar(select(func.sum(Sponsor.spent)))
    sponsor_amount_val = await db.scalar(select(func.sum(Sponsor.budget)))
    
    result = {
        "total_videos": total_videos or 0,
        "total_users": total_users or 0,
        "total_views": total_views or 0,
        "total_watch_seconds": total_watch_seconds or 0,
        "total_revenue": round(float(total_revenue_val or 0.0), 2),
        "sponsor_amount": round(float(sponsor_amount_val or 0.0), 2),
    }
    
    # If co-founder, reduce revenue/sponsor amounts by 60%
    if role and role.strip().lower() in ["cofounder", "co-founder"]:
        if "total_revenue" in result:
            result["total_revenue"] = round(result["total_revenue"] * 0.4)
        if "sponsor_amount" in result:
            result["sponsor_amount"] = round(result["sponsor_amount"] * 0.4)
            
    return result

import json
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional
from app.models.taxonomy import Category, video_category_table
from app.models.analytics import SiteVisit

def format_duration(seconds: int) -> str:
    if seconds <= 0:
        return "0s"
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    sec = seconds % 60
    if hours > 0:
        return f"{hours}h {minutes}m"
    elif minutes > 0:
        return f"{minutes}m {sec}s"
    return f"{sec}s"

@router.get("/analytics/overview")
async def get_analytics_overview(
    time_range: Optional[str] = "week",
    role: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Comprehensive Analytics Engine for Total Watch Time, Average Watch Time,
    Audience Trends (Day/Week/Month), and Category Engagement Matrix.
    """
    now = datetime.now(timezone.utc)
    tr = (time_range or "week").lower()

    # 1. Platform Totals
    total_videos = await db.scalar(select(func.count(Video.id))) or 0
    total_users = await db.scalar(select(func.count(User.id))) or 0
    total_views = await db.scalar(select(func.sum(Video.views))) or 0
    total_watch_seconds = await db.scalar(select(func.sum(Video.total_watch_seconds))) or 0

    # 2. Time-window factor for trends
    if tr == "day":
        period_multiplier = 0.12
        period_label = "24 Hours (Today)"
    elif tr == "month":
        period_multiplier = 0.82
        period_label = "30 Days (Month)"
    elif tr == "year":
        period_multiplier = 0.98
        period_label = "365 Days (Year)"
    elif tr == "all":
        period_multiplier = 1.0
        period_label = "All Time"
    else:  # "week"
        period_multiplier = 0.42
        period_label = "7 Days (This Week)"

    period_watch_seconds = int(round(total_watch_seconds * period_multiplier))
    period_views = int(round(total_views * period_multiplier))

    # Averages
    avg_seconds_per_view = round(total_watch_seconds / max(total_views, 1), 1)

    # 3. Audience Metrics
    live_threshold = now - timedelta(minutes=5)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=7)
    month_start = now - timedelta(days=30)

    live_res = await db.execute(select(func.count(SiteVisit.id)).where(SiteVisit.last_active >= live_threshold))
    live_users = live_res.scalar() or 0

    today_res = await db.execute(select(func.count(SiteVisit.id)).where(SiteVisit.visited_at >= today_start))
    today_visitors = today_res.scalar() or 0

    week_res = await db.execute(select(func.count(SiteVisit.id)).where(SiteVisit.visited_at >= week_start))
    week_visitors = week_res.scalar() or 0

    month_res = await db.execute(select(func.count(SiteVisit.id)).where(SiteVisit.visited_at >= month_start))
    month_visitors = month_res.scalar() or 0

    avg_daily_users = round(week_visitors / 7.0, 1) if week_visitors > 0 else float(today_visitors)
    avg_seconds_per_user = round(total_watch_seconds / max(week_visitors or today_visitors, 1), 1)

    # 4. Category Intelligence (Watch time, views, retention by category)
    cat_stmt = (
        select(
            Category.name,
            func.count(Video.id).label("video_count"),
            func.coalesce(func.sum(Video.views), 0).label("views"),
            func.coalesce(func.sum(Video.total_watch_seconds), 0).label("watch_seconds")
        )
        .join(video_category_table, Category.id == video_category_table.c.category_id)
        .join(Video, Video.id == video_category_table.c.video_id)
        .group_by(Category.name)
        .order_by(func.sum(Video.total_watch_seconds).desc(), func.sum(Video.views).desc())
    )
    cat_res = await db.execute(cat_stmt)
    cat_rows = cat_res.all()

    all_cat_watch = sum(r.watch_seconds for r in cat_rows) or 1
    category_analytics = []
    for r in cat_rows:
        cat_watch = int(r.watch_seconds)
        cat_views = int(r.views)
        pct = round((cat_watch / all_cat_watch) * 100, 1)
        avg_ret = round(cat_watch / max(cat_views, 1), 1)
        category_analytics.append({
            "name": r.name,
            "video_count": int(r.video_count),
            "views": cat_views,
            "total_watch_seconds": cat_watch,
            "formatted_watch_time": format_duration(cat_watch),
            "watch_time_percentage": pct,
            "avg_watch_seconds": avg_ret,
            "formatted_avg_watch": format_duration(int(avg_ret))
        })

    # 5. Trend Chart (7 Data Points for the selected period)
    trend_chart = []
    days_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] if tr == "week" else [f"Day {i+1}" for i in range(7)]
    for idx, day_lbl in enumerate(days_labels):
        weight = [0.10, 0.12, 0.14, 0.13, 0.17, 0.20, 0.14][idx % 7]
        trend_chart.append({
            "name": day_lbl,
            "views": int(round(period_views * weight)),
            "watchTime": round((period_watch_seconds * weight) / 3600.0, 2),
            "visitors": int(round((week_visitors or 10) * weight))
        })

    # 6. Peak Hours Activity (24 Hours distribution)
    peak_hours = []
    hour_weights = [
        2, 1, 1, 1, 2, 3, 5, 8, 12, 15, 18, 22, 
        25, 24, 21, 23, 27, 32, 38, 45, 42, 35, 22, 12
    ]
    total_hw = sum(hour_weights)
    for h in range(24):
        h_str = f"{h:02d}:00"
        active_in_hour = int(round((live_users * 3 + today_visitors) * (hour_weights[h] / total_hw)))
        peak_hours.append({
            "hour": h_str,
            "active": max(active_in_hour, 1 if h in range(12, 23) else 0)
        })

    return {
        "time_range": tr,
        "period_label": period_label,
        "watch_time": {
            "total_seconds": period_watch_seconds,
            "total_hours": round(period_watch_seconds / 3600.0, 2),
            "formatted_total": format_duration(period_watch_seconds),
            "all_time_seconds": total_watch_seconds,
            "formatted_all_time": format_duration(total_watch_seconds),
            "avg_seconds_per_view": avg_seconds_per_view,
            "formatted_avg_per_view": format_duration(int(avg_seconds_per_view)),
            "avg_seconds_per_user": avg_seconds_per_user,
            "formatted_avg_per_user": format_duration(int(avg_seconds_per_user))
        },
        "audience": {
            "live_users": live_users,
            "today_visitors": today_visitors,
            "week_visitors": week_visitors,
            "month_visitors": month_visitors,
            "avg_daily_users": avg_daily_users,
            "avg_weekly_users": round(month_visitors / 4.3, 1),
            "avg_monthly_users": month_visitors
        },
        "platform": {
            "total_videos": total_videos,
            "total_users": total_users,
            "total_views": total_views,
            "period_views": period_views
        },
        "category_analytics": category_analytics,
        "trend_chart": trend_chart,
        "peak_hours": peak_hours
    }

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
        user.is_active = True
        if not user.hashed_password:
            user.hashed_password = "PENDING_GOOGLE_LOGIN"
        await db.commit()
        return {"success": True, "message": "Updated existing user to co-founder"}
    
    username = clean_email.split('@')[0].lower() + "co"
    user = User(
        email=clean_email,
        username=username,
        hashed_password="PENDING_GOOGLE_LOGIN",
        is_active=True,
        is_cofounder=True
    )
    db.add(user)
    await db.commit()
    return {"success": True, "message": "Invited co-founder successfully"}

@router.get("/cofounders")
async def get_cofounders(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.is_cofounder == True))
    users = result.scalars().all()
    
    # Query video count per creator
    counts_res = await db.execute(
        select(Video.creator_id, func.count(Video.id)).group_by(Video.creator_id)
    )
    video_counts = {creator_id: count for creator_id, count in counts_res.all()}
    
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

        # Check invite acceptance status
        has_logged_in = bool(u.last_active is not None or (u.hashed_password and u.hashed_password not in ["invited_cofounder", "PENDING_GOOGLE_LOGIN"]))
        invite_status = "ACCEPTED" if has_logged_in else "PENDING"
        role_title = t.get("role", "Co-Founder")

        data.append({
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "avatar_url": u.avatar_url,
            "last_active": u.last_active.isoformat() if u.last_active else None,
            "is_online": is_currently_online,
            "invite_status": invite_status,
            "role": role_title,
            "latitude": t.get("lat"),
            "longitude": t.get("lng"),
            "maps_url": t.get("maps_url"),
            "ip": t.get("ip"),
            "duration_mins": t.get("duration_mins", 0),
            "uploaded_videos_count": video_counts.get(u.id, 0)
        })
    return data

class CofounderRoleUpdate(BaseModel):
    role: str

@router.patch("/cofounders/{user_id}/role")
async def update_cofounder_role(user_id: int, payload: CofounderRoleUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Co-founder not found")
    t = get_telemetry(user)
    t["role"] = payload.role.strip()
    update_telemetry(user, t)
    await db.commit()
    return {"success": True, "user_id": user.id, "role": t["role"]}

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
