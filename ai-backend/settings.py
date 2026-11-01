from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name:str="nocta-ai"
    port:int=8000
    cors_origins:str="http://localhost:3000"

    class Config:
        env_file=".env"

settings=Settings()