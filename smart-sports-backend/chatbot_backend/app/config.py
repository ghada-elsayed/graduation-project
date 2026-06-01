# app/config.py
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
load_dotenv()

class Settings(BaseSettings):
    GROQ_API_KEY: str
    PINECONE_API_KEY: str
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── Model settings ──────────────────────────────
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    EMBEDDING_MODEL: str = "BAAI/bge-large-en-v1.5"

    # ── App settings ────────────────────────────────
    MAX_HISTORY: int = 20
    UPLOAD_DIR: str = "./uploads"
    PORT: int = 8001

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()