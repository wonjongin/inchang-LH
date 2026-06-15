from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    PROJECT_NAME: str = "Inchang LH Reservation System"
    ENVIRONMENT: str = "development"  # development, production
    DATABASE_URL: str = "sqlite:///./dev.db"
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30
    ADMIN_PW: str = "admin_pw"
    HOST_URL: str = "http://localhost:8000"
    TMAP_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # 알 수 없는 필드는 무시


@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()