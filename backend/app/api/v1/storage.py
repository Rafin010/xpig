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

class StorageNodeResponse(BaseModel):
    id: int
    name: str
    bucket_name: str
    public_url: str
    total_used_bytes: float
    max_bytes: float
    is_active: bool
    is_full: bool
    
    class Config:
        orm_mode = True

@router.get("/", response_model=List[StorageNodeResponse])
async def get_storage_nodes(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(StorageNode).offset(skip).limit(limit))
    nodes = result.scalars().all()
    return nodes

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
