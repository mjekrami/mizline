import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminModule } from "./admin/admin.module";
import { HealthController } from "./health/health.controller";
import { OrdersModule } from "./orders/orders.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { StoresModule } from "./stores/stores.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StoresModule,
    OrdersModule,
    AdminModule,
    RealtimeModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
