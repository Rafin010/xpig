from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    video_id = Column(Integer, ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    
    # spam, abuse, copyright, impersonation, illegal, ncii, other
    category = Column(String(50), nullable=False)
    reason = Column(Text, nullable=False)
    
    # PENDING, REVIEWED, RESOLVED, DISMISSED
    status = Column(String(50), default="PENDING")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    video = relationship("Video")
    reporter = relationship("User")

class ModerationLog(Base):
    __tablename__ = "moderation_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_video_id = Column(Integer, ForeignKey("videos.id"), nullable=True)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    action_taken = Column(String(100), nullable=False) # e.g., 'SUSPENDED_VIDEO', 'REJECTED_REPORT'
    reason = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
