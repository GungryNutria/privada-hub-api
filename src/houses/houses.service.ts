import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { House } from './house.entity';

@Injectable()
export class HousesService {
  constructor(
    @InjectRepository(House)
    private housesRepository: Repository<House>,
  ) {}

  async findAll(): Promise<House[]> {
    return this.housesRepository.find({
      order: { lotNumber: 'ASC' },
    });
  }

  async findOne(id: number): Promise<House> {
    const house = await this.housesRepository.findOne({ where: { id } });
    if (!house) {
      throw new NotFoundException(`Casa con ID ${id} no encontrada`);
    }
    return house;
  }

  async findByLotNumber(lotNumber: number): Promise<House | null> {
    return this.housesRepository.findOne({ where: { lotNumber } });
  }

  async create(houseData: Partial<House>): Promise<House> {
    // Verificar si ya existe el número de lote
    const existing = await this.findByLotNumber(houseData.lotNumber);
    if (existing) {
      throw new BadRequestException(`Ya existe una casa con el lote ${houseData.lotNumber}`);
    }

    const house = this.housesRepository.create(houseData);
    
    // Generar PIN aleatorio si no se proporciona
    if (!house.pin) {
      const rawPin = this.generateRandomPin();
      house.pin = await bcrypt.hash(rawPin, 10);
    } else {
      house.pin = await bcrypt.hash(house.pin, 10);
    }
    
    return this.housesRepository.save(house);
  }

  async createBulk(count: number, prefix?: string): Promise<{ message: string; count: number }> {
    const housesToCreate: { lotNumber: number; ownerName: string; pin: string; active: boolean }[] = [];
    
    for (let i = 1; i <= count; i++) {
      const lotNumber = prefix ? parseInt(`${prefix}${i}`) : i;
      
      // Verificar si ya existe
      const existing = await this.findByLotNumber(lotNumber);
      if (existing) continue;

      const rawPin = this.generateRandomPin();
      const hashedPin = await bcrypt.hash(rawPin, 10);

      housesToCreate.push({
        lotNumber,
        ownerName: `Casa ${lotNumber}`,
        pin: hashedPin,
        active: true,
      });
    }

    if (housesToCreate.length > 0) {
      await this.housesRepository.insert(housesToCreate);
    }
    
    return {
      message: `${housesToCreate.length} casas creadas exitosamente`,
      count: housesToCreate.length,
    };
  }

  async update(id: number, houseData: Partial<House>): Promise<House> {
    const house = await this.findOne(id);
    
    // No permitir actualizar el PIN directamente por update
    if (houseData.pin) {
      delete houseData.pin;
    }
    
    Object.assign(house, houseData);
    return this.housesRepository.save(house);
  }

  async updatePin(id: number, currentPin: string, newPin: string): Promise<boolean> {
    const house = await this.findOne(id);
    
    const isValid = await bcrypt.compare(currentPin, house.pin);
    if (!isValid) {
      return false;
    }
    
    house.pin = await bcrypt.hash(newPin, 10);
    await this.housesRepository.save(house);
    return true;
  }

  async resetPin(id: number, newPin?: string): Promise<{ success: boolean; newPin?: string }> {
    const house = await this.findOne(id);
    
    const pin = newPin || this.generateRandomPin();
    house.pin = await bcrypt.hash(pin, 10);
    
    await this.housesRepository.save(house);
    
    // Solo retornar el PIN si fue generado automáticamente
    return {
      success: true,
      ...(newPin ? {} : { newPin: pin }),
    };
  }

  async validatePin(lotNumber: number, pin: string): Promise<House | null> {
    const house = await this.findByLotNumber(lotNumber);
    if (!house || !house.active) {
      return null;
    }
    
    const isValid = await bcrypt.compare(pin, house.pin);
    return isValid ? house : null;
  }

  async remove(id: number): Promise<void> {
    const house = await this.findOne(id);
    house.active = false;
    await this.housesRepository.save(house);
  }

  private generateRandomPin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}