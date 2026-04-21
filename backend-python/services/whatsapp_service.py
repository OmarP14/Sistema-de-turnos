import requests
import logging
from dataclasses import dataclass
from config import (
    WHATSAPP_API_URL, WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_ACCESS_TOKEN, BARBERSHOP_NAME, BARBERSHOP_OWNER_PHONE,
)

log = logging.getLogger(__name__)


@dataclass
class WAConfig:
    phone_number_id: str
    access_token: str
    barbershop_name: str
    owner_phone: str


def get_default_config() -> WAConfig:
    return WAConfig(
        phone_number_id=WHATSAPP_PHONE_NUMBER_ID,
        access_token=WHATSAPP_ACCESS_TOKEN,
        barbershop_name=BARBERSHOP_NAME,
        owner_phone=BARBERSHOP_OWNER_PHONE,
    )


def _clean(phone: str) -> str:
    return "".join(c for c in phone if c.isdigit())


def notificar_peluquero(cfg: WAConfig, turno_id: int, cliente_nombre: str,
                        cliente_telefono: str, fecha_hora: str, servicio: str):
    mensaje = (
        f"💈 *{cfg.barbershop_name} - Nuevo Turno #{turno_id}*\n\n"
        f"👤 *Cliente:* {cliente_nombre}\n"
        f"📱 *Teléfono:* {cliente_telefono}\n"
        f"📅 *Fecha y hora:* {fecha_hora}\n"
        f"✂️ *Servicio:* {servicio}\n\n"
        f"Respondé *SI {turno_id}* para confirmar\n"
        f"Respondé *NO {turno_id}* para cancelar"
    )
    enviar_texto(cfg, cfg.owner_phone, mensaje)


def enviar_confirmacion(cfg: WAConfig, telefono: str, nombre: str, fecha_hora: str, servicio: str):
    mensaje = (
        f"✅ *{cfg.barbershop_name} - Turno Confirmado*\n\n"
        f"Hola {nombre}! Tu turno está confirmado.\n\n"
        f"📅 *Fecha y hora:* {fecha_hora}\n"
        f"✂️ *Servicio:* {servicio}\n\n"
        f"Si necesitás cancelar, respondé *CANCELAR*.\n"
        f"¡Te esperamos! 💈"
    )
    enviar_texto(cfg, telefono, mensaje)


def enviar_recordatorio_peluquero(cfg: WAConfig, turno_id: int, cliente_nombre: str,
                                   cliente_telefono: str, fecha_hora: str, servicio: str):
    mensaje = (
        f"⏰ *Recordatorio - Turno en 1 hora #{turno_id}*\n\n"
        f"👤 *Cliente:* {cliente_nombre}\n"
        f"📱 *Teléfono:* {cliente_telefono}\n"
        f"📅 *Hora:* {fecha_hora}\n"
        f"✂️ *Servicio:* {servicio}"
    )
    enviar_texto(cfg, cfg.owner_phone, mensaje)


def enviar_cancelacion(cfg: WAConfig, telefono: str, nombre: str, fecha_hora: str):
    mensaje = (
        f"❌ *{cfg.barbershop_name} - Turno Cancelado*\n\n"
        f"Hola {nombre}, tu turno del\n"
        f"📅 *{fecha_hora}* fue cancelado.\n\n"
        f"Podés reservar un nuevo turno cuando quieras.\n"
        f"Disculpá los inconvenientes 🙏"
    )
    enviar_texto(cfg, telefono, mensaje)


def procesar_mensaje_entrante(telefono: str, texto: str) -> str:
    t = texto.strip().upper()
    if t.startswith("SI "):
        return "CONFIRMAR:" + t.replace("SI ", "", 1).strip()
    if t.startswith("NO "):
        return "CANCELAR_ID:" + t.replace("NO ", "", 1).strip()
    if t == "CANCELAR":
        return "CANCELAR_CLIENTE:" + telefono
    return "DESCONOCIDO"


def enviar_texto(cfg: WAConfig, telefono: str, mensaje: str):
    tel = _clean(telefono)
    url = f"{WHATSAPP_API_URL}/{cfg.phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {cfg.access_token}",
        "Content-Type": "application/json",
    }
    body = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": tel,
        "type": "text",
        "text": {"body": mensaje},
    }
    _send(url, headers, body, f"texto a {tel}")


def _send(url: str, headers: dict, body: dict, descripcion: str):
    try:
        resp = requests.post(url, json=body, headers=headers, timeout=10)
        if resp.ok:
            log.info("WhatsApp enviado: %s", descripcion)
        else:
            log.error("Error WhatsApp %s %s: %s", descripcion, resp.status_code, resp.text)
    except Exception as e:
        log.error("Error enviando WhatsApp %s: %s", descripcion, e)
