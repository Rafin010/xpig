import sys
import asyncio
from app.bot.main import run_bot

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

if __name__ == "__main__":
    run_bot()
