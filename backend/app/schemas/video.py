from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class VideoSourceBase(BaseModel):
    source_type: str
    source_provider: str
    source_url: str
    resolution: Optional[str] = None
    mime_type: Optional[str] = None

class VideoSourceCreate(VideoSourceBase):
    pass

class VideoSource(VideoSourceBase):
    id: int
    video_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None
    visibility: Optional[str] = "PRIVATE"
    thumbnail_url: Optional[str] = None
    preview_url: Optional[str] = None

class VideoCreate(VideoBase):
    pass

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[str] = None
    status: Optional[str] = None
    thumbnail_url: Optional[str] = None
    preview_url: Optional[str] = None

class VideoInDBBase(VideoBase):
    id: int
    creator_id: int
    thumbnail_url: Optional[str] = None
    preview_url: Optional[str] = None
    duration: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class Video(VideoInDBBase):
    sources: List[VideoSource] = []
