from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.video import Video
from app.models.user import User

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
