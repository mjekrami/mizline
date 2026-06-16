import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import type { AuthenticatedUser } from "../auth/auth.types";
import {
  RolesGuard,
  TenantGuard,
} from "../auth/guards/auth.guards";
import { StaffAuthGuard } from "../auth/guards/staff-auth.guard";
import { WaiterService } from "./waiter.service";

@Controller()
export class WaiterController {
  constructor(private readonly waiterService: WaiterService) {}

  @Post("stores/:storeId/tables/:tableId/call-waiter")
  callWaiter(
    @Param("storeId") storeId: string,
    @Param("tableId") tableId: string,
  ) {
    return this.waiterService.callWaiter(storeId, tableId);
  }

  @Get("stores/:storeId/waiter/orders")
  @UseGuards(StaffAuthGuard, RolesGuard, TenantGuard)
  @Roles("waiter")
  listAssignedOrders(
    @Param("storeId") storeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.waiterService.listAssignedOrders(storeId, user.id);
  }

  @Get("stores/:storeId/waiter/orders/:orderId")
  @UseGuards(StaffAuthGuard, RolesGuard, TenantGuard)
  @Roles("waiter")
  getAssignedOrder(
    @Param("storeId") storeId: string,
    @Param("orderId") orderId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.waiterService.getAssignedOrder(storeId, user.id, orderId);
  }
}
