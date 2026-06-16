import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OrdersGateway } from "./orders.gateway";
import { RealtimeService } from "./realtime.service";

@Module({
  imports: [AuthModule],
  providers: [OrdersGateway, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
