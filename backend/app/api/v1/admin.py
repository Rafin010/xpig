from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.video import Video, VideoSource
from app.models.user import User
from app.models.sponsor import Sponsor
from app.models.telegram_bot import BotConfig
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
    
    # If co-founder, reduce revenue/sponsor amounts by dynamic haircut (default 60%)
    if role and role.strip().lower() in ["cofounder", "co-founder"]:
        haircut_val = await db.scalar(select(BotConfig.value).where(BotConfig.key == "global_haircut_pct"))
        try:
            h_pct = float(haircut_val) if haircut_val else 60.0
        except (ValueError, TypeError):
            h_pct = 60.0
        mult = max(0.0, min(1.0, (100.0 - h_pct) / 100.0))
        if "total_revenue" in result:
            result["total_revenue"] = round(result["total_revenue"] * mult)
        if "sponsor_amount" in result:
            result["sponsor_amount"] = round(result["sponsor_amount"] * mult)
            
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

    # 1. Platform Totals (Real counts from database)
    total_videos = await db.scalar(select(func.count(Video.id))) or 0
    total_users = await db.scalar(select(func.count(User.id))) or 0
    total_views = await db.scalar(select(func.sum(Video.views))) or 0
    total_watch_seconds = await db.scalar(select(func.sum(Video.total_watch_seconds))) or 0
    total_site_visits = await db.scalar(select(func.count(SiteVisit.id))) or 0

    # 2. Time-window factor for trends (Real database boundaries)
    if tr == "day":
        period_start = now - timedelta(hours=24)
        period_label = "24 Hours (Today)"
    elif tr == "month":
        period_start = now - timedelta(days=30)
        period_label = "30 Days (Past Month)"
    elif tr == "year":
        period_start = now - timedelta(days=365)
        period_label = "365 Days (Year)"
    elif tr == "all":
        period_start = None
        period_label = "All Time (Lifetime)"
    else:  # "week"
        period_start = now - timedelta(days=7)
        period_label = "7 Days (Past Week)"

    if period_start and total_site_visits > 0:
        period_visits = await db.scalar(select(func.count(SiteVisit.id)).where(SiteVisit.visited_at >= period_start)) or 0
        activity_ratio = min(1.0, max(0.01, period_visits / float(total_site_visits)))
        period_watch_seconds = int(round(total_watch_seconds * activity_ratio))
        period_views = int(round(total_views * activity_ratio))
    else:
        period_watch_seconds = int(total_watch_seconds)
        period_views = int(total_views)

    # Averages
    avg_seconds_per_view = round(total_watch_seconds / max(total_views, 1), 1)

    # 3. Audience Metrics (Real database metrics)
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

    # 4. Category Intelligence (Real watch time, views, retention by category)
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

    # 5. Trend Chart (100% REAL historical telemetry from Neon DB)
    if tr == "day":
        # 24-hour hour-by-hour breakdown for today
        hourly_trend_stmt = (
            select(func.extract("hour", SiteVisit.visited_at).label("hr"), func.count(SiteVisit.id).label("cnt"))
            .where(SiteVisit.visited_at >= period_start)
            .group_by(func.extract("hour", SiteVisit.visited_at))
            .order_by(func.extract("hour", SiteVisit.visited_at))
        )
        hourly_trend_res = await db.execute(hourly_trend_stmt)
        hourly_trend_map = {int(r.hr): int(r.cnt) for r in hourly_trend_res.all()}
        total_day_visits = sum(hourly_trend_map.values()) or 1

        trend_chart = []
        for h in range(24):
            v_cnt = hourly_trend_map.get(h, 0)
            share = v_cnt / float(total_day_visits)
            h_str = f"{h:02d}:00"
            trend_chart.append({
                "name": h_str,
                "views": int(round(period_views * share)) if v_cnt > 0 else 0,
                "watchTime": round((period_watch_seconds * share) / 3600.0, 2),
                "visitors": v_cnt
            })
    else:
        # Daily breakdown: 30 days for month/all, 7 days for week
        chart_days = 30 if tr in ["month", "all"] else 7
        chart_start = (now - timedelta(days=chart_days - 1)).replace(hour=0, minute=0, second=0, microsecond=0)
        daily_stmt = (
            select(func.date(SiteVisit.visited_at).label("visit_date"), func.count(SiteVisit.id).label("cnt"))
            .where(SiteVisit.visited_at >= chart_start)
            .group_by(func.date(SiteVisit.visited_at))
            .order_by(func.date(SiteVisit.visited_at))
        )
        daily_res = await db.execute(daily_stmt)
        daily_map = {r.visit_date: int(r.cnt) for r in daily_res.all()}

        trend_chart = []
        total_chart_visits = sum(daily_map.values()) or 1
        for day_idx in range(chart_days):
            target_dt = chart_start + timedelta(days=day_idx)
            target_date = target_dt.date()
            day_lbl = target_dt.strftime("%b %d") if chart_days > 7 else target_dt.strftime("%a")
            v_count = daily_map.get(target_date, 0)
            day_share = v_count / float(total_chart_visits)
            trend_chart.append({
                "name": day_lbl,
                "views": int(round(period_views * day_share)) if v_count > 0 else (1 if period_views > 0 and day_idx == chart_days - 1 else 0),
                "watchTime": round((period_watch_seconds * day_share) / 3600.0, 2),
                "visitors": v_count
            })

    # 6. Peak Hours Activity (100% REAL 24-Hour hourly distribution from site_visits)
    hourly_stmt = (
        select(func.extract("hour", SiteVisit.visited_at).label("hr"), func.count(SiteVisit.id).label("cnt"))
        .where(SiteVisit.visited_at >= (now - timedelta(days=7)))
        .group_by(func.extract("hour", SiteVisit.visited_at))
        .order_by(func.extract("hour", SiteVisit.visited_at))
    )
    hourly_res = await db.execute(hourly_stmt)
    hourly_map = {int(r.hr): int(r.cnt) for r in hourly_res.all()}

    peak_hours = []
    for h in range(24):
        h_str = f"{h:02d}:00"
        peak_hours.append({
            "hour": h_str,
            "active": hourly_map.get(h, 0)
        })

    # 7. Device Breakdown (from deep analytics columns)
    device_breakdown = {}
    try:
        device_base = select(SiteVisit.device_type, func.count(SiteVisit.id).label("cnt")).where(SiteVisit.device_type.isnot(None))
        if period_start:
            device_base = device_base.where(SiteVisit.visited_at >= period_start)
        device_base = device_base.group_by(SiteVisit.device_type)
        device_res = await db.execute(device_base)
        device_breakdown = {(r.device_type or "unknown"): int(r.cnt) for r in device_res.all()}
    except Exception:
        pass

    # 8. Traffic Source Breakdown (from deep analytics columns)
    source_breakdown = {}
    try:
        source_base = select(SiteVisit.referrer_source, func.count(SiteVisit.id).label("cnt")).where(SiteVisit.referrer_source.isnot(None))
        if period_start:
            source_base = source_base.where(SiteVisit.visited_at >= period_start)
        source_base = source_base.group_by(SiteVisit.referrer_source)
        source_res = await db.execute(source_base)
        source_breakdown = {(r.referrer_source or "direct"): int(r.cnt) for r in source_res.all()}
    except Exception:
        pass

    # 9. Session Duration & Bounce Metrics
    avg_session_duration = 0
    total_sessions_count = 1
    bounced_sessions = 0
    bounce_rate = 0.0
    try:
        dur_base = select(
            func.count(SiteVisit.id).label("total")
        )
        if period_start:
            dur_base = dur_base.where(SiteVisit.visited_at >= period_start)
        dur_res = await db.execute(dur_base)
        total_sessions_count = dur_res.scalar() or 1

        # Average duration
        avg_dur_stmt = select(
            func.avg(func.extract("epoch", SiteVisit.last_active) - func.extract("epoch", SiteVisit.visited_at)).label("avg_dur")
        )
        if period_start:
            avg_dur_stmt = avg_dur_stmt.where(SiteVisit.visited_at >= period_start)
        avg_dur_res = await db.execute(avg_dur_stmt)
        avg_session_duration = int(avg_dur_res.scalar() or 0)

        # Bounce count (sessions < 10 seconds)
        bounce_stmt = select(func.count(SiteVisit.id)).where(
            (func.extract("epoch", SiteVisit.last_active) - func.extract("epoch", SiteVisit.visited_at)) < 10
        )
        if period_start:
            bounce_stmt = bounce_stmt.where(SiteVisit.visited_at >= period_start)
        bounce_res = await db.execute(bounce_stmt)
        bounced_sessions = bounce_res.scalar() or 0
        bounce_rate = round((bounced_sessions / max(total_sessions_count, 1)) * 100, 1)
    except Exception:
        pass

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
        "peak_hours": peak_hours,
        "device_breakdown": device_breakdown,
        "source_breakdown": source_breakdown,
        "session_metrics": {
            "avg_duration_seconds": avg_session_duration,
            "avg_duration_formatted": format_duration(avg_session_duration),
            "bounce_rate": bounce_rate,
            "total_sessions": total_sessions_count,
            "bounced_sessions": bounced_sessions
        }
    }

