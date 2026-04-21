# 💈 Luxo BarberApp — Funcionalidades

Sistema completo de gestión de turnos para barbería con notificaciones automáticas por WhatsApp.

---

## 👤 Módulo del Cliente (público — sin login)

### Reserva de turno en 4 pasos

**Paso 1 — Elegir servicio**
- Lista de servicios configurada por el barbero (corte, barba, degradé, etc.)
- Cada servicio muestra ícono y descripción
- Los servicios se actualizan en tiempo real desde el panel del barbero

**Paso 2 — Elegir día**
- Calendario mensual visual estructurado de lunes a domingo
- Muestra el mes actual y el siguiente
- Solo habilita los días laborales configurados por el barbero
- Los días bloqueados y feriados aparecen deshabilitados automáticamente
- El día de hoy se resalta en rojo

**Paso 3 — Elegir horario**
- Horarios divididos en dos franjas:
  - **Mañana:** 09:00 a 13:00 (cada 30 minutos)
  - **Tarde:** 17:00 a 22:00 (cada 30 minutos)
- Los horarios ya ocupados se muestran como "OCUPADO" y no se pueden seleccionar
- Los horarios pasados del día actual se bloquean automáticamente

**Paso 4 — Ingresar datos**
- Nombre del cliente
- Número de WhatsApp con prefijo +54 predeterminado (solo ingresar código de área + número)
- Nota opcional (aclaración para el barbero)
- Resumen del turno antes de confirmar

**Confirmación**
- Pantalla de éxito con resumen completo del turno
- Opción de reservar otro turno
- El cliente recibe un mensaje de WhatsApp cuando el barbero confirma

---

## 🔐 Módulo del Barbero (requiere login)

### Acceso
- Login con usuario y contraseña
- Sesión con token JWT (dura 24 horas)
- Redirección automática al login si el token expira

---

### Dashboard
- Lista de todos los turnos del día actual en adelante
- Muestra turnos en todos los estados: Pendiente, Confirmado, Completado, Cancelado
- Para cada turno muestra: nombre del cliente, teléfono, fecha/hora, servicio y estado
- Acciones rápidas desde cada turno: **Confirmar**, **Completar**, **Cancelar**
- Actualización automática cada 30 segundos
- Gráfico de turnos por estado del día

---

### Agenda semanal
- Vista por días con navegación anterior/siguiente
- Muestra los turnos del día seleccionado
- Acciones de confirmar, completar y cancelar desde cada tarjeta
- Notificación de resultado visible en pantalla sin tapar el contenido

---

### Historial
- Lista completa de todos los turnos registrados
- Buscador por nombre de cliente, teléfono o servicio
- Filtros por estado
- Ordenado por fecha

---

### Configuración

#### Barbería y WhatsApp
- Nombre de la barbería (aparece en los mensajes de WhatsApp y en la app del cliente)
- Teléfono del barbero que recibe las notificaciones
- WhatsApp Phone Number ID (desde Meta for Developers)
- WhatsApp Access Token (desde Meta for Developers)
- Se guarda en la base de datos — no requiere reiniciar el servidor al actualizar

#### Días de trabajo
- Activar/desactivar cada día de la semana (Lun a Sáb)
- Se actualiza en tiempo real — los clientes solo ven los días habilitados
- Guardado automático al hacer clic

#### Bloquear fechas específicas
- Calendario mensual visual estructurado de lunes a domingo (mes actual + 2 siguientes)
- Clic en un día laboral para bloquearlo — clic nuevamente para desbloquearlo
- Colores por estado: disponible (blanco), bloqueado (rojo), hoy (azul), no laboral/pasado (oscuro)
- Leyenda visual incluida

#### Importar feriados nacionales
- Botón **"Importar feriados nacionales"** que consulta automáticamente la API pública de feriados argentinos
- Importa los feriados del año actual y del año siguiente
- Solo bloquea fechas futuras que no estén ya bloqueadas
- No requiere configuración ni API key — gratis y automático
- Feriados incluidos: Año Nuevo, Carnaval, Semana Santa, Día del Trabajador, 25 de Mayo, Día de la Bandera, 9 de Julio, San Martín, Diversidad Cultural, Soberanía Nacional, Inmaculada Concepción, Navidad, y puentes oficiales

