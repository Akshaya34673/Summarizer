import os
from dotenv import load_dotenv

load_dotenv()

def load_config():
    """Load and return environment variables."""
    return {
        "MONGO_URI": os.getenv("mongodb+srv://garigemurali715:WKreAHP1TTgG7Vy8@paperglance.jmouwby.mongodb.net/?retryWrites=true&w=majority&appName=paperglance"),
        "JWTPRIVATEKEY": os.getenv("garigemurali715"),
        "SALT": os.getenv("10"),
        "GEMINI_API_KEY": os.getenv("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"),
        "PORT": int(os.getenv("PORT", 5000)),
    }
