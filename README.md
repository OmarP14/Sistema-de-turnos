# 💈 Luxo BarberApp — Sistema de Turnos

Sistema completo de gestión de turnos para barbería con notificaciones por WhatsApp.

**Stack:** React (frontend) | Python FastAPI (backend) | SQLite (base de datos) | WhatsApp Business API

---

## ✨ Funcionalidades

### Panel del Barbero
- **Dashboard** con todos los turnos próximos (pendientes, confirmados, completados, cancelados)
- **Agenda semanal** con navegación por días
- **Confirmar, cancelar y completar** turnos desde el panel
- **Historial** de todos los turnos
- **Búsqueda** por nombre, teléfono o servicio
- **Configuración** de días laborales y fechas bloqueadas
- **Login con contraseña** para acceso protegido
- **Actualización automática** cada 30 segundos

### Reserva para Clientes (pública)
- Selección de **servicio** (corte, barba, degradé, etc.)
- Selección de **día disponible** según configuración del barbero
- Selección de **horario disponible** (09:00 a 19:00 cada 30 min)
- Ingreso de **nombre y WhatsApp**
- Prefijo `+54` predeterminado para Argentina

### Notificaciones WhatsApp automáticas
- **Al barbero** cuando se crea un turno nuevo (con opción de confirmar/cancelar por WhatsApp)
- **Al cliente** cuando el barbero confirma el turno
- **Al barbero** recordatorio automático 1 hora antes del turno
- Procesamiento de respuestas: `SI 5` confirma, `NO 5` cancela

### Instalable como PWA
- Se puede agregar a la pantalla de inicio del celular
- Funciona como app nativa en Android e iOS

---

## 🗂️ Estructura del Proyecto

```
TURNOS/
├── backend-python/             ← API Python FastAPI
│   ├── main.py                 ← Punto de entrada
│   ├── config.py               ← Configuración y credenciales
│   ├── database.py             ← Conexión SQLite
│   ├── models.py               ← Modelos SQLAlchemy
│   ├── schemas.py              ← Schemas Pydantic
│   ├── auth.py                 ← JWT autenticación
│   ├── scheduler.py            ← Recordatorios automáticos
│   ├── requirements.txt        ← Dependencias Python
│   ├── routers/
│   │   ├── auth_router.py      ← POST /api/auth/login
│   │   ├── turnos_router.py    ← /api/turnos/*
│   │   ├── config_router.py    ← /api/config/*
│   │   └── webhook_router.py   ← /webhook
│   └── services/
│       ├── turno_service.py    ← Lógica de negocio
│       └── whatsapp_service.py ← Integración WhatsApp API
└── frontend/                   ← React
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx   ← Turnos próximos con acciones
    │   │   ├── Agenda.jsx      ← Vista semanal
    │   │   ├── Reservar.jsx    ← Formulario público del cliente
    │   │   ├── Historial.jsx   ← Historial de turnos
    │   │   ├── Configuracion.jsx ← Config del barbero
    │   │   └── LoginPage.jsx   ← Login del barbero
    │   ├── components/
    │   │   ├── BotonesAccion.jsx
    │   │   └── PrivateRoute.jsx
    │   └── utils/api.js        ← Llamadas al backend
    └── public/
        └── manifest.json       ← Config PWA
```

---

## ⚙️ Requisitos

| Herramienta | Versión |
|-------------|---------|
| Python      | 3.10+   |
| Node.js     | 18+     |
| npm         | 9+      |

---

## 🚀 Instalación y Ejecución

### Backend Python

```bash
cd backend-python

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar
python main.py
```

El servidor arranca en: **http://localhost:8080**

### Frontend React

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

La app abre en: **http://localhost:5173**

---

## 🔐 Accesos

| Rol | URL | Credenciales |
|-----|-----|--------------|
| Barbero | `/login` | admin / quepelo2025 |
| Cliente | `/reservar` | Sin login |

---

## 📡 API REST — Endpoints

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login barbero |
| GET | `/api/config/disponibilidad` | No | Días y fechas disponibles |
| PUT | `/api/config/dias-laborales` | Sí | Actualizar días de trabajo |
| POST | `/api/config/bloquear/{fecha}` | Sí | Bloquear una fecha |
| DELETE | `/api/config/bloquear/{fecha}` | Sí | Desbloquear una fecha |
| GET | `/api/turnos` | Sí | Todos los turnos |
| GET | `/api/turnos/hoy` | Sí | Turnos de hoy |
| GET | `/api/turnos/dia?fecha=` | Sí | Turnos de un día |
| GET | `/api/turnos/ocupados?fecha=` | No | Horarios ocupados |
| GET | `/api/turnos/buscar?q=` | Sí | Buscar turnos |
| POST | `/api/turnos` | No | Crear turno (cliente) |
| PUT | `/api/turnos/{id}/confirmar` | Sí | Confirmar turno |
| PUT | `/api/turnos/{id}/cancelar` | Sí | Cancelar turno |
| PUT | `/api/turnos/{id}/completar` | Sí | Completar turno |
| GET | `/webhook` | No | Verificación Meta |
| POST | `/webhook` | No | Mensajes entrantes WhatsApp |

---

## 💬 Flujo de Mensajes WhatsApp

```
Cliente reserva turno
        ↓
WhatsApp al barbero con datos del turno
(responder SI 5 para confirmar / NO 5 para cancelar)
        ↓
Barbero confirma desde el panel
        ↓
WhatsApp al cliente con confirmación
        ↓
1 hora antes (automático cada 15 min)
        ↓
WhatsApp recordatorio al barbero
```

---

## 📱 Formato de teléfono Argentina

```
54 + código de área + número (sin 0 ni 15)
Ejemplo: 542644819470
```

---

## 📦 Dependencias Python

```
fastapi
uvicorn
sqlalchemy
pyjwt
requests
apscheduler
python-multipart
```
