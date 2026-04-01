import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { Reservation } from './reservation.entity';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  findAll(): Promise<Reservation[]> {
    return this.reservationsService.findAll();
  }

  @Get('month')
  findByMonth(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ): Promise<Reservation[]> {
    return this.reservationsService.findByMonth(year, month);
  }

  @Get('available')
  getAvailableDates(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.reservationsService.getAvailableDates(year, month);
  }

  @Get('house/:houseId')
  findByHouse(@Param('houseId', ParseIntPipe) houseId: number): Promise<Reservation[]> {
    return this.reservationsService.findByHouse(houseId);
  }

  @Post()
  create(
    @Body() body: { houseId: number; date: string; notes?: string },
  ): Promise<Reservation> {
    return this.reservationsService.create(body);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { houseId: number },
  ): Promise<Reservation> {
    return this.reservationsService.cancel(id, body.houseId);
  }
}