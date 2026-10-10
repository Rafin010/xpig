from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class StorageNode(Base):
    __tablename__ = "storage_nodes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    account_id = Column(String, nullable=False)
    access_key_id = Column(String, nullable=False)
    secret_access_key = Column(String, nullable=False)
    bucket_name = Column(String, nullable=False)
    public_url = Column(String, nullable=False)
    
    total_used_bytes = Column(Float, default=0.0)
    max_bytes = Column(Float, default=9.5 * 1024**3) # 9.5 GB
    
    is_active = Column(Boolean, default=False)
    is_full = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
