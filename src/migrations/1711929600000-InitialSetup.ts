import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSetup1711929600000 implements MigrationInterface {
  name = 'InitialSetup1711929600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla houses
    await queryRunner.query(`
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

    // Crear tabla reservations
    await queryRunner.query(`
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

    // Índice único para evitar reservaciones duplicadas en la misma fecha
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_date_active 
      ON reservations (date) 
      WHERE status = 'active'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS reservations`);
    await queryRunner.query(`DROP TABLE IF EXISTS houses`);
  }
}