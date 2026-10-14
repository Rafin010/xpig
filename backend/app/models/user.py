from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, BigInteger
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    is_cofounder = Column(Boolean, default=False)
    avatar_url = Column(String, nullable=True)
    age_verification_status = Column(String, default="PENDING")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_active = Column(DateTime(timezone=True), nullable=True)

    # ── Security, Device & Consumption Telemetry ──
    device_name = Column(String, nullable=True)          # e.g. "Samsung Galaxy S23 (Android 14)"
    browser_name = Column(String, nullable=True)         # e.g. "Chrome 122"
    os_name = Column(String, nullable=True)              # e.g. "Android"
    cookie_tracker_id = Column(String, nullable=True, index=True) # e.g. "xpig_trk_..."
    session_started_at = Column(DateTime(timezone=True), nullable=True) # When current active online session began
    total_clicks = Column(Integer, default=0)            # Clicks/Interactions count
    total_watched_videos = Column(Integer, default=0)    # Number of videos watched
    total_watch_seconds = Column(BigInteger, default=0)  # Total seconds watched
    last_ip = Column(String, nullable=True)              # Last IP address
    country = Column(String, nullable=True)              # Geo country
    city = Column(String, nullable=True)                 # Geo city
