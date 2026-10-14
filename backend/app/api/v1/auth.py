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
    access_token: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    cookie_tracker_id: Optional[str] = None

class AdminGoogleAuthPayload(BaseModel):
    access_token: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    cookie_tracker_id: Optional[str] = None

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

async def merge_guest_identity(user: User, cookie_tracker_id: Optional[str], db: AsyncSession):
    if not cookie_tracker_id:
        return
    try:
        from app.models.guest import GuestUser
        guest_res = await db.execute(select(GuestUser).where(GuestUser.cookie_tracker_id == cookie_tracker_id))
        guest = guest_res.scalars().first()
        if guest and not guest.is_converted:
            user.total_clicks = (user.total_clicks or 0) + (guest.total_clicks or 0)
            user.total_watched_videos = (user.total_watched_videos or 0) + (guest.total_watched_videos or 0)
            user.total_watch_seconds = (user.total_watch_seconds or 0) + (guest.total_watch_seconds or 0)
            if not user.device_name and guest.device_name:
                user.device_name = guest.device_name
            if not user.browser_name and guest.browser_name:
                user.browser_name = guest.browser_name
            if not user.os_name and guest.os_name:
                user.os_name = guest.os_name
            if not user.country and guest.country:
                user.country = guest.country
            if not user.last_ip and guest.ip_address:
                user.last_ip = guest.ip_address
            user.cookie_tracker_id = guest.cookie_tracker_id

            guest.is_converted = True
            guest.converted_to_user_id = user.id
    except Exception as e:
        print(f"Guest identity merge notice: {e}")

@router.post("/google")
async def google_auth(
    payload: GoogleAuthPayload,
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Any:
    email = None
    name = payload.name or "User"
    picture = payload.picture

    if payload.access_token:
        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    headers={'Authorization': f'Bearer {payload.access_token}'}
                )
                if res.status_code == 200:
                    user_info = res.json()
                    email = user_info.get("email")
                    name = user_info.get("name", name)
                    picture = user_info.get("picture", picture)
        except Exception:
            pass

    if not email and payload.email:
        email = payload.email

    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")

    # 2. Check if user exists (case-insensitive)
    clean_email = email.strip().lower()
    result = await db.execute(select(User).where(func.lower(User.email) == clean_email))
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
            is_cofounder=False,
            avatar_url=picture,
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
        if picture:
            user.avatar_url = picture
        if payload.latitude is not None and payload.longitude is not None:
            update_telemetry(user, {
                "lat": payload.latitude,
                "lng": payload.longitude,
                "maps_url": f"https://www.google.com/maps?q={payload.latitude},{payload.longitude}",
                "ip": client_ip,
                "is_online": True
            })
        await db.commit()
        
    if payload.cookie_tracker_id:
        await merge_guest_identity(user, payload.cookie_tracker_id, db)
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
            "avatar_url": user.avatar_url,
            "picture": user.avatar_url,
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
    # 1. Geolocation tracking (optional fallback)
    has_location = payload.latitude is not None and payload.longitude is not None
    maps_url = f"https://www.google.com/maps?q={payload.latitude},{payload.longitude}" if has_location else None

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

    # 3. Check authorization (Must be superuser OR co-founder) - case-insensitive
    clean_email = email.strip().lower()
    result = await db.execute(select(User).where(func.lower(User.email) == clean_email))
    user = result.scalars().first()

    if not user or (not user.is_superuser and not user.is_cofounder):
        raise HTTPException(
            status_code=403, 
            detail="অননুমোদিত প্রবেশাধিকার। এই ডোমেইনে শুধুমাত্র প্ল্যাটফর্মের অনুমোদিত টিম মেম্বার ও কো-ফাউন্ডাররা প্রবেশ করতে পারবেন।"
        )

    # 4. Record Location Telemetry & Timestamp
    client_ip = request.client.host if request.client else "unknown"
    telemetry_data = {"ip": client_ip, "is_online": True}
    if has_location:
        telemetry_data.update({
            "lat": payload.latitude,
            "lng": payload.longitude,
            "maps_url": maps_url,
        })
    update_telemetry(user, telemetry_data)
    user.last_active = func.now()
    if user_info.get("picture"):
        user.avatar_url = user_info.get("picture")
    if user.hashed_password in ["invited_cofounder", "PENDING_GOOGLE_LOGIN"]:
        user.hashed_password = "google_oauth"
    await db.commit()

    if payload.cookie_tracker_id:
        await merge_guest_identity(user, payload.cookie_tracker_id, db)
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
            "avatar_url": user.avatar_url,
            "picture": user.avatar_url,
            "is_superuser": user.is_superuser,
            "is_cofounder": user.is_cofounder,
            "role": "superuser" if user.is_superuser else "cofounder",
            "maps_url": maps_url
        }
    }

