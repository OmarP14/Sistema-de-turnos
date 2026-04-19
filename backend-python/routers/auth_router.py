from fastapi import APIRouter, HTTPException
from schemas import LoginRequest, LoginResponse
from auth import create_token
from config import ADMIN_USERNAME, ADMIN_PASSWORD

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest):
    if body.username != ADMIN_USERNAME or body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    return LoginResponse(token=create_token(body.username))
