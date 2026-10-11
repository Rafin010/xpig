from typing import Any, List, Optional
import base64
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, or_

from app.db.session import get_db
from app.models.sponsor import Sponsor
from app.schemas.sponsor import Sponsor as SponsorSchema, SponsorCreate

router = APIRouter()

@router.get("/", response_model=List[SponsorSchema])
async def get_sponsors(
    placement: Optional[str] = Query(None, description="Filter by placement: 'banner', 'feed', or 'all'"),
    include_inactive: bool = Query(False, description="Include inactive sponsors for admin"),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get active sponsors, optionally filtered by placement. Returns empty array if none exist.
    """
    stmt = select(Sponsor)
    
    if not include_inactive:
        stmt = stmt.where(Sponsor.is_active == True)

    if placement and placement != "all":
        stmt = stmt.where(or_(Sponsor.placement == placement, Sponsor.placement == "all"))

    stmt = stmt.order_by(desc(Sponsor.id))
    result = await db.execute(stmt)
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
        placement=sponsor_in.placement or "feed",
        is_active=sponsor_in.is_active if sponsor_in.is_active is not None else True
    )
    db.add(sponsor)
    await db.commit()
    await db.refresh(sponsor)
    return sponsor

@router.patch("/{sponsor_id}/toggle")
async def toggle_sponsor(
    sponsor_id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(Sponsor).where(Sponsor.id == sponsor_id))
    sponsor = result.scalars().first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    
    sponsor.is_active = not sponsor.is_active
    await db.commit()
    return {"status": "ok", "is_active": sponsor.is_active}

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

@router.post("/{sponsor_id}/impression")
async def track_sponsor_impression(
    sponsor_id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(Sponsor).where(Sponsor.id == sponsor_id))
    sponsor = result.scalars().first()
    if sponsor:
        sponsor.impressions = (sponsor.impressions or 0) + 1
        await db.commit()
    return {"status": "ok"}

@router.post("/upload-creative")
async def upload_creative(
    file: UploadFile = File(...)
) -> Any:
    """
    Upload an image banner creative and return a data URI for direct usage.
    """
    content = await file.read()
    content_type = file.content_type or "image/jpeg"
    b64_content = base64.b64encode(content).decode("utf-8")
    data_uri = f"data:{content_type};base64,{b64_content}"
    return {"url": data_uri}
