from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from database import Base


class Turno(Base):
    __tablename__ = "turnos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cliente_nombre = Column(String, nullable=False)
    cliente_telefono = Column(String, nullable=False)
    fecha_hora = Column(DateTime, nullable=False)
    servicio = Column(String, nullable=True)
    estado = Column(String(20), nullable=False, default="PENDIENTE")
    notas = Column(Text, nullable=True)
    recordatorio_enviado = Column(Boolean, default=False)
    creado_en = Column(DateTime, default=func.now())


class ConfigBarbershop(Base):
    __tablename__ = "config_barbershop"

    id = Column(Integer, primary_key=True)
    dias_laborales = Column(String, default="1,2,3,4,5,6")
    barbershop_name = Column(String, nullable=True)
    owner_phone = Column(String, nullable=True)
    whatsapp_phone_number_id = Column(String, nullable=True)
    whatsapp_access_token = Column(String, nullable=True)
    servicios = Column(String, nullable=True)


class FechaBloqueada(Base):
    __tablename__ = "fechas_bloqueadas"

    fecha = Column(String, primary_key=True)
