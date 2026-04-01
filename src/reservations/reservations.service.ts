import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reservation } from './reservation.entity';
import { House } from '../houses/house.entity';

interface CreateReservationDto {
  houseId: number;
  date: string;
  notes?: string;
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
  ) {}

  async findAll(): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      relations: ['house'],
      order: { date: 'ASC' },
    });
  }

  async findByDate(date: Date): Promise<Reservation | null> {
    return this.reservationsRepository.findOne({
      where: { date, status: 'active' },
      relations: ['house'],
    });
  }

  async findByMonth(year: number, month: number): Promise<Reservation[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Último día del mes

    return this.reservationsRepository.find({
      where: {
        date: Between(startDate, endDate),
        status: 'active',
      },
      relations: ['house'],
      order: { date: 'ASC' },
    });
  }

  async findByHouse(houseId: number): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      where: { houseId },
      relations: ['house'],
      order: { date: 'DESC' },
    });
  }

  async create(dto: CreateReservationDto): Promise<Reservation> {
    const reservationDate = new Date(dto.date);
    
    // Validar que la fecha no sea en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (reservationDate < today) {
      throw new BadRequestException('No se puede reservar en fechas pasadas');
    }

    // Validar que esté dentro del mes actual
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const reservationMonth = reservationDate.getMonth();
    const reservationYear = reservationDate.getFullYear();

    // Permitir reservas solo en el mes actual o siguiente (si estamos cerca del fin de mes)
    const isCurrentMonth = reservationMonth === currentMonth && reservationYear === currentYear;
    const isNextMonth = reservationMonth === (currentMonth + 1) % 12 && 
                        (reservationYear === currentYear || (currentMonth === 11 && reservationYear === currentYear + 1));

    if (!isCurrentMonth && !isNextMonth) {
      // Verificar si es el mismo mes que el actual
      const lastDayOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);
      const daysRemaining = lastDayOfCurrentMonth.getDate() - today.getDate();
      
      if (daysRemaining <= 7 && isNextMonth) {
        // Permitir reservar el siguiente mes si faltan 7 días o menos
      } else {
        throw new BadRequestException('Solo se puede reservar dentro del mes en curso');
      }
    }

    // Verificar que no haya otra reservación activa para esa fecha
    const existingReservation = await this.findByDate(reservationDate);
    if (existingReservation) {
      throw new BadRequestException('Esta fecha ya está reservada');
    }

    const reservation = this.reservationsRepository.create({
      houseId: dto.houseId,
      date: reservationDate,
      notes: dto.notes,
      status: 'active',
    });

    return this.reservationsRepository.save(reservation);
  }

  async cancel(id: number, houseId: number): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservación no encontrada');
    }

    // Verificar que la reservación pertenezca a la casa
    if (reservation.houseId !== houseId) {
      throw new BadRequestException('Esta reservación no pertenece a tu casa');
    }

    reservation.status = 'cancelled';
    reservation.cancelledAt = new Date();

    return this.reservationsRepository.save(reservation);
  }

  async getAvailableDates(year: number, month: number): Promise<Date[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Obtener todas las reservaciones activas del mes
    const reservations = await this.reservationsRepository.find({
      where: {
        date: Between(startDate, endDate),
        status: 'active',
      },
    });

    const reservedDates = new Set(
      reservations.map(r => r.date.toISOString().split('T')[0])
    );

    // Generar todas las fechas del mes
    const availableDates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (!reservedDates.has(dateStr) && d >= today) {
        availableDates.push(new Date(d));
      }
    }

    return availableDates;
  }
}