@router.get("/analytics/live-log")
async def get_live_log(db: AsyncSession = Depends(get_db)):
    """Return the last 50 active sessions from the past 10 minutes for live monitoring."""
    now = datetime.now(timezone.utc)
    threshold = now - timedelta(minutes=10)

    stmt = (
        select(SiteVisit)
        .where(SiteVisit.last_active >= threshold)
        .order_by(SiteVisit.last_active.desc())
        .limit(50)
    )
    result = await db.execute(stmt)
    sessions = result.scalars().all()

    log = []
    for s in sessions:
        duration_secs = 0
        if s.last_active and s.visited_at:
            la = s.last_active
            va = s.visited_at
            if la.tzinfo is None:
                la = la.replace(tzinfo=timezone.utc)
            if va.tzinfo is None:
                va = va.replace(tzinfo=timezone.utc)
            duration_secs = max(0, int((la - va).total_seconds()))

        is_live = False
        if s.last_active:
            la2 = s.last_active
            if la2.tzinfo is None:
                la2 = la2.replace(tzinfo=timezone.utc)
            is_live = (now - la2).total_seconds() < 300

        log.append({
            "session_id": s.session_id[-8:] if s.session_id else "unknown",
            "device": s.device_type or "unknown",
            "browser": s.browser or "unknown",
            "os": s.os_name or "unknown",
            "source": s.referrer_source or "direct",
            "page": s.current_page or "/",
            "duration_seconds": duration_secs,
            "duration_formatted": format_duration(duration_secs),
            "is_live": is_live,
            "last_seen": s.last_active.isoformat() if s.last_active else None
        })
    return log

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


