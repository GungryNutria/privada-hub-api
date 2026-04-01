import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { House } from '../houses/house.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  houseId: number;

  @ManyToOne(() => House, (house) => house.reservations)
  @JoinColumn({ name: 'houseId' })
  house: House;

  @Column({ type: 'date' })
  date: Date;

  @Column({ 
    type: 'enum', 
    enum: ['active', 'cancelled'],
    default: 'active' 
  })
  status: 'active' | 'cancelled';

  @Column({ length: 255, nullable: true })
  notes?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;
}