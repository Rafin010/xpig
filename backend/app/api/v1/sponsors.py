from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.db.session import get_db
from app.models.sponsor import Sponsor
from app.schemas.sponsor import Sponsor as SponsorSchema, SponsorCreate

router = APIRouter()

@router.get("/", response_model=List[SponsorSchema])
async def get_active_sponsors(
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get all active sponsors. Returns empty array if none exist.
    """
    result = await db.execute(
        select(Sponsor)
        .where(Sponsor.is_active == True)
        .order_by(desc(Sponsor.id))
    )
    return result.scalars().all()

@router.post("/", response_model=SponsorSchema)
async def create_sponsor(
    sponsor_in: SponsorCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    sponsor = Sponsor(
        name=sponsor_in.name,
        title=sponsor_in.title,
        description=sponsor_in.description,
        thumbnail_url=sponsor_in.thumbnail_url,
        video_url=sponsor_in.video_url,
        target_url=sponsor_in.target_url,
        badge_text=sponsor_in.badge_text or "SPONSORED",
        is_active=sponsor_in.is_active if sponsor_in.is_active is not None else True
    )
    db.add(sponsor)
    await db.commit()
    await db.refresh(sponsor)
    return sponsor

@router.delete("/{sponsor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sponsor(
    sponsor_id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(Sponsor).where(Sponsor.id == sponsor_id))
    sponsor = result.scalars().first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    await db.delete(sponsor)
    await db.commit()
    return None

@router.post("/{sponsor_id}/click")
async def track_sponsor_click(
    sponsor_id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(Sponsor).where(Sponsor.id == sponsor_id))
    sponsor = result.scalars().first()
    if sponsor:
        sponsor.clicks = (sponsor.clicks or 0) + 1
        await db.commit()
    return {"status": "ok"}
