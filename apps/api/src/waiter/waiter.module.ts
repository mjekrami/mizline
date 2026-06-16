import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { WaiterController } from "./waiter.controller";
import { WaiterService } from "./waiter.service";

@Module({
  imports: [AuthModule, PrismaModule, RealtimeModule],
  controllers: [WaiterController],
  providers: [WaiterService],
})
export class WaiterModule {}
