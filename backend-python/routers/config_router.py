from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from database import get_db
from models import ConfigBarbershop, FechaBloqueada
from schemas import DisponibilidadResponse, DiasLaboralesRequest, BarberiaConfig
from auth import get_current_user

router = APIRouter(prefix="/api/config", tags=["config"])


@router.get("/disponibilidad", response_model=DisponibilidadResponse)
def get_disponibilidad(db: Session = Depends(get_db)):
    config = db.query(ConfigBarbershop).filter(ConfigBarbershop.id == 1).first()
    if not config:
        config = ConfigBarbershop(id=1, dias_laborales="1,2,3,4,5,6")

    dias = [int(d) for d in config.dias_laborales.split(",") if d.strip()]
    hoy = str(date.today())
    fechas = [
        f.fecha
        for f in db.query(FechaBloqueada)
        .filter(FechaBloqueada.fecha >= hoy)
        .all()
    ]
    return DisponibilidadResponse(diasLaborales=dias, fechasBloqueadas=fechas)


@router.put("/dias-laborales", dependencies=[Depends(get_current_user)])
def update_dias(body: DiasLaboralesRequest, db: Session = Depends(get_db)):
    config = db.query(ConfigBarbershop).filter(ConfigBarbershop.id == 1).first()
    if not config:
        config = ConfigBarbershop(id=1)
        db.add(config)
    config.dias_laborales = ",".join(str(d) for d in body.dias)
    db.commit()
    return {"diasLaborales": body.dias}


@router.post("/bloquear/{fecha}", dependencies=[Depends(get_current_user)])
def bloquear(fecha: str, db: Session = Depends(get_db)):
    existing = db.query(FechaBloqueada).filter(FechaBloqueada.fecha == fecha).first()
    if not existing:
        db.add(FechaBloqueada(fecha=fecha))
        db.commit()
    return {"fecha": fecha, "bloqueada": True}


@router.delete("/bloquear/{fecha}", dependencies=[Depends(get_current_user)])
def desbloquear(fecha: str, db: Session = Depends(get_db)):
    db.query(FechaBloqueada).filter(FechaBloqueada.fecha == fecha).delete()
    db.commit()
    return {"fecha": fecha, "bloqueada": False}


@router.get("/barberia", dependencies=[Depends(get_current_user)])
def get_barberia(db: Session = Depends(get_db)):
    cfg = db.query(ConfigBarbershop).filter(ConfigBarbershop.id == 1).first()
    if not cfg:
        return BarberiaConfig()
    return BarberiaConfig(
        barbershop_name=cfg.barbershop_name,
        owner_phone=cfg.owner_phone,
        whatsapp_phone_number_id=cfg.whatsapp_phone_number_id,
        whatsapp_access_token=cfg.whatsapp_access_token,
    )


@router.put("/barberia", dependencies=[Depends(get_current_user)])
def update_barberia(body: BarberiaConfig, db: Session = Depends(get_db)):
    cfg = db.query(ConfigBarbershop).filter(ConfigBarbershop.id == 1).first()
    if not cfg:
        cfg = ConfigBarbershop(id=1)
        db.add(cfg)
    if body.barbershop_name is not None:
        cfg.barbershop_name = body.barbershop_name
    if body.owner_phone is not None:
        cfg.owner_phone = body.owner_phone
    if body.whatsapp_phone_number_id is not None:
        cfg.whatsapp_phone_number_id = body.whatsapp_phone_number_id
    if body.whatsapp_access_token is not None:
        cfg.whatsapp_access_token = body.whatsapp_access_token
    db.commit()
    return {"ok": True}
