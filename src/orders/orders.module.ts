import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders/orders.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { Table } from '../tables/entities/table.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, User, Table, MenuItem]),
  ],
  providers: [OrdersService, OrdersGateway],
  controllers: [OrdersController],
})
export class OrdersModule {}
