import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: ['CUSTOMER', 'STAFF', 'ADMIN'] })
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.staff, {
    nullable: true,
  })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;

  @Column({ type: 'uuid', nullable: true })
  restaurantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
