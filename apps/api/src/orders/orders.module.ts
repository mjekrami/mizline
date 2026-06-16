import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { AssignmentService } from "./assignment.service";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [RealtimeModule, AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService, AssignmentService],
})
export class OrdersModule {}
