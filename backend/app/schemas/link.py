from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class ShortLinkCreate(BaseModel):
    destination_url: str
    slug: Optional[str] = None
    first_click_url: Optional[str] = "https://xpig.me"
    second_click_url: Optional[str] = None
    is_ad_mode: Optional[bool] = False
    created_by_telegram_id: Optional[int] = None

class ShortLinkResponse(BaseModel):
    id: int
    slug: str
    destination_url: str
    first_click_url: Optional[str] = "https://xpig.me"
    second_click_url: Optional[str] = None
    is_ad_mode: Optional[bool] = False
    created_by_telegram_id: Optional[int] = None
    clicks: int
    created_at: datetime

    class Config:
        from_attributes = True

class UnlockQuotaRequest(BaseModel):
    telegram_id: int
