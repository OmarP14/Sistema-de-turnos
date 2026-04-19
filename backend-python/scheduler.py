import logging
from apscheduler.schedulers.background import BackgroundScheduler
from database import SessionLocal
from services import turno_service

log = logging.getLogger(__name__)
_scheduler = BackgroundScheduler()


def _job_recordatorios():
    db = SessionLocal()
    try:
        turno_service.enviar_recordatorios(db)
    except Exception as e:
        log.error("Error en job recordatorios: %s", e)
    finally:
        db.close()


def start():
    _scheduler.add_job(_job_recordatorios, "interval", minutes=15, id="recordatorios")
    _scheduler.start()
    log.info("Scheduler iniciado — recordatorios cada 15 minutos")


def stop():
    _scheduler.shutdown()
