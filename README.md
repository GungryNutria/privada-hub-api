# Privada Hub API

API para gestión de reservaciones de palapa en privatadas.

## Tecnologías

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **bcrypt** - Hash de PINs

## Desarrollo Local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de PostgreSQL.

### 3. Crear la base de datos

```sql
CREATE DATABASE privada_hub;
```

### 4. Inicializar tablas (solo primera vez)

```bash
npm run db:init
```

### 5. Ejecutar en desarrollo

```bash
npm run start:dev
```

El servidor corre en `http://localhost:3000`

## Producción (Coolify)

### 1. Variables de entorno requeridas

```
NODE_ENV=production
PORT=3000
DB_HOST=tu-host-postgres
DB_PORT=5432
DB_USERNAME=tu-usuario
DB_PASSWORD=tu-password
DB_DATABASE=privada_hub
CORS_ORIGIN=https://tu-frontend-url
JWT_SECRET=un-secreto-muy-seguro
```

### 2. Inicializar base de datos

Después del primer deploy, ejecuta:

```bash
npm run db:init
```

O manualmente con SQL:

```sql
CREATE TABLE houses (
  id SERIAL PRIMARY KEY,
  "lotNumber" INTEGER NOT NULL UNIQUE,
  "ownerName" VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  pin VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  "houseId" INTEGER NOT NULL REFERENCES houses(id),
  date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  notes VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "cancelledAt" TIMESTAMP
);

CREATE UNIQUE INDEX idx_reservations_date_active 
ON reservations (date) 
WHERE status = 'active';
```

### 3. Crear casas (bulk)

Para crear 300 casas de una vez:

```bash
curl -X POST http://tu-api/api/houses/bulk \
  -H "Content-Type: application/json" \
  -d '{"count": 300}'
```

## Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
  ```json
  { "lotNumber": 1, "pin": "1234" }
  ```

- `POST /api/auth/change-pin` - Cambiar PIN

### Casas

- `GET /api/houses` - Listar todas las casas
- `POST /api/houses` - Crear una casa
- `POST /api/houses/bulk` - Crear múltiples casas
- `PUT /api/houses/:id` - Actualizar casa
- `POST /api/houses/:id/reset-pin` - Resetear PIN

### Reservaciones

- `GET /api/reservations/month?year=2026&month=3` - Reservaciones del mes
- `GET /api/reservations/available?year=2026&month=3` - Fechas disponibles
- `POST /api/reservations` - Crear reservación
- `POST /api/reservations/:id/cancel` - Cancelar reservación

## Build de Producción

```bash
npm run build
npm run start:prod
```