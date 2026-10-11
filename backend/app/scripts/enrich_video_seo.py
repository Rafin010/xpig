"""
Production Video Metadata & SEO Enrichment Utility for XPIG.me.
Enriches existing database videos with high-ranking keywords, descriptive titles,
and rich descriptions to ensure maximum SERP visibility for Google and search crawlers.
"""
import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.db.session import SessionLocal
from app.models.video import Video

CURATED_TITLES = [
    "Deshi Bhabi Viral Video - বাংলা ১৮+ এক্সক্লুসিভ কালেকশন (1080p HD)",
    "Bangla Sex Video - সেরা দেশি ও ভাইরাল ভিডিও কালেকশন HD",
    "Bangladeshi Viral Video Links - নতুন বাংলা অ্যাডাল্ট ক্লিপস",
    "Deshi Hot Couples Video - বাংলা ১৮ প্লাস বিনোদন XPIG",
    "Teacher and Student Deshi Viral Video - ফুল এইচডি স্ট্রিমিং",
    "Desi XXX Video - সেরা বাংলা ও দেশি ভাইরাল সংগ্রহ",
    "Bangla Bhabi Hot Leaked Video - দেশি কালেকশন XPIG.me",
    "Chuda Chudi Video - দেশি কাপল ভাইরাল ক্লিপস HD",
    "Bangla Viral Video Links - প্রতিদিনের নতুন আপডেট XPIG",
    "Deshi Girl Hot Video - বাংলা ১৮+ অ্যাডাল্ট ক্লিপস Full HD",
    "Bangladeshi Bhabi Private Video - দেশি ভাইরাল সংগ্রহ",
    "Bangla HD Adult Video - সেরা বাংলা বিনোদন XPIG.me",
]

DEFAULT_DESCRIPTION_TEMPLATE = (
    "Watch exclusive Bangla sex video and Deshi viral video collection in Full HD 1080p on XPIG.me. "
    "সেরা বাংলা ও দেশি অ্যাডাল্ট ভিডিও কালেকশন, ভাইরাল ভিডিও লিংক এবং ১৮+ ভিডিও স্ট্রিমিং প্ল্যাটফর্ম। "
    "Fast streaming powered by Cloudflare R2 on XPIG.me."
)

def enrich_videos():
    db = SessionLocal()
    try:
        videos = db.query(Video).all()
        print(f"Found {len(videos)} videos in database.")
        
        enriched_count = 0
        for idx, video in enumerate(videos):
            needs_update = False
            
            # Check if title is generic
            is_generic_title = (
                not video.title
                or video.title.lower().startswith("video ")
                or video.title.isdigit()
                or len(video.title.strip()) < 8
            )
            
            if is_generic_title:
                chosen_title = CURATED_TITLES[idx % len(CURATED_TITLES)]
                video.title = f"{chosen_title} #{video.id}"
                needs_update = True
            
            # Check if description is missing or short
            if not video.description or len(video.description.strip()) < 20:
                video.description = f"{video.title} - {DEFAULT_DESCRIPTION_TEMPLATE}"
                needs_update = True
            
            if needs_update:
                enriched_count += 1
        
        if enriched_count > 0:
            db.commit()
            print(f"Successfully enriched {enriched_count} videos with Ultra Pro SEO titles and descriptions!")
        else:
            print("All videos already have rich SEO titles and descriptions.")
            
    except Exception as e:
        db.rollback()
        print(f"Error enriching videos: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    enrich_videos()
