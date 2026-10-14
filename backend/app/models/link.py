from sqlalchemy import Column, Integer, BigInteger, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class ShortLink(Base):
    __tablename__ = "short_links"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    destination_url = Column(String, nullable=False)
    first_click_url = Column(String, nullable=True, default="https://xpig.me")
    second_click_url = Column(String, nullable=True)
    is_ad_mode = Column(Boolean, default=False)
    created_by_telegram_id = Column(BigInteger, nullable=True)
    clicks = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
