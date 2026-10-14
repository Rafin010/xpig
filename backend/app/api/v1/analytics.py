from typing import Any, Optional
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func
from sqlalchemy import update
from pydantic import BaseModel
import datetime

from app.db.session import get_db
from app.models.analytics import SiteVisit
from app.models.user import User
from app.models.guest import GuestUser

router = APIRouter()

class PingRequest(BaseModel):
    session_id: str
    device_type: Optional[str] = None       # "mobile" | "tablet" | "desktop"
    device_name: Optional[str] = None       # e.g. "Samsung Galaxy S23 (Android 14)"
    browser: Optional[str] = None            # "Chrome" | "Safari" | ...
    os_name: Optional[str] = None            # "Android" | "iOS" | ...
    referrer_source: Optional[str] = None    # "telegram" | "google" | "direct"
    current_page: Optional[str] = None       # "/watch/123"
    cookie_tracker_id: Optional[str] = None  # "xpig_trk_..."
    user_id: Optional[int] = None
    user_email: Optional[str] = None         # Support identifying cofounders/users by email
    clicks: Optional[int] = 0

@router.post("/ping")
async def ping(
    request: PingRequest,
    req: Request,
    db: AsyncSession = Depends(get_db)
) -> Any:
    # Extract client IP and Cloudflare Country
    client_ip = (
        req.headers.get("cf-connecting-ip")
        or (req.headers.get("x-forwarded-for").split(",")[0].strip() if req.headers.get("x-forwarded-for") else None)
        or (req.client.host if req.client else None)
    )
    cf_country = req.headers.get("cf-ipcountry")

    # Try to find existing session
    result = await db.execute(select(SiteVisit).where(SiteVisit.session_id == request.session_id))
    visit = result.scalars().first()
    
    if visit:
        visit.last_active = func.now()
        # Update current page on every ping (tracks navigation)
        if request.current_page:
            visit.current_page = request.current_page
    else:
        visit = SiteVisit(
            session_id=request.session_id,
            device_type=request.device_type,
            browser=request.browser,
            os_name=request.os_name,
            referrer_source=request.referrer_source,
            current_page=request.current_page,
        )
        db.add(visit)

    # Sync to User model if user is logged in (supports ID or Email lookup)
    user = None
    if request.user_id:
        user_res = await db.execute(select(User).where(User.id == request.user_id))
        user = user_res.scalars().first()
    elif request.user_email and request.user_email.strip():
        clean_email = request.user_email.strip().lower()
        user_res = await db.execute(select(User).where(func.lower(User.email) == clean_email))
        user = user_res.scalars().first()

    now_utc = datetime.datetime.now(datetime.timezone.utc)

    if user:
        # Calculate continuous online session duration
        if user.last_active:
            la = user.last_active
            if la.tzinfo is None:
                la = la.replace(tzinfo=datetime.timezone.utc)
            # If user was inactive for > 5 minutes, start a new online session
            if (now_utc - la).total_seconds() > 300 or getattr(user, 'session_started_at', None) is None:
                user.session_started_at = now_utc
        else:
            user.session_started_at = now_utc

        user.last_active = now_utc

        if request.device_name:
            user.device_name = request.device_name
        if request.browser:
            user.browser_name = request.browser
        if request.os_name:
            user.os_name = request.os_name
        if request.cookie_tracker_id:
            user.cookie_tracker_id = request.cookie_tracker_id
        if request.clicks and request.clicks > 0:
            user.total_clicks = (user.total_clicks or 0) + request.clicks
        if client_ip and client_ip not in ("127.0.0.1", "localhost", "::1"):
            user.last_ip = client_ip
        if cf_country:
            user.country = cf_country

    elif request.cookie_tracker_id:
        # Anonymous Guest Visitor Tracking via persistent cookie
        guest_res = await db.execute(select(GuestUser).where(GuestUser.cookie_tracker_id == request.cookie_tracker_id))
        guest = guest_res.scalars().first()
        if not guest:
            guest = GuestUser(
                cookie_tracker_id=request.cookie_tracker_id,
                ip_address=client_ip,
                country=cf_country,
                device_name=request.device_name,
                browser_name=request.browser,
                os_name=request.os_name,
                total_clicks=request.clicks or 0,
                first_seen=now_utc,
                last_active=now_utc,
                session_started_at=now_utc
            )
            db.add(guest)
        else:
            if guest.last_active:
                g_la = guest.last_active
                if g_la.tzinfo is None:
                    g_la = g_la.replace(tzinfo=datetime.timezone.utc)
                if (now_utc - g_la).total_seconds() > 300 or getattr(guest, 'session_started_at', None) is None:
                    guest.session_started_at = now_utc
            else:
                guest.session_started_at = now_utc

            guest.last_active = now_utc

            if request.device_name:
                guest.device_name = request.device_name
            if request.browser:
                guest.browser_name = request.browser
            if request.os_name:
                guest.os_name = request.os_name
            if request.clicks and request.clicks > 0:
                guest.total_clicks = (guest.total_clicks or 0) + request.clicks
            if client_ip and client_ip not in ("127.0.0.1", "localhost", "::1"):
                guest.ip_address = client_ip
            if cf_country:
                guest.country = cf_country
        
    await db.commit()
    return {"status": "ok"}

@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db)
) -> Any:
    now = datetime.datetime.utcnow()
    live_threshold = now - datetime.timedelta(minutes=5)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - datetime.timedelta(days=today_start.weekday())
    month_start = today_start.replace(day=1)
    
    # Live users
    live_result = await db.execute(select(func.count(SiteVisit.id)).where(SiteVisit.last_active >= live_threshold))
    live_users = live_result.scalar() or 0
    
    # Today visitors
    today_result = await db.execute(select(func.count(SiteVisit.id)).where(SiteVisit.visited_at >= today_start))
    today_visitors = today_result.scalar() or 0
    
    # Week visitors
    week_result = await db.execute(select(func.count(SiteVisit.id)).where(SiteVisit.visited_at >= week_start))
    week_visitors = week_result.scalar() or 0
    
    # Month visitors
    month_result = await db.execute(select(func.count(SiteVisit.id)).where(SiteVisit.visited_at >= month_start))
    month_visitors = month_result.scalar() or 0
    
    return {
        "live_users": live_users,
        "today_visitors": today_visitors,
        "week_visitors": week_visitors,
        "month_visitors": month_visitors
    }
