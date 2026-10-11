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

class SponsorCreate(SponsorBase):
    pass

class Sponsor(SponsorBase):
    id: int
    impressions: int = 0
    clicks: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
