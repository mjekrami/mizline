import { Module } from "@nestjs/common";
import { OrdersGateway } from "./orders.gateway";
import { RealtimeService } from "./realtime.service";

@Module({
  providers: [OrdersGateway, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
