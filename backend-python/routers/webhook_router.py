import logging
from fastapi import APIRouter, Query, Request, Response
from sqlalchemy.orm import Session
from fastapi import Depends
from database import get_db
from services import whatsapp_service
from services import turno_service
from config import WHATSAPP_VERIFY_TOKEN

router = APIRouter(prefix="/webhook", tags=["webhook"])
log = logging.getLogger(__name__)


@router.get("")
def verificar(
    hub_mode: str = Query(alias="hub.mode"),
    hub_verify_token: str = Query(alias="hub.verify_token"),
    hub_challenge: str = Query(alias="hub.challenge"),
):
    if hub_mode == "subscribe" and hub_verify_token == WHATSAPP_VERIFY_TOKEN:
        log.info("Webhook verificado correctamente")
        return Response(content=hub_challenge, media_type="text/plain")
    return Response(content="Token inválido", status_code=403)


@router.post("")
async def recibir(request: Request, db: Session = Depends(get_db)):
    try:
        payload = await request.json()
        entry = payload.get("entry", [])
        if not entry:
            return "EVENT_RECEIVED"

        messages = (
            entry[0]
            .get("changes", [{}])[0]
            .get("value", {})
            .get("messages", [])
        )
        if not messages:
            return "EVENT_RECEIVED"

        msg = messages[0]
        telefono = msg.get("from", "")
        texto = msg.get("text", {}).get("body", "")
        log.info("Mensaje entrante de %s: %s", telefono, texto)

        accion = whatsapp_service.procesar_mensaje_entrante(telefono, texto)

        if accion.startswith("CONFIRMAR:"):
            turno_id = int(accion.replace("CONFIRMAR:", ""))
            turno_service.confirmar_turno(db, turno_id)
            log.info("Turno #%d confirmado via WhatsApp", turno_id)

        elif accion.startswith("CANCELAR_ID:"):
            turno_id = int(accion.replace("CANCELAR_ID:", ""))
            turno_service.cancelar_turno(db, turno_id)
            log.info("Turno #%d cancelado via WhatsApp", turno_id)

        elif accion.startswith("CANCELAR_CLIENTE:"):
            log.info("Cliente %s solicitó cancelar su turno", telefono)

    except (ValueError, KeyError, IndexError) as e:
        log.warning("ID inválido en webhook: %s", e)
    except Exception as e:
        log.error("Error procesando webhook: %s", e)

    return "EVENT_RECEIVED"
