import asyncio
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ChatMember
from telegram.ext import ContextTypes
from telegram.constants import ChatType
from app.bot.config import MASTER_ADMIN_USERNAME, get_config, set_config
from app.bot.link_service import (
    extract_urls,
    convert_text_links,
    get_user_quota,
    increment_user_quota,
    unlock_user_quota
)

logger = logging.getLogger(__name__)

async def auto_delete_message(bot, chat_id: int, message_id: int, delay_seconds: int = 20):
    await asyncio.sleep(delay_seconds)
    try:
        await bot.delete_message(chat_id=chat_id, message_id=message_id)
    except Exception:
        pass

async def is_group_admin_or_master(update: Update, context: ContextTypes.DEFAULT_TYPE) -> bool:
    user = update.effective_user
    chat = update.effective_chat
    if not user:
        return False

    # Check Master Admin
    if (user.username or "").lower() == MASTER_ADMIN_USERNAME.lower():
        return True
    
    master_id = await get_config("master_admin_id", "")
    if master_id and str(user.id) == master_id:
        return True

    # Check Telegram Group Admin status
    if chat.type in [ChatType.GROUP, ChatType.SUPERGROUP]:
        try:
            member = await context.bot.get_chat_member(chat.id, user.id)
            if member.status in [ChatMember.ADMINISTRATOR, ChatMember.OWNER]:
                return True
        except Exception as e:
            logger.warning(f"Error checking chat admin: {e}")

    return False

async def set_group_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat = update.effective_chat
    if chat.type not in [ChatType.GROUP, ChatType.SUPERGROUP]:
        await update.message.reply_text("⚠️ এই কমান্ডটি শুধুমাত্র টেলিগ্রাম গ্রুপে ব্যবহার করতে হবে।")
        return

    # Must be admin
    if not await is_group_admin_or_master(update, context):
        await update.message.reply_text("⛔ শুধুমাত্র অ্যাডমিন এই গ্রুপ সেট করতে পারবেন।")
        return

    group_url = ""
    try:
        if chat.username:
            group_url = f"https://t.me/{chat.username}"
        else:
            invite = await context.bot.create_chat_invite_link(chat.id)
            group_url = invite.invite_link
    except Exception as e:
        logger.warning(f"Could not generate invite link: {e}")
        group_url = await get_config("target_group_url", "https://t.me/virallinksharexpig")

    await set_config("target_group_id", str(chat.id))
    await set_config("target_group_title", chat.title or "XPIG Group")
    if group_url:
        await set_config("target_group_url", group_url)

    msg = await update.message.reply_text(
        f"✅ **এই গ্রুপটি সফলভাবে XPIG ট্রাফিক ইঞ্জিনের প্রধান গ্রুপ হিসেবে সেট করা হয়েছে!**\n\n"
        f"📌 গ্রুপ নাম: `{chat.title}`\n"
        f"🆔 গ্রুপ আইডি: `{chat.id}`\n"
        f"🔗 গ্রুপ লিংক: {group_url}\n\n"
        f"এখন থেকে শুধুমাত্র এই নির্দিষ্ট গ্রুপেই ফোর্স-জয়েন, ২ মেসেজ লিমিট ও ওয়েবসাইট ট্রাফিক সিস্টেম স্বয়ংক্রিয়ভাবে কার্যকর থাকবে।",
        parse_mode="Markdown"
    )
    # Auto clean after 30 seconds
    asyncio.create_task(auto_delete_message(context.bot, chat.id, msg.message_id, 30))