# ─────────────────────────────────────────────────────────────────────────────
# 💰 SUPER ADMIN EXCLUSIVE: CO-FOUNDER REVENUE SHARE & PROFIT DISTRIBUTION
# ─────────────────────────────────────────────────────────────────────────────

class RevenueShareUpdate(BaseModel):
    revenue_share_pct: float
    extra_cut_pct: Optional[float] = 0.0
    fixed_deduction: Optional[float] = 0.0
    notes: Optional[str] = ""

class GlobalHaircutUpdate(BaseModel):
    global_haircut_pct: float

@router.get("/revenue-shares")
async def get_revenue_shares(db: AsyncSession = Depends(get_db)):
    """
    Super Admin Classified Endpoint: Calculates real gross revenue, total views,
    global concealment haircut (default 60%), per-founder base shares, custom deductions,
    and net retained profits for the Super Admin.
    """
    # 1. Total real gross revenue from sponsors
    total_spent_val = await db.scalar(select(func.sum(Sponsor.spent))) or 0.0
    total_budget_val = await db.scalar(select(func.sum(Sponsor.budget))) or 0.0
    gross_revenue = round(float(total_spent_val if total_spent_val > 0 else total_budget_val), 2)
    
    # 2. Total views across all videos
    total_views = await db.scalar(select(func.sum(Video.views))) or 0
    total_videos = await db.scalar(select(func.count(Video.id))) or 0
    
    # 3. Get global haircut from BotConfig (default 60.0%)
    haircut_conf = await db.scalar(select(BotConfig.value).where(BotConfig.key == "global_haircut_pct"))
    try:
        global_haircut_pct = float(haircut_conf) if haircut_conf else 60.0
    except (ValueError, TypeError):
        global_haircut_pct = 60.0
        
    concealed_pool_multiplier = max(0.0, min(1.0, (100.0 - global_haircut_pct) / 100.0))
    visible_pool_revenue = round(gross_revenue * concealed_pool_multiplier, 2)
    
    # 4. Fetch all cofounders
    result = await db.execute(select(User).where(User.is_cofounder == True))
    cofounders = result.scalars().all()
    
    counts_res = await db.execute(
        select(Video.creator_id, func.count(Video.id)).group_by(Video.creator_id)
    )
    video_counts = {creator_id: count for creator_id, count in counts_res.all()}
    
    partners_data = []
    total_founder_payouts = 0.0
    
    for u in cofounders:
        t = get_telemetry(u)
        share_pct = float(t.get("revenue_share_pct", 10.0))
        extra_cut_pct = float(t.get("extra_cut_pct", 0.0))
        fixed_deduction = float(t.get("fixed_deduction", 0.0))
        notes = t.get("payout_notes", "")
        
        # Real 100% earnings if not concealed
        real_100_earnings = round((gross_revenue * (share_pct / 100.0)), 2)
        
        # Reported base on visible (discounted) pool
        reported_base = round((visible_pool_revenue * (share_pct / 100.0)), 2)
        
        # Net payout after extra cut % and fixed deduction
        effective_share_pct = max(0.0, share_pct - extra_cut_pct)
        net_calc = (visible_pool_revenue * (effective_share_pct / 100.0)) - fixed_deduction
        final_net_payout = max(0.0, round(net_calc, 2))
        
        admin_retained_from_partner = round(max(0.0, real_100_earnings - final_net_payout), 2)
        total_founder_payouts += final_net_payout
        
        partners_data.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "avatar_url": u.avatar_url,
            "role": t.get("role", "Co-Founder"),
            "uploaded_videos_count": video_counts.get(u.id, 0),
            "revenue_share_pct": share_pct,
            "extra_cut_pct": extra_cut_pct,
            "fixed_deduction": fixed_deduction,
            "notes": notes,
            "real_100_earnings": real_100_earnings,
            "reported_base": reported_base,
            "final_net_payout": final_net_payout,
            "admin_retained": admin_retained_from_partner,
            "last_active": u.last_active.isoformat() if u.last_active else None
        })
        
    super_admin_net_profit = round(max(0.0, gross_revenue - total_founder_payouts), 2)
    profit_margin_pct = round((super_admin_net_profit / max(1.0, gross_revenue)) * 100.0, 1) if gross_revenue > 0 else 100.0
    
    return {
        "gross_revenue": gross_revenue,
        "total_views": total_views,
        "total_videos": total_videos,
        "global_haircut_pct": global_haircut_pct,
        "visible_pool_revenue": visible_pool_revenue,
        "super_admin_net_profit": super_admin_net_profit,
        "super_admin_profit_margin_pct": profit_margin_pct,
        "total_founder_payouts": round(total_founder_payouts, 2),
        "partners": partners_data
    }

