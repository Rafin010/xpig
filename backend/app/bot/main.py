import logging
import asyncio
from telegram import BotCommand, MenuButtonCommands
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    filters
)
from app.bot.config import BOT_TOKEN
from app.bot.handlers.admin import (
    start_command,
    help_command,
    settings_command,
    stats_command,
    handle_admin_callback,
    handle_admin_private_content,
    set_api_command,
    add_source_command,
    sources_command,
    remove_source_command,
    cancel_command
)
from app.bot.handlers.group import (
    set_group_command,
    handle_group_message,
    handle_check_unlock_callback
)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger("XPIG_BOT")

async def post_init(application):
    """Register official commands and persistent blue Menu button in Telegram."""
    commands = [
        BotCommand("start", "🚀 Start / মূল মেনু"),
        BotCommand("settings", "⚙️ সেটিংস ও গ্রুপ কন্ট্রোল"),
        BotCommand("stats", "📊 ট্রাফিক পরিসংখ্যান"),
        BotCommand("help", "📖 সাহায্য ও নির্দেশিকা"),
        BotCommand("back", "🔙 ব্যাক / বাতিল"),
    ]
    try:
        await application.bot.set_my_commands(commands)
        await application.bot.set_chat_menu_button(menu_button=MenuButtonCommands())
        logger.info("Official Bot commands and persistent Menu button registered successfully.")
    except Exception as e:
        logger.warning(f"Could not register bot commands/menu button: {e}")

def create_bot_application():
    if not BOT_TOKEN:
        raise ValueError("TELEGRAM_BOT_TOKEN is not set.")

    app = ApplicationBuilder().token(BOT_TOKEN).post_init(post_init).build()

    # Commands with friendly aliases
    app.add_handler(CommandHandler(["start", "menu", "main"], start_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler(["cancel", "back"], cancel_command))
    app.add_handler(CommandHandler("settings", settings_command))
    app.add_handler(CommandHandler("stats", stats_command))
    app.add_handler(CommandHandler("setgroup", set_group_command))
    app.add_handler(CommandHandler("setapi", set_api_command))
    app.add_handler(CommandHandler("addsource", add_source_command))
    app.add_handler(CommandHandler("sources", sources_command))
    app.add_handler(CommandHandler("removesource", remove_source_command))

    # Callbacks
    app.add_handler(CallbackQueryHandler(handle_check_unlock_callback, pattern=r"^check_unlock:"))
    app.add_handler(CallbackQueryHandler(handle_admin_callback))

    # Group Messages (link monitoring & conversion)
    app.add_handler(
        MessageHandler(
            filters.ChatType.GROUPS & (filters.TEXT | filters.CAPTION),
            handle_group_message
        )
    )

    # Admin Private Messages (post conversion, navigation routing, and broadcasting)
    app.add_handler(
        MessageHandler(
            filters.ChatType.PRIVATE & (filters.TEXT | filters.CAPTION | filters.PHOTO | filters.VIDEO),
            handle_admin_private_content
        )
    )

    return app

def run_bot():
    logger.info("Starting XPIG Telegram Bot...")
    app = create_bot_application()
    app.run_polling(drop_pending_updates=True)

if __name__ == "__main__":
    run_bot()
