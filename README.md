# 💈 BarbershopNet - App de Turnos con WhatsApp

Stack: **React + Tailwind v3** (frontend) | **Java Spring Boot** (backend) | **SQLite** (DB) | **WhatsApp Business API** (mensajería)

---

## 🗂️ Estructura del Proyecto

```
barbershop/
├── backend/                    ← Java Spring Boot
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/barbershop/
│       │   ├── BarbershopApplication.java
│       │   ├── model/Turno.java
│       │   ├── repository/TurnoRepository.java
│       │   ├── service/
│       │   │   ├── TurnoService.java       ← Lógica de negocio + recordatorios
│       │   │   └── WhatsAppService.java    ← Integración WhatsApp API
│       │   └── controller/
│       │       ├── TurnoController.java    ← REST API
│       │       └── WhatsAppWebhookController.java
│       └── resources/
│           └── application.properties     ← ⚠️ Config con tus tokens
└── frontend/                   ← React + Tailwind v3
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx   ← Turnos de hoy con acciones
    │   │   ├── Agenda.jsx      ← Vista semanal
    │   │   └── NuevoTurno.jsx  ← Formulario de reserva
    │   └── utils/api.js        ← Llamadas al backend
    └── package.json
```

---

## ⚙️ Requisitos Previos

| Herramienta | Versión |
|-------------|---------|
| Java JDK    | 17+     |
| Maven       | 3.8+    |
| Node.js     | 18+     |
| npm         | 9+      |

---

## 🚀 Ejecutar el Backend (Spring Boot)

```bash
cd backend

# 1. Compilar
mvn clean install

# 2. Ejecutar
mvn spring-boot:run
```

El servidor arranca en: **http://localhost:8080**

La base de datos `barbershop.db` (SQLite) se crea automáticamente en la raíz del backend.

---

## 🚀 Ejecutar el Frontend (React)

```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo
npm run dev
```

La app abre en: **http://localhost:5173**

---

## 📱 Configurar WhatsApp Business API

### Paso 1 - Crear cuenta en Meta for Developers
1. Ir a https://developers.facebook.com
2. Crear app → Tipo: Business
3. Agregar producto: **WhatsApp**

### Paso 2 - Obtener credenciales
Desde el panel de WhatsApp de tu app:
- `Phone Number ID` → tu número de prueba
- `Access Token` → token temporal (o permanente con token de sistema)

### Paso 3 - Configurar application.properties
```properties
whatsapp.phone.number.id=123456789012345
whatsapp.access.token=EAABcde...tu_token_largo...
whatsapp.verify.token=mi_token_secreto_webhook
barbershop.owner.phone=5492644XXXXXX
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
