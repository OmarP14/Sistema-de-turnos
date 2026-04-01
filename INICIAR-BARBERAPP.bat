@echo off
title BarberApp - Iniciando...
color 0B
cls

echo.
echo  ██████╗  █████╗ ██████╗ ██████╗ ███████╗██████╗  █████╗ ██████╗ ██████╗ 
echo  ██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔══██╗
echo  ██████╔╝███████║██████╔╝██████╔╝█████╗  ██████╔╝███████║██████╔╝██████╔╝
echo  ██╔══██╗██╔══██║██╔══██╗██╔══██╗██╔══╝  ██╔══██╗██╔══██║██╔═══╝ ██╔═══╝ 
echo  ██████╔╝██║  ██║██║  ██║██████╔╝███████╗██║  ██║██║  ██║██║     ██║     
echo  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝     
echo.
echo  Sistema de Turnos para Barberias
echo  ====================================================
echo.

REM ── Verificar que existe la carpeta backend ──────────────────────
if not exist "%~dp0backend" (
    echo  [ERROR] No se encontro la carpeta backend.
    echo  Asegurate de ejecutar este archivo desde la carpeta barbershop.
    pause
    exit
)

REM ── Verificar que existe la carpeta frontend ─────────────────────
if not exist "%~dp0frontend" (
    echo  [ERROR] No se encontro la carpeta frontend.
    pause
    exit
)

REM ── Verificar que Java esta instalado ────────────────────────────
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Java no esta instalado o no esta en el PATH.
    echo  Descargalo desde: https://adoptium.net
    pause
    exit
)

REM ── Verificar que Node.js esta instalado ─────────────────────────
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js no esta instalado.
    echo  Descargalo desde: https://nodejs.org
    pause
    exit
)

echo  [1/3] Iniciando Backend (Java Spring Boot)...
echo  Esto puede tardar unos segundos la primera vez.
echo.
start "BarberApp - Backend" cmd /k "cd /d %~dp0backend && color 0A && echo  BACKEND INICIANDO... && mvn spring-boot:run"

REM ── Esperar que el backend arranque ──────────────────────────────
echo  Esperando que el backend este listo...
timeout /t 12 /nobreak > nul

echo  [2/3] Iniciando Frontend (React + Vite)...
echo.
start "BarberApp - Frontend" cmd /k "cd /d %~dp0frontend && color 0E && echo  FRONTEND INICIANDO... && npm run dev"

REM ── Esperar que el frontend arranque ─────────────────────────────
timeout /t 8 /nobreak > nul

echo  [3/3] Abriendo la app en el navegador...
start http://localhost:5173

cls
echo.
echo  ====================================================
echo   BARBERAPP INICIADA CORRECTAMENTE
echo  ====================================================
echo.
echo   Panel del Peluquero:
echo   http://localhost:5173
echo.
echo   Reserva para Clientes:
echo   http://localhost:5173/reservar
echo.

REM ── Obtener IP local para compartir ──────────────────────────────
echo   Para acceder desde el celular (mismo WiFi):
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set ip=%%a
    goto :mostrar_ip
)
:mostrar_ip
set ip=%ip: =%
echo   http://%ip%:5173
echo   http://%ip%:5173/reservar
echo.
echo  ====================================================
echo   Para CERRAR la app: cierra las ventanas del
echo   Backend y Frontend que se abrieron.
echo  ====================================================
echo.
pause
