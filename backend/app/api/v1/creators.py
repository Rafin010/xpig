from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.db.session import get_db
from app.models.video import Video
from app.models.social import Like, Follow, Comment

router = APIRouter()

@router.get("/analytics", response_model=Dict[str, Any])
async def get_creator_analytics(
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Returns aggregated analytics for the authenticated creator's dashboard.
    """
    creator_id = 1 # Mock authenticated user
    
    # In production, these would be precise SQL aggregations. 
    # For now, we mock the execution structure.
    
    # 1. Total Videos
    videos_result = await db.execute(select(func.count(Video.id)).where(Video.creator_id == creator_id))
    total_videos = videos_result.scalar() or 0
    
    # 2. Total Followers
    followers_result = await db.execute(select(func.count(Follow.id)).where(Follow.following_id == creator_id))
    total_followers = followers_result.scalar() or 0
    
    # 3. Total Likes on Creator's videos
    # This requires a join: select count(likes.id) from likes join videos on likes.video_id = videos.id where videos.creator_id = X
    likes_result = await db.execute(
        select(func.count(Like.id))
        .join(Video, Like.video_id == Video.id)
        .where(Video.creator_id == creator_id)
    )
    total_likes = likes_result.scalar() or 0

    return {
        "total_videos": total_videos,
        "total_followers": total_followers,
        "total_likes": total_likes,
        "total_views": 1250000, # Mocked metric
        "revenue_this_month": 4500.00, # Mocked metric
        "recent_activity": [
            {"type": "new_follower", "user": "user_45", "time": "2 hours ago"},
            {"type": "new_comment", "user": "fan_99", "time": "5 hours ago"}
        ]
    }
