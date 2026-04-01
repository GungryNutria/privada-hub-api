import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
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
}