from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/resumedb"
    GROQ_API_KEY: str = "gsk_placeholder_please_set_in_env"
    SECRET_KEY: str = "38b30f4cf22da4a8d0554cbe572e90f23cb5eb04bcf8f60f612d1b8c8d8bcfdb"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
