from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, func
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
    
    # Meta/YouTube Ad Engine Quota & Pacing
    target_impressions = Column(Integer, default=10000)
    budget = Column(Float, default=25.0)
    spent = Column(Float, default=0.0)
    pricing_model = Column(String(50), default="CPM") # 'CPM', 'FLAT_RATE', 'CPC'
    status = Column(String(50), default="ACTIVE") # 'ACTIVE', 'PAUSED', 'COMPLETED'
    
    # Homepage 2-Card Playlist & Pinning
    in_card_playlist = Column(Boolean, default=True)
    is_fixed_slot = Column(Boolean, default=False)
    fixed_slot_position = Column(Integer, nullable=True) # 1 or 2
    
    # Corporate Billing & Invoicing
    billing_invoice_number = Column(String(100), nullable=True)
    billing_status = Column(String(50), default="PAID") # 'PAID', 'PENDING', 'OVERDUE'
    billing_company = Column(String(255), nullable=True)
    billing_email = Column(String(255), nullable=True)
    billing_tax_id = Column(String(100), nullable=True)
    tags = Column(String(255), default="Brand, Retargeting")
    
    # Scheduling
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
