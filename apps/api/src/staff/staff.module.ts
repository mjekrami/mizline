import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { StaffController } from "./staff.controller";
import { StaffService } from "./staff.service";

@Module({
  imports: [AuthModule, RealtimeModule],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
