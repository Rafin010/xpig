from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, func
from app.db.base import Base

class Sponsor(Base):
    __tablename__ = "sponsors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String(500), nullable=False)
    video_url = Column(String(500), nullable=True)
    target_url = Column(String(500), nullable=False)
    badge_text = Column(String(50), default="SPONSORED")
    placement = Column(String(50), default="feed") # 'feed', 'banner', 'all'
    is_active = Column(Boolean, default=True)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