async def handle_group_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    message = update.message
    if not message or not message.from_user:
        return

    chat = update.effective_chat
    if chat.type not in [ChatType.GROUP, ChatType.SUPERGROUP]:
        return

    user = message.from_user
    is_admin = await is_group_admin_or_master(update, context)

    text = message.text or message.caption or ""
    urls = extract_urls(text)
    # Ignore if links are already xpig.me gateway links
    external_urls = [u for u in urls if "xpig.me" not in u.lower()]

    if external_urls:
        quota_note = ""
        if not is_admin:
            # Check Custom Group Force-Join if enabled
            force_sub_enabled = await get_config("force_sub_enabled", "false")
            target_group_id = await get_config("target_group_id", "")
            target_group_url = await get_config("target_group_url", "https://t.me/virallinksharexpig")

            if force_sub_enabled.lower() in ("true", "1", "yes") and target_group_id:
                try:
                    target_id_num = int(target_group_id)
                    sub_member = await context.bot.get_chat_member(target_id_num, user.id)
                    if sub_member.status in [ChatMember.LEFT, ChatMember.BANNED]:
                        await message.delete()
                        keyboard = [
                            [InlineKeyboardButton("👥 জয়েন গ্রুপ (Join Group)", url=target_group_url)],
                            [InlineKeyboardButton("🔄 স্ট্যাটাস ভেরিফাই করুন", callback_data=f"check_unlock:{user.id}")]
                        ]
                        warn = await chat.send_message(
                            f"⚠️ {user.mention_markdown()}, লিংক পোস্ট করার পূর্বে আমাদের অফিসিয়াল গ্রুপে জয়েন থাকতে হবে!\n\n"
                            f"👉 জয়েন না করে গ্রুপে কোনো পোস্ট বা মেসেজ পাঠানো যাবে না।",
                            reply_markup=InlineKeyboardMarkup(keyboard),
                            parse_mode="Markdown"
                        )
                        asyncio.create_task(auto_delete_message(context.bot, chat.id, warn.message_id, 25))
                        return
                except Exception as e:
                    logger.error(f"Custom group check failed: {e}")

            # Check today's quota
            quota = await get_user_quota(user.id, user.username)

            # Check website unlock rule
            if not quota.is_website_unlocked:
                try:
                    await message.delete()
                except Exception:
                    pass

                unlock_url = f"https://xpig.me?tg_unlock={user.id}"
                keyboard = [
                    [InlineKeyboardButton("🌐 Visit xpig.me to Unlock", url=unlock_url)],
                    [InlineKeyboardButton("🔄 Verify Status", callback_data=f"check_unlock:{user.id}")]
                ]
                warn_text = (
                    f"⚠️ {user.mention_markdown()}, গ্রুপে লিংক শেয়ার করার পূর্বে আজকের অনুমতি আনলক করতে "
                    f"অনুগ্রহ করে আমাদের ওয়েবসাইট ভিজিট করুন!\n\n"
                    f"👇 নিচের বাটনে ক্লিক করে ওয়েবসাইট একবার ঘুরে আসুন:"
                )
                warn_msg = await chat.send_message(
                    warn_text,
                    reply_markup=InlineKeyboardMarkup(keyboard),
                    parse_mode="Markdown"
                )
                asyncio.create_task(auto_delete_message(context.bot, chat.id, warn_msg.message_id, 25))
                return

            # Check 2 links per day limit
            if quota.messages_count >= 2:
                try:
                    await message.delete()
                except Exception:
                    pass

                warn_msg = await chat.send_message(
                    f"⛔ {user.mention_markdown()}, আপনার আজকের দৈনিক সর্বোচ্চ ২টা লিংক শেয়ারের লিমিট পূর্ণ হয়েছে!\n"
                    f"আগামীকাল আবার শেয়ার করতে পারবেন।",
                    parse_mode="Markdown"
                )
                asyncio.create_task(auto_delete_message(context.bot, chat.id, warn_msg.message_id, 15))
                return

            # User is eligible! Increment quota
            new_count = await increment_user_quota(user.id)
            remaining = max(0, 2 - new_count)
            quota_note = f"\n\n*(📊 আজকের বাকি লিমিট: {remaining} টি)*"

        # Convert links to XPIG Gateway links
        converted_text, count = await convert_text_links(text, telegram_id=user.id)
        if "xpig.me" not in converted_text:
            converted_text += "\n\n🔥 **আরও আনকাট ভিডিও দেখতে ভিজিট করুন:** https://xpig.me"

        # Delete user's raw message
        try:
            await message.delete()
        except Exception:
            pass

        # Post the gateway branded link
        author_display = f"@{user.username}" if user.username else user.first_name
        post_content = (
            f"👤 **{author_display} এর শেয়ার করা লিংক:**\n\n"
            f"{converted_text}{quota_note}"
        )

        if message.photo:
            await chat.send_photo(
                photo=message.photo[-1].file_id,
                caption=post_content,
                parse_mode="Markdown"
            )
        elif message.video:
            await chat.send_video(
                video=message.video.file_id,
                caption=post_content,
                parse_mode="Markdown"
            )
        else:
            await chat.send_message(
                post_content,
                parse_mode="Markdown"
            )

async def handle_check_unlock_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    if not query:
        return

    data = query.data or ""
    if not data.startswith("check_unlock:"):
        return

    target_user_id_str = data.split(":", 1)[1]
    clicker_user = update.effective_user

    # Ensure only the user themselves can check their unlock
    if str(clicker_user.id) != target_user_id_str:
        await query.answer("⚠️ এই বাটনটি শুধুমাত্র উক্ত ইউজারের জন্য প্রযোজ্য।", show_alert=True)
        return

    quota = await get_user_quota(clicker_user.id, clicker_user.username)
    if quota.is_website_unlocked:
        await query.answer("✅ আপনার আজকের কোটা সক্রিয় হয়েছে! এখন আপনি লিংক শেয়ার করতে পারেন।", show_alert=True)
        try:
            await query.message.delete()
        except Exception:
            pass
    else:
        await query.answer(
            "⚠️ ওয়েবসাইট ভিজিট এখনো সম্পন্ন হয়নি! অনুগ্রহ করে 'Visit xpig.me to Unlock' বাটনে ক্লিক করে ওয়েবসাইটটি একবার ওপেন করুন।",
            show_alert=True
        )
