from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class SiteVisit(Base):
    __tablename__ = "site_visits"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    visited_at = Column(DateTime(timezone=True), server_default=func.now())
    last_active = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # ── Deep Analytics Columns ──
    device_type = Column(String, nullable=True)       # "mobile" | "tablet" | "desktop"
    browser = Column(String, nullable=True)            # "Chrome" | "Safari" | "Firefox" | "Samsung" | ...
    os_name = Column(String, nullable=True)            # "Android" | "iOS" | "Windows" | "Mac" | "Linux"
    referrer_source = Column(String, nullable=True)    # "telegram" | "google" | "direct" | "facebook" | ...
    current_page = Column(String, nullable=True)       # "/watch/123" | "/" | "/search" | ...
