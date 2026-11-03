from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "nocta-ai"
    port: int = 8000
    cors_origins: str = "http://localhost:3000"
    groq_api_key: str

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()