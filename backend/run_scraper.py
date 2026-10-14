import sys
import asyncio
from app.scraper.scraper_service import start_scraper

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

if __name__ == "__main__":
    asyncio.run(start_scraper())
