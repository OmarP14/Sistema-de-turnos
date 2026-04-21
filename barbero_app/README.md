# BarberApp — App del Barbero (Flutter)

App móvil para Android/iOS que conecta al backend de Luxo BarberApp.

## Pantallas

- **Dashboard** — Todos los turnos próximos con filtros por estado. Confirmar / Completar / Cancelar.
- **Agenda** — Turnos del día con navegación día a día.
- **Historial** — Todos los turnos con buscador.
- **Nuevo Turno** — Calendario mensual L-D, franjas mañana/tarde, servicios desde backend.
- **Login** — JWT guardado en SharedPreferences.

## Configurar el servidor

Antes de compilar, editá la URL del backend en:

```
lib/services/api_service.dart
```

```dart
static const String baseUrl = 'http://TU_SERVIDOR:8080/api';
```

## Instalar y correr

```bash
cd barbero_app

# Instalar Flutter SDK desde https://docs.flutter.dev/get-started/install

# Instalar dependencias
flutter pub get

# Correr en modo desarrollo
flutter run

# Build Android
flutter build apk --release

# Build iOS (requiere Mac)
flutter build ios --release
```

## Dependencias

| Paquete | Uso |
|---------|-----|
| `http` | Llamadas HTTP al backend |
| `shared_preferences` | Guardar token JWT |
| `intl` | Formato de fechas en español |
| `provider` | Estado global (opcional, incluido) |
