import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.session import SessionLocal
from app.models.user import User
from app.models.video import Video, VideoSource
from app.models.taxonomy import Category, Tag

async def seed():
    async with SessionLocal() as db:
        # Clear existing data
        await db.execute(text("DELETE FROM video_sources"))
        await db.execute(text("DELETE FROM videos"))
        await db.execute(text("DELETE FROM users"))
        await db.commit()

        # Create 3 creators
        creators = []
        for i, name in enumerate(["Alexia_Star", "Fitness_Goddess", "Midnight_Vibes"]):
            user = User(
                username=name,
                email=f"creator{i}@example.com",
                hashed_password="mock_hash_password123",
                is_active=True
            )
            creators.append(user)
            db.add(user)
        await db.commit()
        for c in creators:
            await db.refresh(c)

        titles = [
            "Late Night Yoga Session - Intense Stretching",
            "Summer Beach Vlog - Ibiza 2026 Uncut",
            "Fitness Model Workout Routine",
            "Glamour Photoshoot Behind The Scenes",
            "Hot Tub Relaxation Time",
            "Private Studio Dance Rehearsal",
            "Morning Stretching Routine - Flexibility",
            "Lingerie Try-On Haul - Summer Collection",
            "Poolside Chill & Tanning",
            "Late Night Confessions ASMR",
            "Cheerleader Practice Highlights",
            "Aesthetic Bedroom Vlog",
            "Fitness Competition Prep - Day 14",
            "Shower Routine & Skincare",
            "Cosplay Photo Shoot - Exclusive",
            "Beach Bikini Haul 2026",
            "Pole Dancing Basics - Beginner Class",
            "Gymnast Flexibility Showcase",
            "Massage Therapy - Full Body Relaxation",
            "Sensual Latin Dance Performance"
        ]

        # 20 Unsplash IDs for thumbnails (fitness, girls, fashion, models)
        unsplash_ids = [
            "Ryo3j95f3tQ", "827XUh-hW7g", "a19OVaa2rzA", "uD1pI0Xo31o", "E9xS_j0E9zY",
            "nKC7BJaOQEU", "R-1g0b-k1sY", "a62888pC_n4", "5L1P0aM4x4Y", "eH84xL45zJc",
            "E-ZvykE6cxs", "Q2zYIokG3G0", "7FmZFE-vXw0", "N8l32q5P42E", "6mN-O24Q7W0",
            "qJj3Nsm2yW8", "u-8G_32Y02A", "aWXVxy8BSzc", "O9dITV10P1s", "0yL5x323wIE"
        ]

        cdn_video_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

        for i in range(20):
            creator = creators[i % 3]
            v = Video(
                title=titles[i],
                description=f"Welcome to {creator.username}'s channel! Enjoy this exclusive content.",
                visibility="PUBLIC",
                status="PUBLISHED",
                creator_id=creator.id,
                thumbnail_url=f"https://source.unsplash.com/{unsplash_ids[i]}/800x450",
                duration=600 + (i * 30)
            )
            db.add(v)
            await db.commit()
            await db.refresh(v)

            vs = VideoSource(
                video_id=v.id,
                source_type="CDN",
                source_provider="GlobalCDN",
                source_url=cdn_video_url,
                resolution="1080p",
                mime_type="video/mp4"
            )
            db.add(vs)
            await db.commit()

        print("Database re-seeded with 20 professional mock videos.")

if __name__ == "__main__":
    asyncio.run(seed())
