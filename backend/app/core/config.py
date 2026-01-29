from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "dev"
    DATABASE_URL: str = "sqlite:///./app.db"

    SESSION_COOKIE_NAME: str = "session"
    SESSION_TTL_DAYS: int = 14

    BOOTSTRAP_ADMIN_USERNAME: str = "admin"
    BOOTSTRAP_ADMIN_PASSWORD: str = "admin123"


settings = Settings()
