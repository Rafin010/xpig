import re
import string
import random
from datetime import date
from sqlalchemy.future import select
from app.db.session import SessionLocal
from app.models.link import ShortLink
from app.models.telegram_bot import TelegramUserQuota
from app.bot.config import get_config

URL_REGEX = re.compile(
    r'(https?://[^\s<>"]+|www\.[^\s<>"]+)',
    re.IGNORECASE
)

def generate_random_slug(length=6) -> str:
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def extract_urls(text: str) -> list[str]:
    if not text:
        return []
    return URL_REGEX.findall(text)

async def create_gateway_link(
    original_url: str,
    telegram_id: int | None = None,
    is_ad_mode: bool | None = None
) -> str:
    # Ensure protocol
    dest_url = original_url if original_url.startswith("http") else f"https://{original_url}"
    
    # Check if ad mode is globally enabled if not explicitly passed
    if is_ad_mode is None:
        global_ad_mode = await get_config("is_ad_mode", "false")
        is_ad_mode = global_ad_mode.lower() in ("true", "1", "yes")

    async with SessionLocal() as db:
        # Check if identical link was recently generated for this user
        result = await db.execute(
            select(ShortLink).filter(
                ShortLink.destination_url == dest_url,
                ShortLink.is_ad_mode == is_ad_mode
            )
        )
        existing = result.scalars().first()
        if existing:
            return f"https://xpig.me/link/{existing.slug}"

        slug = generate_random_slug(6)
        while True:
            chk = await db.execute(select(ShortLink).filter(ShortLink.slug == slug))
            if not chk.scalars().first():
                break
            slug = generate_random_slug(7)

        short_link = ShortLink(
            slug=slug,
            destination_url=dest_url,
            first_click_url="https://xpig.me",
            second_click_url=dest_url,
            is_ad_mode=is_ad_mode,
            created_by_telegram_id=telegram_id
        )
        db.add(short_link)
        await db.commit()
        return f"https://xpig.me/link/{slug}"

async def convert_text_links(
    text: str,
    telegram_id: int | None = None,
    is_ad_mode: bool | None = None
) -> tuple[str, int]:
    urls = extract_urls(text)
    if not urls:
        return text, 0

    converted_text = text
    count = 0
    for raw_url in urls:
        # Don't convert existing xpig.me links
        if "xpig.me/link/" in raw_url:
            continue
        gateway_url = await create_gateway_link(raw_url, telegram_id=telegram_id, is_ad_mode=is_ad_mode)
        converted_text = converted_text.replace(raw_url, gateway_url)
        count += 1

    return converted_text, count

async def get_user_quota(telegram_id: int, username: str | None = None) -> TelegramUserQuota:
    today = date.today()
    async with SessionLocal() as db:
        result = await db.execute(
            select(TelegramUserQuota).filter(
                TelegramUserQuota.telegram_id == telegram_id,
                TelegramUserQuota.quota_date == today
            )
        )
        quota = result.scalars().first()
        if not quota:
            quota = TelegramUserQuota(
                telegram_id=telegram_id,
                username=username,
                quota_date=today,
                messages_count=0,
                is_website_unlocked=False
            )
            db.add(quota)
            await db.commit()
            await db.refresh(quota)
        elif username and quota.username != username:
            quota.username = username
            await db.commit()
            await db.refresh(quota)
        return quota

async def increment_user_quota(telegram_id: int) -> int:
    today = date.today()
    async with SessionLocal() as db:
        result = await db.execute(
            select(TelegramUserQuota).filter(
                TelegramUserQuota.telegram_id == telegram_id,
                TelegramUserQuota.quota_date == today
            )
        )
        quota = result.scalars().first()
        if quota:
            quota.messages_count += 1
            await db.commit()
            return quota.messages_count
        return 1

async def unlock_user_quota(telegram_id: int) -> bool:
    today = date.today()
    async with SessionLocal() as db:
        result = await db.execute(
            select(TelegramUserQuota).filter(
                TelegramUserQuota.telegram_id == telegram_id,
                TelegramUserQuota.quota_date == today
            )
        )
        quota = result.scalars().first()
        if quota:
            quota.is_website_unlocked = True
            await db.commit()
            return True
        else:
            quota = TelegramUserQuota(
                telegram_id=telegram_id,
                quota_date=today,
                messages_count=0,
                is_website_unlocked=True
            )
            db.add(quota)
            await db.commit()
            return True
