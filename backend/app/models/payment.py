from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    subscriber_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # e.g., 'ACTIVE', 'CANCELED', 'EXPIRED'
    status = Column(String(50), nullable=False, default="ACTIVE")
    
    # Billing cycle
    current_period_start = Column(DateTime(timezone=True), server_default=func.now())
    current_period_end = Column(DateTime(timezone=True), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    
    # Gateway reference (CCBill, Paxum, etc.)
    gateway_transaction_id = Column(String(100), unique=True, index=True, nullable=False)
    payment_method = Column(String(50), nullable=False)
    
    # e.g., 'SUCCESS', 'FAILED', 'REFUNDED'
    status = Column(String(50), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
