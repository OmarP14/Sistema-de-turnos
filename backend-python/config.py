import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR / ".env")

# Database
DB_PATH = os.getenv("DB_PATH", str(BASE_DIR / "barbershop.db"))

# Server
PORT = int(os.getenv("PORT", "8080"))

# CORS — en producción poner la URL del frontend: "https://tudominio.com"
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]

# WhatsApp (fallback si no están configurados en DB)
WHATSAPP_API_URL = "https://graph.facebook.com/v22.0"
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
WHATSAPP_ACCESS_TOKEN    = os.getenv("WHATSAPP_ACCESS_TOKEN", "")
WHATSAPP_VERIFY_TOKEN    = os.getenv("WHATSAPP_VERIFY_TOKEN", "barberapp2025")

# Barbershop (fallback si no están configurados en DB)
BARBERSHOP_NAME          = os.getenv("BARBERSHOP_NAME", "Barbershop")
BARBERSHOP_OWNER_PHONE   = os.getenv("BARBERSHOP_OWNER_PHONE", "")

# Admin credentials
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "quepelo2025")

# JWT
JWT_SECRET           = os.getenv("JWT_SECRET", "cambia_esto_en_produccion")
JWT_ALGORITHM        = "HS256"
JWT_EXPIRATION_HOURS = 24
