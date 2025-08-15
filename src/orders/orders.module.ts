import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders/orders.gateway';

@Module({
  providers: [OrdersService, OrdersGateway],
  controllers: [OrdersController],
})
export class OrdersModule {}
