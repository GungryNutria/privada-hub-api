import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reservation } from '../reservations/reservation.entity';

@Entity('houses')
export class House {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  lotNumber: number;

  @Column({ length: 100 })
  ownerName: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 255 })
  pin: string; // Hash del PIN

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.house)
  reservations: Reservation[];
}