from typing import Any
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.db.session import get_db
from app.models.user import User
from app.core.security import create_access_token

router = APIRouter()

class GoogleAuthPayload(BaseModel):
    access_token: str

@router.post("/google")
async def google_auth(
    payload: GoogleAuthPayload,
    db: AsyncSession = Depends(get_db)
) -> Any:
    # 1. Verify token directly with Google securely
    async with httpx.AsyncClient() as client:
        res = await client.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {payload.access_token}'}
        )
        if res.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        user_info = res.json()
        
    email = user_info.get("email")
    name = user_info.get("name", "User")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")

    # 2. Check if user exists
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if not user:
        count_res = await db.execute(select(User))
        is_first_user = len(count_res.scalars().all()) == 0
        
        user = User(
            email=email,
            username=name.replace(" ", "").lower() + str(len(email)),
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
        
    # 3. Create XPIG JWT Token
    access_token = create_access_token(subject=user.id)
        
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_superuser": user.is_superuser,
            "is_cofounder": user.is_cofounder
        }
    }
