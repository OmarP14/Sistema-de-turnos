from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from datetime import datetime
from typing import Optional


class CamelModel(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
    )


class TurnoCreate(CamelModel):
    cliente_nombre: str
    cliente_telefono: str
    fecha_hora: datetime
    servicio: Optional[str] = None
    notas: Optional[str] = None


class TurnoOut(CamelModel):
    id: int
    cliente_nombre: str
    cliente_telefono: str
    fecha_hora: datetime
    servicio: Optional[str] = None
    estado: str
    notas: Optional[str] = None
    recordatorio_enviado: bool = False
    creado_en: Optional[datetime] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str


class DiasLaboralesRequest(BaseModel):
    dias: list[int]


class DisponibilidadResponse(BaseModel):
    diasLaborales: list[int]
    fechasBloqueadas: list[str]
