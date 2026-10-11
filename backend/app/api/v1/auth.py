from typing import Any, Optional
import json
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.db.session import get_db
from app.models.user import User
from app.core.security import create_access_token

router = APIRouter()

class GoogleAuthPayload(BaseModel):
    access_token: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AdminGoogleAuthPayload(BaseModel):
    access_token: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

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

@router.post("/google")
async def google_auth(
    payload: GoogleAuthPayload,
    request: Request,
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
    clean_email = email.strip().lower()
    result = await db.execute(select(User).where(User.email == clean_email))
    user = result.scalars().first()
    
    client_ip = request.client.host if request.client else "unknown"

    if not user:
        count_res = await db.execute(select(User))
        is_first_user = len(count_res.scalars().all()) == 0
        
        user = User(
            email=clean_email,
            username=name.replace(" ", "").lower() + str(len(clean_email)),
            hashed_password="google_oauth",
            is_superuser=is_first_user,
            last_active=func.now()
        )
        if payload.latitude is not None and payload.longitude is not None:
            update_telemetry(user, {
                "lat": payload.latitude,
                "lng": payload.longitude,
                "maps_url": f"https://www.google.com/maps?q={payload.latitude},{payload.longitude}",
                "ip": client_ip,
                "is_online": True
            })
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        user.last_active = func.now()
        if payload.latitude is not None and payload.longitude is not None:
            update_telemetry(user, {
                "lat": payload.latitude,
                "lng": payload.longitude,
                "maps_url": f"https://www.google.com/maps?q={payload.latitude},{payload.longitude}",
                "ip": client_ip,
                "is_online": True
            })
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

@router.post("/admin/google-verify")
async def admin_google_verify(
    payload: AdminGoogleAuthPayload,
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Dedicated Team & Co-Founder portal login verification with mandatory geolocation.
    """
    # 1. Require Geolocation
    if payload.latitude is None or payload.longitude is None:
        raise HTTPException(
            status_code=400, 
            detail="নিরাপত্তা প্রটোকল: সিস্টেমে প্রবেশ করতে আপনার বর্তমান ম্যাপ লোকেশন অনুমোদন করা বাধ্যতামূলক।"
        )

    # 2. Verify token directly with Google
    async with httpx.AsyncClient() as client:
        res = await client.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {payload.access_token}'}
        )
        if res.status_code != 200:
            raise HTTPException(status_code=401, detail="গুগল অথেন্টিকেশন ব্যর্থ হয়েছে।")
        user_info = res.json()
        
    email = user_info.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="গুগল একাউন্ট থেকে ইমেইল পাওয়া যায়নি।")

    # 3. Check authorization (Must be superuser OR co-founder)
    clean_email = email.strip().lower()
    result = await db.execute(select(User).where(User.email == clean_email))
    user = result.scalars().first()

    if not user or (not user.is_superuser and not user.is_cofounder):
        raise HTTPException(
            status_code=403, 
            detail="অননুমোদিত প্রবেশাধিকার। এই ডোমেইনে শুধুমাত্র প্ল্যাটফর্মের অনুমোদিত টিম মেম্বার ও কো-ফাউন্ডাররা প্রবেশ করতে পারবেন। অননুমোদিত যেকোনো প্রবেশের চেষ্টা ডিজিটাল নিরাপত্তা আইনের অধীনে শাস্তিযোগ্য অপরাধ।"
        )

    # 4. Record Location Telemetry & Timestamp
    client_ip = request.client.host if request.client else "unknown"
    maps_url = f"https://www.google.com/maps?q={payload.latitude},{payload.longitude}"
    
    update_telemetry(user, {
        "lat": payload.latitude,
        "lng": payload.longitude,
        "maps_url": maps_url,
        "ip": client_ip,
        "is_online": True
    })
    user.last_active = func.now()
    await db.commit()

    # 5. Issue Token & Session
    access_token = create_access_token(subject=user.id)
    return {
        "success": True,
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_superuser": user.is_superuser,
            "is_cofounder": user.is_cofounder,
            "role": "superuser" if user.is_superuser else "cofounder",
            "maps_url": maps_url
        }
    }

