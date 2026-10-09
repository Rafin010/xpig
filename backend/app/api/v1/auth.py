from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.db.session import get_db
from app.models.user import User

router = APIRouter()

class GoogleAuthPayload(BaseModel):
    email: str
    name: str
    picture: str

@router.post("/google")
async def google_auth(
    payload: GoogleAuthPayload,
    db: AsyncSession = Depends(get_db)
) -> Any:
    # Check if user exists
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalars().first()
    
    if not user:
        # Check if this is the first user, make them superuser
        count_res = await db.execute(select(User))
        is_first_user = len(count_res.scalars().all()) == 0
        
        # Create new user
        user = User(
            email=payload.email,
            username=payload.name.replace(" ", "").lower() + str(len(payload.email)), # naive unique username
            hashed_password="google_oauth",
            is_superuser=is_first_user,
            last_active=func.now()
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        user.last_active = func.now()
        await db.commit()
        
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "is_superuser": user.is_superuser,
        "is_cofounder": user.is_cofounder
    }
