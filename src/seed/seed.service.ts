import { Injectable } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { House } from '../houses/house.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(House)
    private housesRepository: Repository<House>,
  ) {}

  async onModuleInit() {
    const count = await this.housesRepository.count();
    
    if (count === 0) {
      console.log('🌱 Sembrando casas iniciales...');
      await this.seedHouses();
      console.log('✅ 300 casas creadas');
    }
  }

  private async seedHouses() {
    const houses: Partial<House>[] = [];

    for (let i = 1; i <= 300; i++) {
      const rawPin = this.generateRandomPin();
      const hashedPin = await bcrypt.hash(rawPin, 10);

      houses.push({
        lotNumber: i,
        ownerName: `Casa ${i}`,
        pin: hashedPin,
        active: true,
      });
    }

    await this.housesRepository.save(houses);
    
    // Mostrar algunos PINs de ejemplo (solo en desarrollo)
    console.log('\n📋 PINs de ejemplo (cambiar en producción):');
    console.log('Casa 1: ' + (await this.getPinForHouse(1)));
    console.log('Casa 50: ' + (await this.getPinForHouse(50)));
    console.log('Casa 100: ' + (await this.getPinForHouse(100)));
    console.log('Casa 200: ' + (await this.getPinForHouse(200)));
    console.log('Casa 300: ' + (await this.getPinForHouse(300)));
  }

  private generateRandomPin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private async getPinForHouse(lotNumber: number): Promise<string> {
    // En producción, los PINs no deben mostrarse
    // Este método es solo para desarrollo
    return `[generado automáticamente]`;
  }
}