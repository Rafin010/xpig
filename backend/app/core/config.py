from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PIG"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "SUPER_SECRET_KEY_CHANGE_ME_IN_PRODUCTION"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    DATABASE_URL: str = "sqlite+aiosqlite:///./xpig.db"

    # Cloudflare R2
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "xpig-videos"
    R2_PUBLIC_URL: str = "" # e.g. https://pub-xxxxxxxx.r2.dev

    # Telegram Bot
    TELEGRAM_BOT_TOKEN: str = "8973869022:AAFPAxRpPKvjRpzqbr4pI0s8q5pVqU0WsGY"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
