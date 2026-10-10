from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func
from sqlalchemy import update
from pydantic import BaseModel
import datetime

from app.db.session import get_db
from app.models.analytics import SiteVisit

router = APIRouter()

class PingRequest(BaseModel):
    session_id: str

@router.post("/ping")
async def ping(
    request: PingRequest,
    db: AsyncSession = Depends(get_db)
) -> Any:
    # Try to find existing session
    result = await db.execute(select(SiteVisit).where(SiteVisit.session_id == request.session_id))
    visit = result.scalars().first()
    
    if visit:
        visit.last_active = func.now()
    else:
        visit = SiteVisit(session_id=request.session_id)
        db.add(visit)
        
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
