import os
import re
import asyncio
import logging
from telethon import TelegramClient, events
from telethon.tl.types import MessageMediaPhoto, MessageMediaDocument
from app.bot.config import get_config, set_config
from app.bot.link_service import extract_urls, convert_text_links

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("XPIG_SCRAPER")

SESSION_NAME = "xpig_userbot_session"

async def get_scraper_credentials():
    api_id_str = os.getenv("TELEGRAM_API_ID") or await get_config("telegram_api_id", "2040")
    api_hash = os.getenv("TELEGRAM_API_HASH") or await get_config("telegram_api_hash", "b18441a1ff607e10a989891a5462e627")
    return (int(api_id_str) if api_id_str.isdigit() else 2040), api_hash

async def get_source_chats() -> list[str]:
    # e.g. "@group1, @group2, https://t.me/channel3"
    chats_str = await get_config("scraper_source_chats", "")
    if not chats_str:
        return []
    items = [c.strip() for c in re.split(r'[,\n]+', chats_str) if c.strip()]
    return items

async def start_scraper():
    api_id, api_hash = await get_scraper_credentials()
    if not api_id or not api_hash:
        logger.error(
            "Telegram API_ID or API_HASH is missing! "
            "Please configure TELEGRAM_API_ID and TELEGRAM_API_HASH in .env or via bot settings."
        )
        return

    target_group_str = await get_config("target_group_id", "-1004378410108")
    try:
        target_group = int(target_group_str)
    except ValueError:
        target_group = target_group_str

    client = TelegramClient(SESSION_NAME, api_id, api_hash)
    await client.start()
    logger.info("XPIG Userbot Scraper logged in successfully!")

    # Recent URLs cache to prevent duplicate posts
    seen_links = set()

    @client.on(events.NewMessage)
    async def handler(event):
        # Only process if chat is in source chats list
        sources = await get_source_chats()
        if not sources:
            return

        chat = await event.get_chat()
        chat_id_str = str(event.chat_id or getattr(chat, 'id', ''))
        chat_clean_id = chat_id_str.lstrip("-").lstrip("100")
        chat_user = (getattr(chat, 'username', '') or '').lower()
        chat_username = f"@{chat_user}" if chat_user else chat_id_str

        # Check if message is from target group (ignore our own group to avoid loop)
        target_group_clean = str(target_group).lstrip("-").lstrip("100")
        if chat_clean_id == target_group_clean:
            return

        is_source = False
        for s in sources:
            clean_s = s.strip()
            # If s is a link like https://web.telegram.org/a/#-1004437773711
            if "#-" in clean_s:
                clean_s = clean_s.split("#-")[-1]
            elif "#" in clean_s:
                clean_s = clean_s.split("#")[-1]
            
            clean_s_id = clean_s.lstrip("-").lstrip("100").lstrip("@").lower()

            if clean_s_id and (clean_s_id == chat_clean_id or (chat_user and clean_s_id == chat_user)):
                is_source = True
                break

        if not is_source:
            return

        text = event.raw_text or ""
        urls = extract_urls(text)
        if not urls:
            return

        # Check deduplication
        raw_urls_set = set(urls)
        if raw_urls_set.issubset(seen_links):
            return
        seen_links.update(raw_urls_set)
        if len(seen_links) > 2000:
            seen_links.clear()

        logger.info(f"Detected {len(urls)} link(s) from {chat_username}! Converting for XPIG...")

        # Convert links to XPIG Gateway URLs
        converted_text, count = await convert_text_links(text)
        if "xpig.me" not in converted_text:
            converted_text += "\n\n🔥 **আরও আনকাট ভিডিও দেখতে ভিজিট করুন:** https://xpig.me"

        # Rate limit cushion
        await asyncio.sleep(2)

        try:
            # Check media
            if event.media:
                try:
                    await client.send_file(
                        target_group,
                        file=event.media,
                        caption=converted_text,
                        parse_mode="md"
                    )
                except Exception:
                    await client.send_file(
                        target_group,
                        file=event.media,
                        caption=converted_text
                    )
            else:
                try:
                    await client.send_message(
                        target_group,
                        converted_text,
                        parse_mode="md"
                    )
                except Exception:
                    await client.send_message(
                        target_group,
                        converted_text
                    )
            logger.info(f"Successfully reposted converted links from {chat_username} to target group!")
        except Exception as e:
            logger.error(f"Failed to repost message to target group: {e}")

    logger.info("Scraper is now actively monitoring source chats in background...")
    await client.run_until_disconnected()

if __name__ == "__main__":
    asyncio.run(start_scraper())
