import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from schemas import TurnoCreate, TurnoOut
from auth import get_current_user
from services import turno_service

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/turnos", tags=["turnos"])


def _out(turno) -> dict:
    return jsonable_encoder(TurnoOut.model_validate(turno).model_dump(by_alias=True))


def _out_list(turnos) -> list:
    return [_out(t) for t in turnos]


@router.get("", dependencies=[Depends(get_current_user)])
def get_todos(db: Session = Depends(get_db)):
    return JSONResponse(_out_list(turno_service.get_todos(db)))


@router.get("/hoy", dependencies=[Depends(get_current_user)])
def get_hoy(db: Session = Depends(get_db)):
    return JSONResponse(_out_list(turno_service.get_turnos_del_dia(db, datetime.now())))


@router.get("/dia", dependencies=[Depends(get_current_user)])
def get_dia(fecha: datetime = Query(...), db: Session = Depends(get_db)):
    return JSONResponse(_out_list(turno_service.get_turnos_del_dia(db, fecha)))


@router.get("/ocupados")
def get_ocupados(fecha: datetime = Query(...), db: Session = Depends(get_db)):
    return JSONResponse(_out_list(turno_service.get_horarios_ocupados(db, fecha)))


@router.get("/buscar", dependencies=[Depends(get_current_user)])
def buscar(q: str = Query(...), db: Session = Depends(get_db)):
    return JSONResponse(_out_list(turno_service.buscar(db, q)))


@router.get("/{turno_id}", dependencies=[Depends(get_current_user)])
def get_uno(turno_id: int, db: Session = Depends(get_db)):
    try:
        return JSONResponse(_out(turno_service.obtener_por_id(db, turno_id)))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("", status_code=201)
def crear(body: TurnoCreate, db: Session = Depends(get_db)):
    try:
        turno = turno_service.crear_turno(db, body)
        return JSONResponse(_out(turno), status_code=201)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log.error("Error al crear turno: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{turno_id}/confirmar", dependencies=[Depends(get_current_user)])
def confirmar(turno_id: int, db: Session = Depends(get_db)):
    try:
        return JSONResponse(_out(turno_service.confirmar_turno(db, turno_id)))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{turno_id}/cancelar", dependencies=[Depends(get_current_user)])
def cancelar(turno_id: int, db: Session = Depends(get_db)):
    try:
        return JSONResponse(_out(turno_service.cancelar_turno(db, turno_id)))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{turno_id}/completar", dependencies=[Depends(get_current_user)])
def completar(turno_id: int, db: Session = Depends(get_db)):
    try:
        return JSONResponse(_out(turno_service.completar_turno(db, turno_id)))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
