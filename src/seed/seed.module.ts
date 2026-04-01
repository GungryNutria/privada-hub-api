import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { House } from '../houses/house.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([House])],
  providers: [SeedService],
})
export class SeedModule {}