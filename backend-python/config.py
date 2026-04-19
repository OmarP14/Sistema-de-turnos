import os
from pathlib import Path

BASE_DIR = Path(__file__).parent

# Database
DB_PATH = os.getenv("DB_PATH", str(BASE_DIR / "barbershop.db"))

# Server
PORT = int(os.getenv("PORT", "8080"))

# WhatsApp
WHATSAPP_API_URL = "https://graph.facebook.com/v22.0"
WHATSAPP_PHONE_NUMBER_ID = "969778306228834"
WHATSAPP_ACCESS_TOKEN = "EAAdvvmfpthUBRKyD026qDbQBl3iELbIgaRSthgQPUUJ7kE4pXyfqJnfyOqXmUO2IxnMlVTgl7d5g6ywnjJVzczQS42hmQtFKMJJoaVINeSOc6ge3GkT4GPlpCqjzXeu5kZAhu4B3CZC26ukE4IJGHzskLD5qcMgaDJUNC7hzTFbem4CGPx6IiHNYy9c1CgY5VKbCOCftSgRKOwiJnjL8qb6TQOH7dBmahAdZC34Jkq9ZBx3BjvZAjZBb4LMsZAag1EDYZCeWQU0pyZCC1OPh2NXv86AZDZD"
WHATSAPP_VERIFY_TOKEN = "barberapp2025"

# Barbershop
BARBERSHOP_NAME = "Luxo"
BARBERSHOP_OWNER_PHONE = "542644819470"

# Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "quepelo2025"

# JWT
JWT_SECRET = "7a3f8c2d1e9b4f6a5c0d7e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
