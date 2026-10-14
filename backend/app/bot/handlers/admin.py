import logging
from datetime import date
from telegram import (
    Update,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    ReplyKeyboardMarkup,
    KeyboardButton
)
from telegram.constants import ChatType
from telegram.ext import ContextTypes
from sqlalchemy.future import select
from sqlalchemy import func
from app.db.session import SessionLocal
from app.models.link import ShortLink
from app.models.telegram_bot import TelegramUserQuota
from app.bot.config import MASTER_ADMIN_USERNAME, get_config, set_config
from app.bot.link_service import convert_text_links, extract_urls

logger = logging.getLogger(__name__)

# Temporary in-memory draft cache for admin publishing
ADMIN_DRAFTS: dict[str, dict] = {}

# Persistent Reply Keyboard (Pinned at bottom of private chat)
PERSISTENT_KEYBOARD = ReplyKeyboardMarkup(
    [
        [KeyboardButton("🚀 Start / মূল মেনু"), KeyboardButton("⚙️ সেটিংস ও কন্ট্রোল")],
        [KeyboardButton("📊 ট্রাফিক পরিসংখ্যান"), KeyboardButton("🔙 ব্যাক / বাতিল")]
    ],
    resize_keyboard=True,
    is_persistent=True
)

def get_nav_row(back_cb: str = "show_main_menu") -> list[InlineKeyboardButton]:
    """Universal navigation row guaranteeing Back and Start on every message."""
    return [
        InlineKeyboardButton("🔙 ব্যাক (Back)", callback_data=back_cb),
        InlineKeyboardButton("🏠 স্টার্ট (Start)", callback_data="show_main_menu")
    ]

def is_admin(user) -> bool:
    if not user:
        return False
    username = (user.username or "").lower()
    return username == MASTER_ADMIN_USERNAME.lower()

async def check_admin_access(update: Update) -> bool:
    user = update.effective_user
    if is_admin(user):
        # Auto-save master admin ID for permanence
        await set_config("master_admin_id", str(user.id))
        return True
    admin_id_str = await get_config("master_admin_id", "")
    if admin_id_str and str(user.id) == admin_id_str:
        return True
    return False

