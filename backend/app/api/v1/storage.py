from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from app.db.session import get_db
from app.models.storage import StorageNode

router = APIRouter()

class StorageNodeCreate(BaseModel):
    name: str
    account_id: str
    access_key_id: str
    secret_access_key: str
    bucket_name: str
    public_url: str

from sqlalchemy import func
from app.models.video import VideoSource

class StorageNodeResponse(BaseModel):
    id: int
    name: str
    bucket_name: str
    public_url: str
    total_used_bytes: float
    max_bytes: float
    is_active: bool
    is_full: bool
    video_count: int = 0
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[StorageNodeResponse])
async def get_storage_nodes(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(StorageNode).offset(skip).limit(limit))
    nodes = result.scalars().all()
    
    response_nodes = []
    for node in nodes:
        # Count videos attached to this storage node
        v_count = 0
        if node.public_url:
            clean_url = node.public_url.replace("https://", "").replace("http://", "").split("/")[0]
            count_stmt = select(func.count(VideoSource.id)).where(VideoSource.source_url.contains(clean_url))
            count_res = await db.execute(count_stmt)
            v_count = count_res.scalar() or 0

        # If node has 0 recorded bytes but has videos, estimate 30MB per video or preserve total_used_bytes
        used_bytes = node.total_used_bytes
        if used_bytes == 0 and v_count > 0:
            used_bytes = v_count * 30 * 1024 * 1024 # ~30MB per video

        response_nodes.append(
            StorageNodeResponse(
                id=node.id,
                name=node.name,
                bucket_name=node.bucket_name,
                public_url=node.public_url,
                total_used_bytes=used_bytes,
                max_bytes=node.max_bytes,
                is_active=node.is_active,
                is_full=node.is_full,
                video_count=v_count
            )
        )
    return response_nodes

@router.post("/", response_model=StorageNodeResponse)
async def create_storage_node(
    node_in: StorageNodeCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    node = StorageNode(
        name=node_in.name,
        account_id=node_in.account_id,
        access_key_id=node_in.access_key_id,
        secret_access_key=node_in.secret_access_key,
        bucket_name=node_in.bucket_name,
        public_url=node_in.public_url
    )
    db.add(node)
    await db.commit()
    await db.refresh(node)
    
    # If it's the only node, make it active
    result = await db.execute(select(StorageNode))
    all_nodes = result.scalars().all()
    if len(all_nodes) == 1:
        node.is_active = True
        await db.commit()
        await db.refresh(node)
        
    return node
