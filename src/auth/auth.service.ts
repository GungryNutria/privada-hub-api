import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HousesService } from '../houses/houses.service';
import { House } from '../houses/house.entity';

interface LoginDto {
  lotNumber: number;
  pin: string;
}

interface LoginResponse {
  success: boolean;
  house: {
    id: number;
    lotNumber: number;
    ownerName: string;
  };
}

@Injectable()
export class AuthService {
  constructor(private readonly housesService: HousesService) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const house = await this.housesService.validatePin(dto.lotNumber, dto.pin);
    
    if (!house) {
      throw new UnauthorizedException('Número de casa o PIN incorrecto');
    }

    return {
      success: true,
      house: {
        id: house.id,
        lotNumber: house.lotNumber,
        ownerName: house.ownerName,
      },
    };
  }

  async changePin(houseId: number, currentPin: string, newPin: string): Promise<{ success: boolean }> {
    const result = await this.housesService.updatePin(houseId, currentPin, newPin);
    
    if (!result) {
      throw new UnauthorizedException('PIN actual incorrecto');
    }

    return { success: true };
  }
}