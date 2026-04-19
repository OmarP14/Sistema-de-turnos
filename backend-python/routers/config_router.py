from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from database import get_db
from models import ConfigBarbershop, FechaBloqueada
from schemas import DisponibilidadResponse, DiasLaboralesRequest
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
