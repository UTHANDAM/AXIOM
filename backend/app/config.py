import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env if present
load_dotenv()

class AppSettings(BaseModel):
    PROJECT_NAME: str = "Axiom - Token-Budgeted Coding Agent"
    VERSION: str = "1.0.0"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "gemini-1.5-flash")
    DEFAULT_TOKEN_BUDGET: int = int(os.getenv("DEFAULT_TOKEN_BUDGET", "3000"))
    HARD_TOKEN_LIMIT: int = int(os.getenv("HARD_TOKEN_LIMIT", "7000"))
    MOCK_MODE_IF_NO_KEY: bool = True

settings = AppSettings()

