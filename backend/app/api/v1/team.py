from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from app.db.session import get_db
from app.models.user import User

router = APIRouter()

class InvitePayload(BaseModel):
    email: str
    username: str

@router.get("/")
async def get_team(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.is_cofounder == True))
    users = result.scalars().all()
    return [{"id": u.id, "email": u.email, "username": u.username} for u in users]

@router.post("/invite")
async def invite_team_member(
    payload: InvitePayload,
    db: AsyncSession = Depends(get_db)
):
    # Check if exists
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user = User(
        email=payload.email,
        username=payload.username,
        hashed_password="invited_password123",
        is_cofounder=True,
        is_superuser=False
    )
    db.add(user)
    await db.commit()
    return {"message": "Co-founder invited successfully", "password": "invited_password123"}

@router.delete("/{user_id}")
async def remove_team_member(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_cofounder = False
    await db.commit()
    return {"message": "Co-founder removed"}
