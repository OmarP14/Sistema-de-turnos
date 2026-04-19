# 💈 BarbershopNet - App de Turnos con WhatsApp

Stack: **React + Tailwind v3** (frontend) | **Python FastAPI** (backend) | **SQLite** (DB) | **WhatsApp Business API** (mensajería)

---

## 🗂️ Estructura del Proyecto

```
Sistema-de-turnos/
├── backend-python/             ← Python FastAPI
│   ├── main.py                 ← Entrada principal
│   ├── config.py               ← Configuración (variables de entorno)
│   ├── database.py             ← Conexión SQLite
│   ├── models.py               ← Modelos de datos
│   ├── schemas.py              ← Esquemas Pydantic
│   ├── requirements.txt        ← Dependencias Python
│   ├── routers/
│   │   ├── auth_router.py      ← Autenticación JWT
│   │   ├── turnos_router.py    ← API de turnos
│   │   ├── config_router.py    ← Configuración
│   │   └── webhook_router.py   ← Webhooks de WhatsApp
│   └── services/
│       ├── turno_service.py    ← Lógica de turnos + recordatorios
│       └── whatsapp_service.py ← Integración WhatsApp API
└── frontend/                   ← React + Tailwind v3
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx   ← Turnos de hoy con acciones
    │   │   ├── Agenda.jsx      ← Vista semanal
    │   │   ├── NuevoTurno.jsx  ← Formulario de reserva
    │   │   └── LoginPage.jsx   ← Autenticación
    │   └── utils/api.js        ← Llamadas al backend
    └── package.json
```

---

## ⚙️ Requisitos Previos

| Herramienta | Versión |
|-------------|---------|
| Python      | 3.9+    |
| Node.js     | 18+     |
| npm         | 9+      |

---

## 🚀 Instalación Rápida

### 1️⃣ Clonar Variables de Entorno
```bash
cp backend-python/.env.example backend-python/.env
# Edita el archivo .env con tus credenciales reales de WhatsApp
```

### 2️⃣ Ejecutar el Backend (Python FastAPI)

```bash
cd backend-python

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python main.py
```

✅ Backend disponible en: **http://localhost:8080**  
✅ Documentación interactiva (Swagger): **http://localhost:8080/docs**

La base de datos `barbershop.db` (SQLite) se crea automáticamente.

---

### 3️⃣ Ejecutar el Frontend (React)

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

✅ Frontend disponible en: **http://localhost:5173**

---

## 📱 Configurar WhatsApp Business API

### Paso 1 - Crear cuenta en Meta for Developers
1. Ir a https://developers.facebook.com
2. Crear app → Tipo: Business
3. Agregar producto: **WhatsApp**

### Paso 2 - Obtener credenciales
Desde el panel de WhatsApp de tu app:
- `Phone Number ID` → tu número de prueba
- `Access Token` → token de acceso de larga duración
- Crear un `Verify Token` personalizado

### Paso 3 - Configurar el archivo .env
Edita `backend-python/.env` con tus datos reales:
```properties
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAABcde...tu_token_largo...
WHATSAPP_VERIFY_TOKEN=mi_token_secreto_webhook
BARBERSHOP_OWNER_PHONE=5492644XXXXXX
```

### Paso 4 - Configurar el Webhook
1. En Meta for Developers → Tu App → WhatsApp → Configuración
2. Agregar URL del webhook: `https://tu-dominio.com/webhook`
3. Usar el `Verify Token` que estableciste en `.env`
```

### Paso 4 - Configurar Webhook (para mensajes entrantes)
- URL pública necesaria → usar **ngrok** en desarrollo:
```bash
ngrok http 8080
# Pegar la URL en Meta: https://xxxx.ngrok.io/webhook
```

---

## 📡 API REST - Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET    | /api/turnos | Todos los turnos |
| GET    | /api/turnos/hoy | Turnos de hoy |
| GET    | /api/turnos/dia?fecha= | Turnos de un día |
| POST   | /api/turnos | Crear turno |
| PUT    | /api/turnos/{id}/confirmar | Confirmar (envía WhatsApp al cliente) |
| PUT    | /api/turnos/{id}/cancelar | Cancelar turno |
| PUT    | /api/turnos/{id}/completar | Marcar como completado |
| GET    | /webhook | Verificación webhook Meta |
| POST   | /webhook | Recibir mensajes entrantes |

---

## 💬 Flujo WhatsApp

```
Cliente reserva turno
        ↓
[Backend] notificarPeluquero() → WhatsApp al peluquero
        ↓
Peluquero confirma desde el panel
        ↓
[Backend] enviarConfirmacionTurno() → WhatsApp al cliente
        ↓
1 hora antes del turno (automático)
        ↓
[Backend @Scheduled] enviarRecordatorio() → WhatsApp al cliente
```

---

## 🔧 Números de Teléfono - Formato Argentina

WhatsApp requiere formato internacional sin el +:
```
549 + código de área sin 0 + número
Ejemplo San Juan: 5492644XXXXXX
```

---

## 📦 Build para Producción

```bash
# Frontend
cd frontend && npm run build  # genera carpeta dist/

# Backend (JAR ejecutable)
cd backend && mvn package
java -jar target/barbershop-api-1.0.0.jar
```
