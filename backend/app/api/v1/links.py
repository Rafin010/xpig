from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.models.link import ShortLink
from app.schemas.link import ShortLinkCreate, ShortLinkResponse
import string
import random

router = APIRouter()

def generate_random_slug(length=6):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

@router.post("/", response_model=ShortLinkResponse)
async def create_short_link(link_data: ShortLinkCreate, db: AsyncSession = Depends(get_db)):
    # Simple creation, can be protected for admin/bot later
    slug = link_data.slug or generate_random_slug()
    
    # Check if slug exists
    result = await db.execute(select(ShortLink).filter(ShortLink.slug == slug))
    existing = result.scalars().first()
    if existing:
        if link_data.slug:
            raise HTTPException(status_code=400, detail="Slug already exists")
        else:
            slug = generate_random_slug(8) # try again with longer slug
            
    db_link = ShortLink(
        slug=slug,
        destination_url=str(link_data.destination_url)
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
