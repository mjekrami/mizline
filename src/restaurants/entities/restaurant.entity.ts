import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Table } from '../../tables/entities/table.entity';
import { MenuItem } from '../../menu-items/entities/menu-item.entity';
import { User } from '../../users/entities/user.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @OneToMany(() => Table, (table) => table.restaurant)
  tables: Table[];

  @OneToMany(() => MenuItem, (menuItem) => menuItem.restaurant)
  menuItems: MenuItem[];

  @OneToMany(() => User, (user) => user.restaurant)
  staff: User[];

  @OneToOne(() => User)
  @JoinColumn({ name: 'adminId' })
  admin: User;

  @Column({ type: 'uuid' })
  adminId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
