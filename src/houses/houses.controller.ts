import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { HousesService } from './houses.service';
import { House } from './house.entity';

@Controller('houses')
export class HousesController {
  constructor(private readonly housesService: HousesService) {}

  @Get()
  findAll(): Promise<House[]> {
    return this.housesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<House> {
    return this.housesService.findOne(id);
  }

  @Post()
  create(@Body() houseData: Partial<House>): Promise<House> {
    return this.housesService.create(houseData);
  }

  @Post('bulk')
  createBulk(@Body() body: { count: number; prefix?: string }): Promise<{ message: string; count: number }> {
    return this.housesService.createBulk(body.count, body.prefix);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() houseData: Partial<House>,
  ): Promise<House> {
    return this.housesService.update(id, houseData);
  }

  @Post(':id/reset-pin')
  resetPin(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { newPin?: string },
  ): Promise<{ success: boolean; newPin?: string }> {
    return this.housesService.resetPin(id, body.newPin);
  }
}