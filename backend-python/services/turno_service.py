import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import or_, func as sqlfunc
from models import Turno
from schemas import TurnoCreate
from services import whatsapp_service
from config import BARBERSHOP_OWNER_PHONE

log = logging.getLogger(__name__)
FORMATTER = "%d/%m/%Y %H:%M"


def _fmt(dt: datetime) -> str:
    return dt.strftime(FORMATTER)


def crear_turno(db: Session, data: TurnoCreate) -> Turno:
    conflictos = db.query(Turno).filter(
        Turno.fecha_hora == data.fecha_hora,
        Turno.estado != "CANCELADO",
    ).count()
    if conflictos > 0:
        raise ValueError(f"El horario {_fmt(data.fecha_hora)} ya está ocupado")

    next_id = (db.query(sqlfunc.max(Turno.id)).scalar() or 0) + 1
    turno = Turno(
        id=next_id,
        cliente_nombre=data.cliente_nombre,
        cliente_telefono=data.cliente_telefono,
        fecha_hora=data.fecha_hora,
        servicio=data.servicio,
        notas=data.notas,
        estado="PENDIENTE",
        creado_en=datetime.now(),
        recordatorio_enviado=False,
    )
    db.add(turno)
    db.commit()
    db.refresh(turno)

    whatsapp_service.notificar_peluquero(
        BARBERSHOP_OWNER_PHONE, turno.id,
        turno.cliente_nombre, turno.cliente_telefono,
        _fmt(turno.fecha_hora), turno.servicio or "",
    )
    log.info("Turno #%d creado para %s", turno.id, turno.cliente_nombre)
    return turno


def confirmar_turno(db: Session, turno_id: int) -> Turno:
    turno = obtener_por_id(db, turno_id)
    turno.estado = "CONFIRMADO"
    db.commit()
    db.refresh(turno)
    whatsapp_service.enviar_confirmacion(
        turno.cliente_telefono, turno.cliente_nombre,
        _fmt(turno.fecha_hora), turno.servicio or "",
    )
    return turno


def cancelar_turno(db: Session, turno_id: int) -> Turno:
    turno = obtener_por_id(db, turno_id)
    turno.estado = "CANCELADO"
    db.commit()
    db.refresh(turno)
    whatsapp_service.enviar_cancelacion(
        turno.cliente_telefono, turno.cliente_nombre, _fmt(turno.fecha_hora)
    )
    return turno


def completar_turno(db: Session, turno_id: int) -> Turno:
    turno = obtener_por_id(db, turno_id)
    turno.estado = "COMPLETADO"
    db.commit()
    db.refresh(turno)
    return turno


def get_todos(db: Session) -> list[Turno]:
    return db.query(Turno).all()


def get_turnos_del_dia(db: Session, fecha: datetime) -> list[Turno]:
    inicio = fecha.replace(hour=0, minute=0, second=0, microsecond=0)
    fin = fecha.replace(hour=23, minute=59, second=59, microsecond=0)
    return (
        db.query(Turno)
        .filter(Turno.fecha_hora >= inicio, Turno.fecha_hora <= fin)
        .order_by(Turno.fecha_hora)
        .all()
    )


def get_horarios_ocupados(db: Session, fecha: datetime) -> list[Turno]:
    inicio = fecha.replace(hour=0, minute=0, second=0, microsecond=0)
    fin = fecha.replace(hour=23, minute=59, second=59, microsecond=0)
    return (
        db.query(Turno)
        .filter(
            Turno.fecha_hora >= inicio,
            Turno.fecha_hora <= fin,
            Turno.estado != "CANCELADO",
        )
        .order_by(Turno.fecha_hora)
        .all()
    )


def buscar(db: Session, q: str) -> list[Turno]:
    like = f"%{q.lower()}%"
    return (
        db.query(Turno)
        .filter(
            or_(
                func.lower(Turno.cliente_nombre).like(like),
                Turno.cliente_telefono.like(f"%{q}%"),
                func.lower(Turno.servicio).like(like),
            )
        )
        .order_by(Turno.fecha_hora.desc())
        .all()
    )


def obtener_por_id(db: Session, turno_id: int) -> Turno:
    turno = db.query(Turno).filter(Turno.id == turno_id).first()
    if not turno:
        raise ValueError(f"Turno no encontrado con ID: {turno_id}")
    return turno


def enviar_recordatorios(db: Session):
    ahora = datetime.now()
    en_50 = ahora + timedelta(minutes=50)
    en_70 = ahora + timedelta(minutes=70)
    turnos = (
        db.query(Turno)
        .filter(
            Turno.fecha_hora >= en_50,
            Turno.fecha_hora <= en_70,
            Turno.estado == "CONFIRMADO",
            Turno.recordatorio_enviado == False,
        )
        .all()
    )
    for turno in turnos:
        try:
            whatsapp_service.enviar_recordatorio_peluquero(
                BARBERSHOP_OWNER_PHONE, turno.id,
                turno.cliente_nombre, turno.cliente_telefono,
                _fmt(turno.fecha_hora), turno.servicio or ""
            )
            turno.recordatorio_enviado = True
            db.commit()
            log.info("Recordatorio al barbero para turno #%d", turno.id)
        except Exception as e:
            log.error("Error recordatorio turno #%d: %s", turno.id, e)
