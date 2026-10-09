from pydantic import BaseModel, HttpUrl
from datetime import datetime

class ShortLinkCreate(BaseModel):
    destination_url: HttpUrl
    slug: str = None # Optional custom slug

class ShortLinkResponse(BaseModel):
    id: int
    slug: str
    destination_url: str
    clicks: int
    created_at: datetime

    class Config:
        from_attributes = True
