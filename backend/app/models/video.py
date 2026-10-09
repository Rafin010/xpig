from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    thumbnail_url = Column(String, nullable=True)
    preview_url = Column(String, nullable=True)
    duration = Column(Integer, default=0) # in seconds
    views = Column(Integer, default=0)
    total_watch_seconds = Column(Integer, default=0)
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED, FLAGGED, REMOVED
    visibility = Column(String, default="PRIVATE") # PUBLIC, UNLISTED, PRIVATE
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Creator relationship
    creator = relationship("User", backref="videos")
    sources = relationship("VideoSource", back_populates="video", cascade="all, delete-orphan")
    categories = relationship("Category", secondary="video_categories", backref="videos")
    tags = relationship("Tag", secondary="video_tags", backref="videos")

class VideoSource(Base):
    __tablename__ = "video_sources"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    source_type = Column(String, nullable=False) # UPLOAD, EXTERNAL_API, AUTHORIZED_REMOTE_URL, OBJECT_STORAGE, CDN
    source_provider = Column(String, nullable=False) # 'SelfHosted', 'PartnerNetwork'
    source_url = Column(String, nullable=False)
    resolution = Column(String, nullable=True) # 1080p, 720p, 480p, 360p, adaptive
    mime_type = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    video = relationship("Video", back_populates="sources")
