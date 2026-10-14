import os
from sqlalchemy.future import select
from app.db.session import SessionLocal
from app.models.telegram_bot import BotConfig

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8973869022:AAFPAxRpPKvjRpzqbr4pI0s8q5pVqU0WsGY")
MASTER_ADMIN_USERNAME = "black999xr"

async def get_config(key: str, default: str = "") -> str:
    async with SessionLocal() as db:
        result = await db.execute(select(BotConfig).filter(BotConfig.key == key))
        cfg = result.scalars().first()
        if cfg:
            return cfg.value
        return default

async def set_config(key: str, value: str) -> None:
    async with SessionLocal() as db:
        result = await db.execute(select(BotConfig).filter(BotConfig.key == key))
        cfg = result.scalars().first()
        if cfg:
            cfg.value = value
        else:
            cfg = BotConfig(key=key, value=value)
            db.add(cfg)
        await db.commit()
