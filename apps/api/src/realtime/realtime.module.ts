import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { OrdersGateway } from "./orders.gateway";
import { RealtimeService } from "./realtime.service";

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [OrdersGateway, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
