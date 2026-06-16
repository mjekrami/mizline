import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { StaffMember } from "@mizline/shared";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import type { AuthenticatedUser } from "../auth/auth.types";
import {
  JwtAuthGuard,
  RolesGuard,
  TenantGuard,
} from "../auth/guards/auth.guards";
import { RealtimeService } from "../realtime/realtime.service";
import { AssignOrderDto, CreateStaffDto, UpdateStaffDto } from "./dto/staff.dto";
import { StaffService } from "./staff.service";

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly realtime: RealtimeService,
  ) {}

  @Get("stores/:storeId/staff")
  @Roles("manager")
  listStoreStaff(
    @Param("storeId") storeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StaffMember[]> {
    return this.staffService.listStoreStaff(user.tenantId, storeId);
  }

  @Post("stores/:storeId/staff")
  @Roles("manager")
  createStoreStaff(
    @Param("storeId") storeId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStaffDto,
  ): Promise<StaffMember> {
    return this.staffService.createStoreStaff(user.tenantId, storeId, dto);
  }

  @Patch("staff/:userId")
  @Roles("manager")
  updateStaff(
    @Param("userId") userId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateStaffDto,
  ): Promise<StaffMember> {
    return this.staffService.updateStaff(user.tenantId, userId, dto);
  }

  @Patch("orders/:orderId/assign")
  @Roles("manager")
  async assignOrder(
    @Param("orderId") orderId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AssignOrderDto,
  ) {
    const order = await this.staffService.assignOrder(
      user.tenantId,
      orderId,
      dto.userId,
    );

    if (order.assignedTo) {
      this.realtime.emitOrderAssigned(order.storeId, {
        orderId: order.id,
        assignedTo: order.assignedTo,
      });
    }

    return order;
  }
}
