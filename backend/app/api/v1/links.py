from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.models.link import ShortLink
from app.models.telegram_bot import TelegramUserQuota
from app.schemas.link import ShortLinkCreate, ShortLinkResponse, UnlockQuotaRequest
from datetime import date
import string
import random

router = APIRouter()

def generate_random_slug(length=6):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

@router.post("/", response_model=ShortLinkResponse)
async def create_short_link(link_data: ShortLinkCreate, db: AsyncSession = Depends(get_db)):
    slug = link_data.slug or generate_random_slug()
    
    # Check if slug exists
    result = await db.execute(select(ShortLink).filter(ShortLink.slug == slug))
    existing = result.scalars().first()
    if existing:
        if link_data.slug:
            raise HTTPException(status_code=400, detail="Slug already exists")
        else:
            slug = generate_random_slug(8)
            
    db_link = ShortLink(
        slug=slug,
        destination_url=str(link_data.destination_url),
        first_click_url=link_data.first_click_url or "https://xpig.me",
        second_click_url=link_data.second_click_url or str(link_data.destination_url),
        is_ad_mode=link_data.is_ad_mode or False,
        created_by_telegram_id=link_data.created_by_telegram_id
    )
    db.add(db_link)
    await db.commit()
    await db.refresh(db_link)
    return db_link

@router.get("/{slug}", response_model=ShortLinkResponse)
async def get_short_link(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ShortLink).filter(ShortLink.slug == slug))
    db_link = result.scalars().first()
    if not db_link:
        raise HTTPException(status_code=404, detail="Link not found")
    return db_link

@router.post("/{slug}/click")
async def register_click(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ShortLink).filter(ShortLink.slug == slug))
    db_link = result.scalars().first()
    if db_link:
        db_link.clicks += 1
        await db.commit()
    return {"success": True}

@router.post("/unlock-quota")
async def unlock_telegram_quota(data: UnlockQuotaRequest, db: AsyncSession = Depends(get_db)):
    today = date.today()
    result = await db.execute(
        select(TelegramUserQuota).filter(
            TelegramUserQuota.telegram_id == data.telegram_id,
            TelegramUserQuota.quota_date == today
        )
    )
    quota = result.scalars().first()
    if not quota:
        quota = TelegramUserQuota(
            telegram_id=data.telegram_id,
            quota_date=today,
            messages_count=0,
            is_website_unlocked=True
        )
        db.add(quota)
    else:
        quota.is_website_unlocked = True
    
    await db.commit()
    await db.refresh(quota)
    return {
        "success": True,
        "telegram_id": quota.telegram_id,
        "is_website_unlocked": quota.is_website_unlocked,
        "messages_count": quota.messages_count
    }

@router.get("/quota/{telegram_id}")
async def get_telegram_quota(telegram_id: int, db: AsyncSession = Depends(get_db)):
    today = date.today()
    result = await db.execute(
        select(TelegramUserQuota).filter(
            TelegramUserQuota.telegram_id == telegram_id,
            TelegramUserQuota.quota_date == today
        )
    )
    quota = result.scalars().first()
    if not quota:
        return {
            "telegram_id": telegram_id,
            "quota_date": str(today),
            "messages_count": 0,
            "is_website_unlocked": False
        }
    return {
        "telegram_id": quota.telegram_id,
        "quota_date": str(quota.quota_date),
        "messages_count": quota.messages_count,
        "is_website_unlocked": quota.is_website_unlocked
    }
