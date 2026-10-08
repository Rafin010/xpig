from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReportBase(BaseModel):
    category: str
    reason: str

class ReportCreate(ReportBase):
    video_id: int

class Report(ReportBase):
    id: int
    reporter_id: Optional[int]
    video_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class ModerationAction(BaseModel):
    action: str
    reason: str
