import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "./health/health.controller";
import { OrdersModule } from "./orders/orders.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { ReportsModule } from "./reports/reports.module";
import { StaffModule } from "./staff/staff.module";
import { StoresModule } from "./stores/stores.module";
import { WaiterModule } from "./waiter/waiter.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    StoresModule,
    OrdersModule,
    AdminModule,
    StaffModule,
    ReportsModule,
    RealtimeModule,
    WaiterModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
