# Privada Hub API

API para gestión de reservaciones de palapa en privatadas.

## Tecnologías

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **bcrypt** - Hash de PINs

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y configura tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` con tus datos:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=privada_hub
```

### 3. Crear la base de datos en PostgreSQL

```sql
CREATE DATABASE privada_hub;
```

### 4. Ejecutar en desarrollo

```bash
npm run start:dev
```

El servidor corre en `http://localhost:3000`

## Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
  ```json
  {
    "lotNumber": 1,
    "pin": "1234"
  }
  ```

- `POST /api/auth/change-pin` - Cambiar PIN
  ```json
  {
    "houseId": 1,
    "currentPin": "1234",
    "newPin": "5678"
  }
  ```

### Casas

- `GET /api/houses` - Listar todas las casas
- `GET /api/houses/:id` - Obtener casa por ID

### Reservaciones

- `GET /api/reservations/month?year=2026&month=3` - Reservaciones del mes
- `GET /api/reservations/available?year=2026&month=3` - Fechas disponibles
- `GET /api/reservations/house/:houseId` - Reservaciones de una casa
- `POST /api/reservations` - Crear reservación
  ```json
  {
    "houseId": 1,
    "date": "2026-04-15",
    "notes": "Cumpleaños"
  }
  ```
- `POST /api/reservations/:id/cancel` - Cancelar reservación

## Inicialización

Al iniciar por primera vez, el sistema crea automáticamente:
- 300 casas (lotes 1-300)
- PINs aleatorios de 4 dígitos para cada casa

Los PINs se muestran en consola durante el primer arranque.

## Producción

```bash
npm run build
npm run start:prod
```

Asegúrate de:
1. Cambiar `synchronize: false` en producción
2. Usar variables de entorno seguras
3. Configurar HTTPS