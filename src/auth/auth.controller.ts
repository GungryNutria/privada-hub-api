import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { lotNumber: number; pin: string }) {
    return this.authService.login({
      lotNumber: body.lotNumber,
      pin: body.pin,
    });
  }

  @Post('change-pin')
  async changePin(
    @Body() body: { houseId: number; currentPin: string; newPin: string },
  ) {
    return this.authService.changePin(
      body.houseId,
      body.currentPin,
      body.newPin,
    );
  }
}