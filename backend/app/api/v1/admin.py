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
