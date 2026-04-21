import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import Base, engine
from routers import auth_router, turnos_router, config_router, webhook_router
import scheduler
from config import PORT

logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(name)s - %(message)s")

Base.metadata.create_all(bind=engine)

# SQLite migration: add columns added after initial schema creation
def _migrate():
    from sqlalchemy import text
    with engine.connect() as conn:
        cols = {row[1] for row in conn.execute(text("PRAGMA table_info(config_barbershop)"))}
        for col, ddl in [
            ("barbershop_name", "TEXT"),
            ("owner_phone", "TEXT"),
            ("whatsapp_phone_number_id", "TEXT"),
            ("whatsapp_access_token", "TEXT"),
            ("servicios", "TEXT"),
        ]:
            if col not in cols:
                conn.execute(text(f"ALTER TABLE config_barbershop ADD COLUMN {col} {ddl}"))
        conn.commit()

_migrate()


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.start()
    yield
    scheduler.stop()


app = FastAPI(title="Barbershop API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(turnos_router.router)
app.include_router(config_router.router)
app.include_router(webhook_router.router)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