#### Servicios ofrecidos
- Agregar nuevos servicios con el botón "+ AGREGAR" o presionando Enter
- Eliminar servicios existentes con el botón ✕
- Guardado automático en la base de datos
- Los cambios se reflejan de inmediato en el formulario de reserva del cliente

#### Horario de atención
- Vista de los turnos disponibles en dos franjas horarias (mañana y tarde)

---

## 📲 Notificaciones automáticas por WhatsApp

### Flujo de mensajes

| Evento | Destinatario | Contenido |
|--------|-------------|-----------|
| Cliente crea un turno | Barbero | Nombre, teléfono, fecha/hora, servicio. Opciones: responder SI {id} para confirmar o NO {id} para cancelar |
| Barbero confirma el turno | Cliente | Confirmación con fecha/hora y servicio |
| 1 hora antes del turno (automático) | Barbero | Recordatorio con datos del cliente y hora |

### Respuestas por WhatsApp
- El barbero puede responder **SI 5** para confirmar el turno #5
- El barbero puede responder **NO 5** para cancelar el turno #5

### Configuración
- Las credenciales de WhatsApp (Phone Number ID y Access Token) se configuran desde el panel sin necesidad de tocar código
- El token de Meta expira cada ~24 horas en cuentas de prueba — se renueva desde Configuración

---

## 📱 Instalable como PWA (app móvil)

- Se puede agregar a la pantalla de inicio desde el navegador del celular
- Funciona como app nativa en Android e iOS
- No requiere descarga desde ninguna tienda de aplicaciones
- Disponible en la URL del servidor desde cualquier dispositivo en la misma red

---

## 🏗️ Arquitectura multi-cliente (Multi-tenant)

- Las credenciales de WhatsApp, el nombre de la barbería y el teléfono del barbero se almacenan en la base de datos
- Cada instancia del sistema puede configurarse de forma independiente desde el panel
- No hay credenciales hardcodeadas en el código — el sistema está listo para ser desplegado para múltiples barberías

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite |
| Backend | Python FastAPI |
| Base de datos | SQLite (migrable a PostgreSQL) |
| Autenticación | JWT (PyJWT) |
| Notificaciones | WhatsApp Business Cloud API v22.0 |
| Feriados | Nager.Date API (gratuita, sin API key) |
| Estilos | CSS-in-JS con fuentes Bebas Neue, Oswald, Barlow |
| PWA | Web App Manifest + meta tags |
| Tareas programadas | APScheduler (recordatorios cada 15 minutos) |

---

## 🔗 Endpoints principales

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/auth/login` | Público | Login del barbero |
| GET | `/api/config/disponibilidad` | Público | Días y fechas disponibles |
| GET | `/api/config/servicios` | Público | Lista de servicios |
| POST | `/api/config/importar-feriados` | Barbero | Importar feriados nacionales |
| GET/PUT | `/api/config/barberia` | Barbero | Credenciales WhatsApp y nombre |
| PUT | `/api/config/dias-laborales` | Barbero | Actualizar días de trabajo |
| POST/DELETE | `/api/config/bloquear/{fecha}` | Barbero | Bloquear / desbloquear fecha |
| GET | `/api/turnos` | Barbero | Todos los turnos |
| POST | `/api/turnos` | Público | Crear turno (cliente) |
| PUT | `/api/turnos/{id}/confirmar` | Barbero | Confirmar turno |
| PUT | `/api/turnos/{id}/cancelar` | Barbero | Cancelar turno |
| PUT | `/api/turnos/{id}/completar` | Barbero | Completar turno |
| GET/POST | `/webhook` | Meta | Integración WhatsApp |

---

## 📞 Formato de teléfono (Argentina)

```
54 + código de área + número (sin 0 ni 15)
Ejemplo: 542644819470
```

El formulario del cliente ya incluye el prefijo +54 — solo se ingresa el código de área y número.
