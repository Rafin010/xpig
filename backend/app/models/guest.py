from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class GuestUser(Base):
    __tablename__ = "guest_users"

    id = Column(Integer, primary_key=True, index=True)
    cookie_tracker_id = Column(String, unique=True, index=True, nullable=False) # e.g. "xpig_trk_..."
    ip_address = Column(String, nullable=True)
    country = Column(String, nullable=True)
    city = Column(String, nullable=True)
    isp = Column(String, nullable=True)

    # Device Hardware Specifications
    device_name = Column(String, nullable=True)   # e.g. "Samsung Galaxy (SM-S928B)"
    browser_name = Column(String, nullable=True)  # e.g. "Chrome 122"
    os_name = Column(String, nullable=True)       # e.g. "Android 14"

    # Engagement & Video Consumption
    total_clicks = Column(Integer, default=0)
    total_watched_videos = Column(Integer, default=0)
    total_watch_seconds = Column(BigInteger, default=0)

    # Activity Timestamps & Online Presence
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_active = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    session_started_at = Column(DateTime(timezone=True), server_default=func.now())

    # Guest-to-User Conversion (Lifecycle Continuity)
    is_converted = Column(Boolean, default=False)
    converted_to_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    converted_user = relationship("User", foreign_keys=[converted_to_user_id], lazy="selectin")
