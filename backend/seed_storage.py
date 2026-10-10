import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import SessionLocal
from app.models.storage import StorageNode
from sqlalchemy.future import select

async def seed_storage():
    async with SessionLocal() as db:
        # Check if already exists
        exists = await db.execute(select(StorageNode).where(StorageNode.name == "xpig-storage-v1"))
        if exists.scalar_one_or_none():
            print("Storage nodes already seeded")
            return
            
        node1 = StorageNode(
            name="xpig-storage-v1",
            account_id="2f7e5d019e564f5d3bc298bccab24aad",
            access_key_id="0c345e506583674f9ffe5fb9ae447d9e",
            secret_access_key="256fa77d5cd3eb33e49f17a85c87d9617c233c7aa1936610430622d1b05a135b",
            bucket_name="xpig-storage-v1",
            public_url="https://pub-1080459c8c0a45b9a545f0b3b3fb21c1.r2.dev",
            is_active=True,
            is_full=False
        )
        
        node2 = StorageNode(
            name="xpig-storage-v2",
            account_id="2f7e5d019e564f5d3bc298bccab24aad",
            access_key_id="57ae5e56475c4df45b6e63919844e64d",
            secret_access_key="646724d5778837820e3b2e11994532f32828dc400855f3ea83ea43cebf82bc80",
            bucket_name="xpig-storage-v2",
            public_url="https://pub-1080459c8c0a45b9a545f0b3b3fb21c1.r2.dev",
            is_active=False,
            is_full=False
        )
        
        db.add(node1)
        db.add(node2)
        await db.commit()
        print("Storage nodes seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_storage())
