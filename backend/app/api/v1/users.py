from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import User as UserSchema, UserUpdate

router = APIRouter()

@router.get("/", response_model=dict)
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(User).offset(skip).limit(limit))
    users = result.scalars().all()
    # Manual dict to avoid schema issues temporarily
    items = []
    for u in users:
        items.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_active": u.is_active,
            "is_creator": getattr(u, 'is_creator', False),
            "age_verification_status": getattr(u, 'age_verification_status', 'UNVERIFIED')
        })
    return {"items": items}

@router.get("/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/{user_id}/age-verify")
async def request_age_verification(
    user_id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Initiate age verification via external IDV provider (e.g. Yoti).
    This endpoint creates an integration point for the frontend to start the flow.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # In production: call IDV provider API to get a verification session ID.
    # We mock returning a session link here.
    return {
        "status": "Verification session initiated",
        "verification_url": "https://idv-provider.example.com/verify?session=mock_123",
        "user_age_status": user.age_verification_status
    }

@router.patch("/{user_id}/age-verify-callback")
async def age_verification_callback(
    user_id: int,
    status: str,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Webhook callback from IDV provider.
    Requires robust webhook signature verification in production.
    """
    valid_statuses = ["PENDING", "VERIFIED", "FAILED", "EXPIRED"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.age_verification_status = status
    await db.commit()
    await db.refresh(user)
    
    return {"message": f"Age verification status updated to {status}"}
