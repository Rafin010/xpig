from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class SiteVisit(Base):
    __tablename__ = "site_visits"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    visited_at = Column(DateTime(timezone=True), server_default=func.now())
    last_active = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
