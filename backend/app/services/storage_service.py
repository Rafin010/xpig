import boto3
import asyncio
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.storage import StorageNode

class StorageService:
    @staticmethod
    async def get_active_node(db: AsyncSession, required_bytes: int) -> Optional[StorageNode]:
        # Find active node
        result = await db.execute(select(StorageNode).where(StorageNode.is_active == True))
        active_node = result.scalar_one_or_none()
        
        if not active_node:
            # If no active node, find any node that is not full
            result = await db.execute(select(StorageNode).where(StorageNode.is_full == False).order_by(StorageNode.id))
            active_node = result.scalars().first()
            if not active_node:
                return None
            active_node.is_active = True
            await db.commit()
            
        # Check if active node has space
        if active_node.total_used_bytes + required_bytes >= active_node.max_bytes:
            # Mark as full
            active_node.is_full = True
            active_node.is_active = False
            
            # Find next available
            result = await db.execute(select(StorageNode).where(StorageNode.is_full == False).order_by(StorageNode.id))
            new_node = result.scalars().first()
            if not new_node:
                await db.commit()
                return None
            
            new_node.is_active = True
            await db.commit()
            return new_node
            
        return active_node

    @staticmethod
    def upload_file_to_r2(file_path: str, destination_name: str, node: StorageNode, content_type: str = "video/mp4") -> str:
        s3 = boto3.client(
            "s3",
            endpoint_url=f"https://{node.account_id}.r2.cloudflarestorage.com",
            aws_access_key_id=node.access_key_id,
            aws_secret_access_key=node.secret_access_key,
            region_name="auto"
        )
        
        extra_args = {}
        if content_type:
            extra_args["ContentType"] = content_type
            
        s3.upload_file(file_path, node.bucket_name, destination_name, ExtraArgs=extra_args)
        base_url = (node.public_url or f"https://{node.bucket_name}.r2.dev").rstrip('/')
        clean_dest = destination_name.lstrip('/')
        return f"{base_url}/{clean_dest}"