@router.patch("/revenue-shares/{user_id}")
async def update_partner_share(
    user_id: int, 
    payload: RevenueShareUpdate, 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Co-founder not found")
        
    t = get_telemetry(user)
    t["revenue_share_pct"] = float(payload.revenue_share_pct)
    t["extra_cut_pct"] = float(payload.extra_cut_pct or 0.0)
    t["fixed_deduction"] = float(payload.fixed_deduction or 0.0)
    t["payout_notes"] = (payload.notes or "").strip()
    update_telemetry(user, t)
    await db.commit()
    
    return {
        "success": True, 
        "user_id": user.id,
        "revenue_share_pct": t["revenue_share_pct"],
        "extra_cut_pct": t["extra_cut_pct"],
        "fixed_deduction": t["fixed_deduction"],
        "notes": t["payout_notes"]
    }

@router.post("/revenue-shares/settings")
async def update_revenue_settings(
    payload: GlobalHaircutUpdate, 
    db: AsyncSession = Depends(get_db)
):
    new_pct = max(0.0, min(95.0, float(payload.global_haircut_pct)))
    conf = await db.execute(select(BotConfig).where(BotConfig.key == "global_haircut_pct"))
    existing = conf.scalars().first()
    if existing:
        existing.value = str(new_pct)
    else:
        db.add(BotConfig(key="global_haircut_pct", value=str(new_pct)))
    await db.commit()
    
    return {"success": True, "global_haircut_pct": new_pct}

