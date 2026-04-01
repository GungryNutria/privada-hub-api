import { Injectable, NotFoundException } from '@nestjs/common';
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

  async update(id: number, houseData: Partial<House>): Promise<House> {
    const house = await this.findOne(id);
    
    if (houseData.pin) {
      houseData.pin = await bcrypt.hash(houseData.pin, 10);
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
    await this.housesRepository.softRemove(house);
  }

  private generateRandomPin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}