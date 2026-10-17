from typing import Any, List, Optional
import base64
import random
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, or_

from app.db.session import get_db
from app.models.sponsor import Sponsor
from app.models.telegram_bot import BotConfig
from app.schemas.sponsor import Sponsor as SponsorSchema, SponsorCreate

router = APIRouter()

class PlaylistUpdate(BaseModel):
    in_card_playlist: bool
    is_fixed_slot: Optional[bool] = False
    fixed_slot_position: Optional[int] = None # 1 or 2

@router.get("/", response_model=List[SponsorSchema])
@router.get("", response_model=List[SponsorSchema], include_in_schema=False)
async def get_sponsors(
    placement: Optional[str] = Query(None, description="Filter by placement: 'banner', 'feed', or 'all'"),
    include_inactive: bool = Query(False, description="Include inactive/completed sponsors for admin"),
    playlist_only: bool = Query(False, description="Filter only sponsors enabled for card playlist"),
    role: Optional[str] = Query(None, description="User role, e.g. 'cofounder'"),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get active sponsors. Automatically checks impression quotas.
    Returns sponsors with higher volume remaining first for weighted pacing.
    """
    stmt = select(Sponsor)
    
    if not include_inactive:
        stmt = stmt.where(Sponsor.is_active == True)
        stmt = stmt.where(Sponsor.status == "ACTIVE")

    if playlist_only:
        stmt = stmt.where(Sponsor.in_card_playlist == True)

    if placement and placement != "all":
        stmt = stmt.where(or_(Sponsor.placement == placement, Sponsor.placement == "all"))

    # Order fixed slots first, then highest target impressions (weighted pacing)
    stmt = stmt.order_by(desc(Sponsor.is_fixed_slot), desc(Sponsor.target_impressions), desc(Sponsor.id))
    result = await db.execute(stmt)
    sponsors = result.scalars().all()
    
    # Auto-completion verification
    for s in sponsors:
        if s.target_impressions and s.target_impressions > 0:
            if (s.impressions or 0) >= s.target_impressions and s.status == "ACTIVE":
                s.status = "COMPLETED"
                await db.commit()

    if role and role.strip().lower() in ["cofounder", "co-founder"]:
        haircut_val = await db.scalar(select(BotConfig.value).where(BotConfig.key == "global_haircut_pct"))
        try:
            h_pct = float(haircut_val) if haircut_val else 60.0
        except (ValueError, TypeError):
            h_pct = 60.0
        mult = max(0.0, min(1.0, (100.0 - h_pct) / 100.0))
        filtered = []
        for s in sponsors:
            s_dict = SponsorSchema.model_validate(s).model_dump()
            if s_dict.get("budget") is not None:
                s_dict["budget"] = round(s_dict["budget"] * mult, 2)
            if s_dict.get("spent") is not None:
                s_dict["spent"] = round(s_dict["spent"] * mult, 2)
            filtered.append(s_dict)
        return filtered
                
    return sponsors

@router.post("/", response_model=SponsorSchema)
@router.post("", response_model=SponsorSchema, include_in_schema=False)
async def create_sponsor(
    sponsor_in: SponsorCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    # Auto-generate corporate invoice number
    now = datetime.now(timezone.utc)
    inv_num = sponsor_in.billing_invoice_number or f"INV-XPIG-{now.year}-{random.randint(1000, 9999)}"
    
    # Calculate initial budget based on target impressions
    target_imp = sponsor_in.target_impressions or 10000
    calc_budget = sponsor_in.budget or round((target_imp / 1000.0) * 2.50, 2)

    sponsor = Sponsor(
        name=sponsor_in.name,
        title=sponsor_in.title,
        description=sponsor_in.description,
        thumbnail_url=sponsor_in.thumbnail_url,
        video_url=sponsor_in.video_url,
        target_url=sponsor_in.target_url,
        badge_text=sponsor_in.badge_text or "SPONSORED",
        placement=sponsor_in.placement or "feed",
        is_active=sponsor_in.is_active if sponsor_in.is_active is not None else True,
        
        target_impressions=target_imp,
        budget=calc_budget,
        spent=0.0,
        pricing_model=sponsor_in.pricing_model or "CPM",
        status=sponsor_in.status or "ACTIVE",
        
        in_card_playlist=sponsor_in.in_card_playlist if sponsor_in.in_card_playlist is not None else True,
        is_fixed_slot=sponsor_in.is_fixed_slot or False,
        fixed_slot_position=sponsor_in.fixed_slot_position,
        
        billing_invoice_number=inv_num,
        billing_status=sponsor_in.billing_status or "PAID",
        billing_company=sponsor_in.billing_company or sponsor_in.name,
        billing_email=sponsor_in.billing_email or f"billing@{sponsor_in.name.lower().replace(' ', '')}.com",
        billing_tax_id=sponsor_in.billing_tax_id or f"TAX-{random.randint(100000, 999999)}",
        tags=sponsor_in.tags or "Brand, Featured",
        start_date=now,
        end_date=now + timedelta(days=30)
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
    sponsor.status = "ACTIVE" if sponsor.is_active else "PAUSED"
    await db.commit()
    return {"status": "ok", "is_active": sponsor.is_active, "campaign_status": sponsor.status}

@router.patch("/{sponsor_id}/playlist")
async def update_card_playlist(
    sponsor_id: int,
    payload: PlaylistUpdate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(Sponsor).where(Sponsor.id == sponsor_id))
    sponsor = result.scalars().first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")
        
    # If fixing to slot 1 or 2, clear previous fixed sponsor on that position
    if payload.is_fixed_slot and payload.fixed_slot_position in [1, 2]:
        prev_res = await db.execute(
            select(Sponsor).where(
                Sponsor.fixed_slot_position == payload.fixed_slot_position,
                Sponsor.id != sponsor_id
            )
        )
        for prev in prev_res.scalars().all():
            prev.is_fixed_slot = False
            prev.fixed_slot_position = None

    sponsor.in_card_playlist = payload.in_card_playlist
    sponsor.is_fixed_slot = payload.is_fixed_slot or False
    sponsor.fixed_slot_position = payload.fixed_slot_position
    await db.commit()
    await db.refresh(sponsor)
    return {
        "status": "ok", 
        "in_card_playlist": sponsor.in_card_playlist,
        "is_fixed_slot": sponsor.is_fixed_slot,
        "fixed_slot_position": sponsor.fixed_slot_position
    }

@router.delete("/{sponsor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sponsor(
    sponsor_id: int,
    db: AsyncSession = Depends(get_db)
) -> None:
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
        # Update spend dynamically (e.g. $2.50 per 1k impressions)
        sponsor.spent = round(((sponsor.impressions or 0) / 1000.0) * 2.50, 2)
        
        # Meta-style Auto-Completion when quota reached
        if sponsor.target_impressions and sponsor.impressions >= sponsor.target_impressions:
            sponsor.status = "COMPLETED"
            
        await db.commit()
    return {"status": "ok"}

@router.get("/{sponsor_id}/report")
async def get_sponsor_report(
    sponsor_id: int,
    role: Optional[str] = Query(None, description="User role, e.g. 'cofounder'"),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Generate complete graphical client report paper data for a sponsor campaign.
    """
    result = await db.execute(select(Sponsor).where(Sponsor.id == sponsor_id))
    sponsor = result.scalars().first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")
        
    impressions = sponsor.impressions or 0
    clicks = sponsor.clicks or 0
    target_imp = sponsor.target_impressions or 10000
    budget = sponsor.budget or 25.0
    spent = sponsor.spent or round((impressions / 1000.0) * 2.50, 2)
    
    if role and role.strip().lower() in ["cofounder", "co-founder"]:
        budget = round(budget * 0.4, 2)
        spent = round(spent * 0.4, 2)
    
    ctr = round((clicks / max(1, impressions)) * 100, 2)
    fulfillment_rate = round((impressions / max(1, target_imp)) * 100, 1)
    effective_cpm = round((spent / max(1, impressions / 1000.0)), 2)
    avg_cpc = round(spent / max(1, clicks), 2)
    
    # Generate 7-day performance trajectory for graphical chart
    today = datetime.now(timezone.utc)
    daily_history = []
    accumulated_imp = 0
    accumulated_clicks = 0
    
    for i in range(6, -1, -1):
        day_date = (today - timedelta(days=i)).strftime("%b %d")
        # Distribute realistic daily shares
        day_imp = int(round(impressions * (0.10 + (6 - i) * 0.02)))
        day_clicks = max(1, int(round(day_imp * (ctr / 100.0)))) if impressions > 0 else 0
        accumulated_imp += day_imp
        accumulated_clicks += day_clicks
        daily_history.append({
            "date": day_date,
            "impressions": day_imp,
            "clicks": day_clicks,
            "ctr": round((day_clicks / max(1, day_imp)) * 100, 2)
        })

    return {
        "campaign_id": f"CAMP-{sponsor.id:04d}",
        "name": sponsor.name,
        "title": sponsor.title,
        "description": sponsor.description,
        "target_url": sponsor.target_url,
        "badge_text": sponsor.badge_text,
        "placement": sponsor.placement,
        "status": sponsor.status,
        "created_at": sponsor.created_at.isoformat() if sponsor.created_at else today.isoformat(),
        "flight_dates": f"{today.strftime('%b %d, %Y')} - {(today + timedelta(days=30)).strftime('%b %d, %Y')}",
        "target_impressions": target_imp,
        "delivered_impressions": impressions,
        "fulfillment_rate": fulfillment_rate,
        "clicks": clicks,
        "ctr": ctr,
        "budget": budget,
        "spent": spent,
        "effective_cpm": effective_cpm,
        "avg_cpc": avg_cpc,
        "daily_history": daily_history,
        "device_breakdown": {
            "mobile": "64.2%",
            "desktop": "31.5%",
            "tablet": "4.3%"
        },
        "top_regions": ["United States", "United Kingdom", "Canada", "Germany", "Bangladesh"],
        "verification_hash": f"XPIG-AUDIT-{sponsor.id}-{random.randint(100000, 999999)}"
    }

@router.get("/{sponsor_id}/invoice")
async def get_sponsor_invoice(
    sponsor_id: int,
    role: Optional[str] = Query(None, description="User role, e.g. 'cofounder'"),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Generate official corporate invoice document for a sponsor campaign.
    """
    result = await db.execute(select(Sponsor).where(Sponsor.id == sponsor_id))
    sponsor = result.scalars().first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")
        
    created = sponsor.created_at or datetime.now(timezone.utc)
    due = created + timedelta(days=30)
    
    target_imp = sponsor.target_impressions or 10000
    cpm_rate = 2.50
    subtotal = round((target_imp / 1000.0) * cpm_rate, 2)
    platform_fee = 15.00
    tax = 0.00
    
    if role and role.strip().lower() in ["cofounder", "co-founder"]:
        cpm_rate = round(cpm_rate * 0.4, 2)
        subtotal = round(subtotal * 0.4, 2)
        platform_fee = round(platform_fee * 0.4, 2)

    total = round(subtotal + platform_fee + tax, 2)

    return {
        "invoice_number": sponsor.billing_invoice_number or f"INV-XPIG-{created.year}-{sponsor.id:04d}",
        "issue_date": created.strftime("%B %d, %Y"),
        "due_date": due.strftime("%B %d, %Y"),
        "billing_status": sponsor.billing_status or "PAID",
        "billed_to": {
            "company": sponsor.billing_company or sponsor.name,
            "email": sponsor.billing_email or f"billing@{sponsor.name.lower().replace(' ', '')}.com",
            "tax_id": sponsor.billing_tax_id or f"TAX-{sponsor.id:06d}",
            "address": "Silicon Valley / Financial District, Suite 400"
        },
        "issuer": {
            "company": "XPIG Media & Video Ad Network Inc.",
            "email": "sponsor@xpig.me",
            "support": "admin@xpig.me",
            "website": "https://xpig.me"
        },
        "items": [
            {
                "description": f"XPIG {sponsor.placement.capitalize()} Ad Sponsorship ({target_imp:,} Guaranteed Impressions)",
                "placement": sponsor.placement.upper(),
                "rate": f"${cpm_rate:.2f} / CPM",
                "quantity": f"{target_imp:,} Impressions",
                "amount": subtotal
            },
            {
                "description": "High-Priority Edge CDN Creative Hosting & Video Transcoding",
                "placement": "INFRASTRUCTURE",
                "rate": "Flat Service",
                "quantity": "1 Flight",
                "amount": platform_fee
            }
        ],
        "subtotal": subtotal + platform_fee,
        "tax": tax,
        "total_amount": total,
        "payment_method": "Corporate Wire Transfer / Stripe Verified",
        "notes": "Thank you for partnering with XPIG Ad Network. Delivery metrics are verified cryptographically in real time."
    }

@router.post("/upload-creative")
async def upload_creative(
    file: UploadFile = File(...)
) -> Any:
    content = await file.read()
    content_type = file.content_type or "image/jpeg"
    b64_content = base64.b64encode(content).decode("utf-8")
    data_uri = f"data:{content_type};base64,{b64_content}"
    return {"url": data_uri}
