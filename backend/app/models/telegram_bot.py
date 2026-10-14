from sqlalchemy import Column, Integer, BigInteger, String, Boolean, Date, DateTime, func
from app.db.base import Base

class TelegramUserQuota(Base):
    __tablename__ = "telegram_user_quotas"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(BigInteger, index=True, nullable=False)
    username = Column(String, nullable=True)
    quota_date = Column(Date, index=True, nullable=False)
    messages_count = Column(Integer, default=0, nullable=False)
    is_website_unlocked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BotConfig(Base):
    __tablename__ = "bot_configs"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(String, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
