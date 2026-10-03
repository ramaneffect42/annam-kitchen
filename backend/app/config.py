import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"
    JSON_SORT_KEYS = False
    DATABASE = os.getenv("DATABASE_PATH", str(BACKEND_DIR / "instance" / "annam.db"))
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]
