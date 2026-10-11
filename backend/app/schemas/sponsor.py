from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SponsorBase(BaseModel):
    name: str
    title: str
    description: Optional[str] = None
    thumbnail_url: str
    video_url: Optional[str] = None
    target_url: str
    badge_text: Optional[str] = "SPONSORED"
    placement: Optional[str] = "feed" # 'feed', 'banner', 'all'
    is_active: Optional[bool] = True
    
    # Ad Engine & Quota
    target_impressions: Optional[int] = 10000
    budget: Optional[float] = 25.0
    spent: Optional[float] = 0.0
    pricing_model: Optional[str] = "CPM"
    status: Optional[str] = "ACTIVE"
    
    # Card Playlist
    in_card_playlist: Optional[bool] = True
    is_fixed_slot: Optional[bool] = False
    fixed_slot_position: Optional[int] = None
    
    # Billing & Invoice
    billing_invoice_number: Optional[str] = None
    billing_status: Optional[str] = "PAID"
    billing_company: Optional[str] = None
    billing_email: Optional[str] = None
    billing_tax_id: Optional[str] = None
    tags: Optional[str] = "Brand, Retargeting"

class SponsorCreate(SponsorBase):
    pass

class Sponsor(SponsorBase):
    id: int
    impressions: int = 0
    clicks: int = 0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