def get_master_admin_menu_content(user):
    text = (
        f"🔥 **XPIG Traffic Engine - Master Admin Panel**\n"
        f"স্বাগতম, Master Admin @{user.username or user.first_name}!\n\n"
        f"🚀 **আপনার সুপার পাওয়ার:**\n"
        f"• যে কোনো লিংক বা পোস্ট আমাকে পাঠালে তা নিমেষেই XPIG Gateway (`https://xpig.me/link/...`) এ রূপান্তর হবে।\n"
        f"• ১ ক্লিকেই তা আপনার কাস্টম গ্রুপে পাবলিশ করতে পারবেন।\n"
        f"• গ্রুপে সাধারণ ইউজারদের দৈনিক ২ মেসেজ লিমিট ও ওয়েবসাইট ভিজিট রুল সক্রিয়।\n\n"
        f"📌 **কমান্ড তালিকা:**\n"
        f"/settings - গ্রুপ ও ফোর্স-জয়েন সেটিংস\n"
        f"/stats - লাইভ ট্রাফিক ও ক্লিকের পরিসংখ্যান\n"
        f"/help - বিস্তারিত নির্দেশিকা\n"
        f"/back - চলমান কাজ বাতিল ও ব্যাক"
    )
    keyboard = [
        [
            InlineKeyboardButton("⚙️ সেটিংস ও কন্ট্রোল", callback_data="show_settings"),
            InlineKeyboardButton("📊 ট্রাফিক অ্যানালিটিক্স", callback_data="show_stats")
        ],
        [
            InlineKeyboardButton("🌐 XPIG.me ওয়েবসাইট", url="https://xpig.me")
        ],
        [
            InlineKeyboardButton("🔄 রিফ্রেশ (Refresh)", callback_data="show_main_menu"),
            InlineKeyboardButton("❌ মেনু বন্ধ করুন (Close)", callback_data="close_menu")
        ]
    ]
    return text, keyboard

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    is_master = await check_admin_access(update)
    is_pm = update.effective_chat and update.effective_chat.type == ChatType.PRIVATE

    if is_master:
        if update.message and is_pm:
            # Set the persistent bottom keyboard in private chat
            await update.message.reply_text(
                "🔘 **কুইক অ্যাক্সেস কিবোর্ড সক্রিয়:** নিচের বাটনগুলো দিয়েও যেকোনো সময় সহজে নেভিগেট করতে পারবেন।",
                reply_markup=PERSISTENT_KEYBOARD,
                parse_mode="Markdown"
            )

        text, keyboard = get_master_admin_menu_content(user)
        if update.callback_query:
            await update.callback_query.edit_message_text(
                text,
                reply_markup=InlineKeyboardMarkup(keyboard),
                parse_mode="Markdown"
            )
        else:
            await update.message.reply_text(
                text,
                reply_markup=InlineKeyboardMarkup(keyboard),
                parse_mode="Markdown"
            )
    else:
        # Regular user in private chat
        unlock_url = f"https://xpig.me?tg_unlock={user.id}"
        group_url = await get_config("target_group_url", "https://t.me/virallinksharexpig")
        text = (
            f"👋 **স্বাগতম, {user.first_name}!**\n\n"
            f"XPIG লিংকিং গ্রুপে পোস্ট করতে প্রতিদিন আমাদের ওয়েবসাইট ভিজিট করে অনুমতি আনলক করতে হবে।\n\n"
            f"🔗 নিচের বাটনে ক্লিক করে ওয়েবসাইট ভিজিট করুন ও আজকের কোটা আনলক করুন:"
        )
        keyboard = [
            [InlineKeyboardButton("🌐 ভিজিট করে কোটা আনলক করুন", url=unlock_url)],
            [InlineKeyboardButton("👥 অফিসিয়াল গ্রুপে জয়েন করুন", url=group_url)],
            [
                InlineKeyboardButton("🔄 স্ট্যাটাস চেক করুন", callback_data=f"check_unlock:{user.id}"),
                InlineKeyboardButton("🏠 স্টার্ট (Start)", callback_data="show_main_menu")
            ]
        ]
        if update.callback_query:
            await update.callback_query.edit_message_text(
                text,
                reply_markup=InlineKeyboardMarkup(keyboard),
                parse_mode="Markdown"
            )
        else:
            await update.message.reply_text(
                text,
                reply_markup=InlineKeyboardMarkup(keyboard),
                parse_mode="Markdown"
            )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = (
        "📖 **XPIG Bot গাইডলাইন:**\n\n"
        "👑 **অ্যাডমিনদের জন্য:**\n"
        "1. যে কোনো লিংক, টেক্সট, ফটো বা ভিডিও সরাসরি বটকে পাঠান।\n"
        "2. বট অটোমেটিক সব লিংককে `xpig.me/link/...` গেটওয়ে লিংকে কনভার্ট করবে।\n"
        "3. '🚀 Publish to Group' বাটনে চাপলেই সরাসরি আপনার সিলেক্ট করা গ্রুপে পোস্ট যাবে।\n\n"
        "👥 **সাধারণ ইউজারদের জন্য:**\n"
        "1. প্রতিদিন সর্বোচ্চ ২টা লিংক/মেসেজ শেয়ার করার সুযোগ।\n"
        "2. পোস্ট করার আগে দিনে একবার `xpig.me` ওয়েবসাইট ভিজিট করা বাধ্যতামূলক।"
    )
    keyboard = [
        [
            InlineKeyboardButton("⚙️ সেটিংস", callback_data="show_settings"),
            InlineKeyboardButton("📊 অ্যানালিটিক্স", callback_data="show_stats")
        ],
        get_nav_row("show_main_menu"),
        [
            InlineKeyboardButton("❌ বন্ধ করুন (Close)", callback_data="close_menu")
        ]
    ]
    if update.callback_query:
        await update.callback_query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")
    else:
        await update.message.reply_text(text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

async def settings_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await check_admin_access(update):
        if update.message:
            await update.message.reply_text("⛔ আপনি এই কমান্ড ব্যবহারের অনুমতিপ্রাপ্ত নন।")
        return

    force_sub_str = await get_config("force_sub_enabled", "false")
    is_force_sub = force_sub_str.lower() in ("true", "1", "yes")

    group_id = await get_config("target_group_id", "Not configured")
    group_title = await get_config("target_group_title", "Custom Group")
    group_url = await get_config("target_group_url", "https://t.me/virallinksharexpig")

    force_sub_label = "✅ ON (গ্রুপে জয়েন বাধ্যতামূলক)" if is_force_sub else "❌ OFF (সবার জন্য উন্মুক্ত)"

    text = (
        "⚙️ **XPIG সিস্টেম সেটিংস ও গ্রুপ কন্ট্রোল**\n\n"
        f"👥 **সিলেক্টেড টার্গেট গ্রুপ:** `{group_title}`\n"
        f"🆔 **গ্রুপ আইডি:** `{group_id}`\n"
        f"📢 **কাস্টম গ্রুপ ফোর্স-জয়েন:** `{force_sub_label}`\n"
        f"🔗 **গ্রুপ লিংক:** {group_url}\n\n"
        "💡 *গ্রুপ পরিবর্তনের নিয়ম:* আপনার যেকোনো গ্রুপে বটকে অ্যাডমিন বানিয়ে সেখানে `/setgroup` কমান্ড দিন।"
    )

    keyboard = [
        [
            InlineKeyboardButton(
                f"ফোর্স-জয়েন: { 'বন্ধ করুন' if is_force_sub else 'চালু করুন' }",
                callback_data="toggle_force_sub"
            )
        ],
        [
            InlineKeyboardButton("🔄 রিফ্রেশ", callback_data="show_settings"),
            InlineKeyboardButton("👥 গ্রুপ লিংক দেখুন", url=group_url)
        ],
        get_nav_row("show_main_menu"),
        [
            InlineKeyboardButton("❌ বন্ধ করুন (Close)", callback_data="close_menu")
        ]
    ]

    if update.callback_query:
        await update.callback_query.edit_message_text(
            text,
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode="Markdown"
        )
    else:
        await update.message.reply_text(
            text,
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode="Markdown"
        )

async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await check_admin_access(update):
        if update.message:
            await update.message.reply_text("⛔ শুধুমাত্র অ্যাডমিন এই তথ্য দেখতে পারবেন।")
        return

    today = date.today()
    async with SessionLocal() as db:
        res_links = await db.execute(select(func.count(ShortLink.id)))
        total_links = res_links.scalar() or 0

        res_clicks = await db.execute(select(func.sum(ShortLink.clicks)))
        total_clicks = res_clicks.scalar() or 0

        res_users = await db.execute(
            select(func.count(TelegramUserQuota.id)).filter(TelegramUserQuota.quota_date == today)
        )
        today_active_users = res_users.scalar() or 0

        res_unlocked = await db.execute(
            select(func.count(TelegramUserQuota.id)).filter(
                TelegramUserQuota.quota_date == today,
                TelegramUserQuota.is_website_unlocked == True
            )
        )
        today_unlocked_users = res_unlocked.scalar() or 0

    text = (
        "📊 **XPIG লাইভ ট্রাফিক ও বটের পরিসংখ্যান**\n\n"
        f"🔗 **মোট তৈরি করা গেটওয়ে লিংক:** `{total_links}` টি\n"
        f"👆 **মোট প্রাপ্ত ক্লিক সংখ্যা:** `{total_clicks}` টি\n"
        f"👥 **আজকে সক্রিয় গ্রুপ মেম্বার:** `{today_active_users}` জন\n"
        f"🌐 **আজকে ওয়েবসাইট ভিজিটকারী মেম্বার:** `{today_unlocked_users}` জন\n\n"
        "🚀 ট্রাফিক ইঞ্জিন ২৪/৭ নিরবচ্ছিন্নভাবে সচল রয়েছে।"
    )

    keyboard = [
        [
            InlineKeyboardButton("🔄 আপডেট / রিফ্রেশ", callback_data="show_stats")
        ],
        get_nav_row("show_main_menu"),
        [
            InlineKeyboardButton("❌ বন্ধ করুন (Close)", callback_data="close_menu")
        ]
    ]

    if update.callback_query:
        await update.callback_query.edit_message_text(
            text,
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode="Markdown"
        )
    else:
        await update.message.reply_text(
            text,
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode="Markdown"
        )

async def handle_admin_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    data = query.data
    if data == "show_settings":
        await settings_command(update, context)
    elif data == "show_stats":
        await stats_command(update, context)
    elif data == "toggle_force_sub":
        current = await get_config("force_sub_enabled", "false")
        new_val = "false" if current.lower() in ("true", "1", "yes") else "true"
        await set_config("force_sub_enabled", new_val)
        await settings_command(update, context)
    elif data == "show_main_menu":
        user = update.effective_user
        is_master = await check_admin_access(update)
        if is_master:
            text, keyboard = get_master_admin_menu_content(user)
            await query.edit_message_text(
                text,
                reply_markup=InlineKeyboardMarkup(keyboard),
                parse_mode="Markdown"
            )
        else:
            unlock_url = f"https://xpig.me?tg_unlock={user.id}"
            group_url = await get_config("target_group_url", "https://t.me/virallinksharexpig")
            text = (
                f"👋 **স্বাগতম, {user.first_name}!**\n\n"
                f"XPIG লিংকিং গ্রুপে পোস্ট করতে প্রতিদিন আমাদের ওয়েবসাইট ভিজিট করে অনুমতি আনলক করতে হবে।\n\n"
                f"🔗 নিচের বাটনে ক্লিক করে ওয়েবসাইট ভিজিট করুন ও আজকের কোটা আনলক করুন:"
            )
            keyboard = [
                [InlineKeyboardButton("🌐 ভিজিট করে কোটা আনলক করুন", url=unlock_url)],
                [InlineKeyboardButton("👥 অফিসিয়াল গ্রুপে জয়েন করুন", url=group_url)],
                [
                    InlineKeyboardButton("🔄 স্ট্যাটাস চেক করুন", callback_data=f"check_unlock:{user.id}"),
                    InlineKeyboardButton("🏠 স্টার্ট (Start)", callback_data="show_main_menu")
                ]
            ]
            await query.edit_message_text(
                text,
                reply_markup=InlineKeyboardMarkup(keyboard),
                parse_mode="Markdown"
            )
    elif data == "close_menu":
        try:
            await query.message.delete()
        except Exception:
            pass
    elif data.startswith("cancel_draft:"):
        draft_id = data.split(":", 1)[1]
        ADMIN_DRAFTS.pop(draft_id, None)
        await query.edit_message_text(
            "❌ **পোস্ট বাতিল করা হয়েছে।** কোনো কিছু গ্রুপে পাঠানো হয়নি।",
            reply_markup=InlineKeyboardMarkup([
                get_nav_row("show_main_menu")
            ]),
            parse_mode="Markdown"
        )
    elif data.startswith("publish_draft:"):
        draft_id = data.split(":", 1)[1]
        draft = ADMIN_DRAFTS.get(draft_id)
        if not draft:
            await query.edit_message_text(
                "❌ ড্রাফটের মেয়াদ শেষ হয়ে গেছে। পুনরায় লিংক পাঠান।",
                reply_markup=InlineKeyboardMarkup([get_nav_row("show_main_menu")])
            )
            return

        group_id = await get_config("target_group_id", "")
        if not group_id:
            await query.edit_message_text(
                "⚠️ টার্গেট গ্রুপ এখনো সেট করা হয়নি! প্রথমে গ্রুপে গিয়ে `/setgroup` কমান্ড দিন।",
                reply_markup=InlineKeyboardMarkup([get_nav_row("show_main_menu")])
            )
            return

        try:
            target_chat = int(group_id)
            if draft.get("photo"):
                await context.bot.send_photo(
                    chat_id=target_chat,
                    photo=draft["photo"],
                    caption=draft["caption"],
                    parse_mode="Markdown"
                )
            elif draft.get("video"):
                await context.bot.send_video(
                    chat_id=target_chat,
                    video=draft["video"],
                    caption=draft["caption"],
                    parse_mode="Markdown"
                )
            else:
                await context.bot.send_message(
                    chat_id=target_chat,
                    text=draft["text"],
                    parse_mode="Markdown"
                )
            
            await query.edit_message_text(
                "✅ **সফলভাবে গ্রুপে পাবলিশ করা হয়েছে!**",
                reply_markup=InlineKeyboardMarkup([get_nav_row("show_main_menu")])
            )
            ADMIN_DRAFTS.pop(draft_id, None)
        except Exception as e:
            logger.error(f"Error publishing to group: {e}")
            await query.edit_message_text(
                f"❌ গ্রুপে পাঠাতে ত্রুটি হয়েছে: {e}",
                reply_markup=InlineKeyboardMarkup([get_nav_row("show_main_menu")])
            )

async def handle_admin_private_content(update: Update, context: ContextTypes.DEFAULT_TYPE):
    message = update.message
    if not message:
        return

    text = message.text or message.caption or ""
    clean_text = text.strip().lower()

    # Route persistent keyboard buttons or common text commands
    if clean_text in ["🚀 start / মূল মেনু", "start", "/start", "মেনু", "শুরু", "home", "main menu", "🏠 স্টার্ট", "স্টার্ট"]:
        await start_command(update, context)
        return
    if clean_text in ["🔙 ব্যাক / বাতিল", "back", "/back", "বাতিল", "ব্যাক", "ফিরে যান", "cancel", "/cancel", "🔙"]:
        await cancel_command(update, context)
        return
    if clean_text in ["⚙️ সেটিংস ও কন্ট্রোল", "⚙️ সেটিংস", "settings", "/settings", "সেটিংস"]:
        await settings_command(update, context)
        return
    if clean_text in ["📊 ট্রাফিক পরিসংখ্যান", "📊 পরিসংখ্যান", "stats", "/stats", "পরিসংখ্যান"]:
        await stats_command(update, context)
        return
    if clean_text in ["📖 সাহায্য", "help", "/help", "সাহায্য"]:
        await help_command(update, context)
        return

    # If regular user sent other text, guide them
    if not await check_admin_access(update):
        await start_command(update, context)
        return

    urls = extract_urls(text)
    if not urls:
        keyboard = [
            get_nav_row("show_main_menu"),
            [
                InlineKeyboardButton("❌ বন্ধ করুন (Close)", callback_data="close_menu")
            ]
        ]
        await message.reply_text(
            "ℹ️ আপনি কোনো লিংক দেননি। যে কোনো পোস্ট বা লিংক পাঠালে আমি স্বয়ংক্রিয়ভাবে XPIG Gateway বানিয়ে দিব।",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
        return

    # Convert links to XPIG Gateway links
    converted_text, count = await convert_text_links(text, telegram_id=message.from_user.id)

    # Branded footer
    footer = "\n\n🔥 **আরও আনকাট ভিডিও দেখতে ভিজিট করুন:** https://xpig.me"
    if "xpig.me" not in converted_text:
        converted_text += footer

    draft_id = f"draft_{message.message_id}_{message.from_user.id}"
    draft_data = {
        "text": converted_text,
        "caption": converted_text,
        "photo": message.photo[-1].file_id if message.photo else None,
        "video": message.video.file_id if message.video else None
    }
    ADMIN_DRAFTS[draft_id] = draft_data

    reply_preview = (
        f"🎯 **{count}টি লিংক সফলভাবে কনভার্ট করা হয়েছে!**\n\n"
        f"📋 **প্রিভিউ:**\n{converted_text}\n\n"
        "নিচের বাটনে চাপ দিয়ে সরাসরি আপনার গ্রুপে পোস্ট করুন অথবা ব্যাক করুন:"
    )

    keyboard = [
        [InlineKeyboardButton("🚀 Publish to Group Now", callback_data=f"publish_draft:{draft_id}")],
        get_nav_row("show_main_menu"),
        [InlineKeyboardButton("❌ বাতিল করুন (Cancel)", callback_data=f"cancel_draft:{draft_id}")]
    ]

    await message.reply_text(
        reply_preview,
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="Markdown"
    )

async def cancel_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Cancels any pending task/draft and navigates back to main menu."""
    user = update.effective_user
    if user:
        for k in list(ADMIN_DRAFTS.keys()):
            if str(user.id) in k:
                ADMIN_DRAFTS.pop(k, None)
    
    keyboard = [
        get_nav_row("show_main_menu"),
        [
            InlineKeyboardButton("❌ বন্ধ করুন (Close)", callback_data="close_menu")
        ]
    ]
    await update.message.reply_text(
        "✅ **চলমান টাস্ক বা ড্রাফট বাতিল করা হয়েছে।**\nআপনি যেকোনো সময় নতুন কাজ শুরু করতে পারেন।",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="Markdown"
    )

async def set_api_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await check_admin_access(update):
        return
    args = context.args
    keyboard = [
        get_nav_row("show_main_menu"),
        [
            InlineKeyboardButton("❌ বন্ধ করুন (Close)", callback_data="close_menu")
        ]
    ]
    if not args or len(args) < 2:
        await update.message.reply_text(
            "⚠️ ব্যবহারের নিয়ম: `/setapi <API_ID> <API_HASH>`\n\n"
            "উদাহরণ: `/setapi 2847291 3b7a8c9e...`\n"
            "(my.telegram.org থেকে সংগৃহীত)",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode="Markdown"
        )
        return
    api_id = args[0].strip()
    api_hash = args[1].strip()
    await set_config("telegram_api_id", api_id)
    await set_config("telegram_api_hash", api_hash)
    await update.message.reply_text(
        "✅ **Telegram API ID & Hash সফলভাবে সংরক্ষিত হয়েছে!**",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="Markdown"
    )

async def add_source_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await check_admin_access(update):
        return
    args = context.args
    keyboard = [
        get_nav_row("show_main_menu"),
        [
            InlineKeyboardButton("❌ বন্ধ করুন (Close)", callback_data="close_menu")
        ]
    ]
    if not args:
        await update.message.reply_text(
            "⚠️ ব্যবহারের নিয়ম: `/addsource @channel_or_group`\n\nউদাহরণ: `/addsource @viral_media_group`",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode="Markdown"
        )
        return
    new_chat = args[0].strip()
    current = await get_config("scraper_source_chats", "")
    items = [c.strip() for c in current.split(",") if c.strip()]
    if new_chat not in items:
        items.append(new_chat)
        await set_config("scraper_source_chats", ", ".join(items))
        await update.message.reply_text(
            f"✅ **{new_chat}** সফলভাবে স্ক্র্যাপার লিস্টে যুক্ত হয়েছে!\n"
            f"স্ক্র্যাপার এখন এই গ্রুপ থেকে নতুন সব লিংক অটোমেটিক কপি করে আপনার গ্রুপে পাঠাবে।",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode="Markdown"
        )
    else:
        await update.message.reply_text(
            "ℹ️ এই গ্রুপটি আগেই স্ক্র্যাপার লিস্টে যুক্ত করা আছে।",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

async def sources_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await check_admin_access(update):
        return
    keyboard = [
        get_nav_row("show_main_menu"),
        [
            InlineKeyboardButton("❌ বন্ধ করুন (Close)", callback_data="close_menu")
        ]
    ]
    current = await get_config("scraper_source_chats", "")
    items = [c.strip() for c in current.split(",") if c.strip()]
    if not items:
        await update.message.reply_text(
            "📭 বর্তমানে কোনো সোর্স গ্রুপ যুক্ত নেই। `/addsource @group` দিয়ে যুক্ত করুন।",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
        return
    list_str = "\n".join([f"• `{i}`" for i in items])
    await update.message.reply_text(
        f"📋 **বর্তমানে মনিটর করা সোর্স গ্রুপসমূহ ({len(items)}টি):**\n\n{list_str}\n\n"
        "মুছতে চাইলে লিখুন: `/removesource @group`",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="Markdown"
    )

async def remove_source_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await check_admin_access(update):
        return
    args = context.args
    keyboard = [
        get_nav_row("show_main_menu"),
        [
            InlineKeyboardButton("❌ বন্ধ করুন (Close)", callback_data="close_menu")
        ]
    ]
    if not args:
        await update.message.reply_text(
            "⚠️ ব্যবহারের নিয়ম: `/removesource @channel_or_group`",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
        return
    target = args[0].strip()
    current = await get_config("scraper_source_chats", "")
    items = [c.strip() for c in current.split(",") if c.strip()]
    if target in items:
        items.remove(target)
        await set_config("scraper_source_chats", ", ".join(items))
        await update.message.reply_text(
            f"🗑️ **{target}** স্ক্র্যাপার লিস্ট থেকে সরানো হয়েছে।",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode="Markdown"
        )
    else:
        await update.message.reply_text(
            "❌ গ্রুপটি লিস্টে পাওয়া যায়নি।",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
