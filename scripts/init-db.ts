import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'privada_hub',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    // Crear tabla houses
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS houses (
        id SERIAL PRIMARY KEY,
        "lotNumber" INTEGER NOT NULL UNIQUE,
        "ownerName" VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        pin VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla houses creada');

    // Crear tabla reservations
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        "houseId" INTEGER NOT NULL REFERENCES houses(id),
        date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        notes VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "cancelledAt" TIMESTAMP
      )
    `);
    console.log('✅ Tabla reservations creada');

    // Índice para evitar reservaciones duplicadas
    await dataSource.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_date_active 
      ON reservations (date) 
      WHERE status = 'active'
    `);
    console.log('✅ Índice creado');

    await dataSource.destroy();
    console.log('🎉 Base de datos inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initDb();