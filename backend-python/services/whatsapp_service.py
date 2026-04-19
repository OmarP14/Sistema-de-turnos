import requests
import logging
from config import (
    WHATSAPP_API_URL, WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_ACCESS_TOKEN, BARBERSHOP_NAME,
)

log = logging.getLogger(__name__)

_HEADERS = {
    "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
    "Content-Type": "application/json",
}
_URL = f"{WHATSAPP_API_URL}/{WHATSAPP_PHONE_NUMBER_ID}/messages"


def _clean(phone: str) -> str:
    return "".join(c for c in phone if c.isdigit())


def notificar_peluquero(telefono: str, turno_id: int, cliente_nombre: str,
                        cliente_telefono: str, fecha_hora: str, servicio: str):
    mensaje = (
        f"💈 *{BARBERSHOP_NAME} - Nuevo Turno #{turno_id}*\n\n"
        f"👤 *Cliente:* {cliente_nombre}\n"
        f"📱 *Teléfono:* {cliente_telefono}\n"
        f"📅 *Fecha y hora:* {fecha_hora}\n"
        f"✂️ *Servicio:* {servicio}\n\n"
        f"Respondé *SI {turno_id}* para confirmar\n"
        f"Respondé *NO {turno_id}* para cancelar"
    )
    enviar_texto(telefono, mensaje)


def enviar_confirmacion(telefono: str, nombre: str, fecha_hora: str, servicio: str):
    mensaje = (
        f"✅ *{BARBERSHOP_NAME} - Turno Confirmado*\n\n"
        f"Hola {nombre}! Tu turno está confirmado.\n\n"
        f"📅 *Fecha y hora:* {fecha_hora}\n"
        f"✂️ *Servicio:* {servicio}\n\n"
        f"Si necesitás cancelar, respondé *CANCELAR*.\n"
        f"¡Te esperamos! 💈"
    )
    enviar_texto(telefono, mensaje)


def enviar_recordatorio(telefono: str, nombre: str, fecha_hora: str):
    mensaje = (
        f"⏰ *Recordatorio - {BARBERSHOP_NAME}*\n\n"
        f"Hola {nombre}! En *1 hora* tenés tu turno.\n"
        f"📅 {fecha_hora}\n\n"
        f"Si no podés venir, respondé *CANCELAR*.\n"
        f"¡Te esperamos! 💈"
    )
    enviar_texto(telefono, mensaje)


def enviar_recordatorio_peluquero(telefono: str, turno_id: int, cliente_nombre: str,
                                   cliente_telefono: str, fecha_hora: str, servicio: str):
    mensaje = (
        f"⏰ *Recordatorio - Turno en 1 hora #{turno_id}*\n\n"
        f"👤 *Cliente:* {cliente_nombre}\n"
        f"📱 *Teléfono:* {cliente_telefono}\n"
        f"📅 *Hora:* {fecha_hora}\n"
        f"✂️ *Servicio:* {servicio}"
    )
    enviar_texto(telefono, mensaje)


def enviar_cancelacion(telefono: str, nombre: str, fecha_hora: str):
    mensaje = (
        f"❌ *{BARBERSHOP_NAME} - Turno Cancelado*\n\n"
        f"Hola {nombre}, tu turno del\n"
        f"📅 *{fecha_hora}* fue cancelado.\n\n"
        f"Podés reservar un nuevo turno cuando quieras.\n"
        f"Disculpá los inconvenientes 🙏"
    )
    enviar_texto(telefono, mensaje)


def procesar_mensaje_entrante(telefono: str, texto: str) -> str:
    t = texto.strip().upper()
    if t.startswith("SI "):
        return "CONFIRMAR:" + t.replace("SI ", "", 1).strip()
    if t.startswith("NO "):
        return "CANCELAR_ID:" + t.replace("NO ", "", 1).strip()
    if t == "CANCELAR":
        return "CANCELAR_CLIENTE:" + telefono
    return "DESCONOCIDO"


def enviar_texto(telefono: str, mensaje: str):
    tel = _clean(telefono)
    body = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": tel,
        "type": "text",
        "text": {"body": mensaje},
    }
    _send(body, f"texto a {tel}")


def _send(body: dict, descripcion: str):
    try:
        resp = requests.post(_URL, json=body, headers=_HEADERS, timeout=10)
        if resp.ok:
            log.info("WhatsApp enviado: %s", descripcion)
        else:
            log.error("Error WhatsApp %s %s: %s", descripcion, resp.status_code, resp.text)
    except Exception as e:
        log.error("Error enviando WhatsApp %s: %s", descripcion, e)
