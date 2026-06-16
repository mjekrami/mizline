import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { CreateOrderDto } from "./dto/create-order.dto";
import { ListStoreOrdersQueryDto } from "./dto/list-store-orders-query.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrdersService } from "./orders.service";

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post("stores/:storeId/tables/:tableId/orders")
  createOrder(
    @Param("storeId") storeId: string,
    @Param("tableId") tableId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(storeId, tableId, dto);
  }

  @Get("orders/:orderId")
  getOrder(@Param("orderId") orderId: string) {
    return this.ordersService.getOrder(orderId);
  }

  @Get("stores/:storeId/orders/metrics")
  @UseGuards(StaffAuthGuard, RolesGuard, TenantGuard)
  @Roles("barista")
  getStoreMetrics(@Param("storeId") storeId: string) {
    return this.ordersService.getStoreMetrics(storeId);
  }

  @Get("stores/:storeId/orders")
  @UseGuards(StaffAuthGuard, RolesGuard, TenantGuard)
  @Roles("barista")
  listStoreOrders(
    @Param("storeId") storeId: string,
    @Query() query: ListStoreOrdersQueryDto,
  ) {
    return this.ordersService.listStoreOrders(storeId, query.status);
  }

  @Patch("orders/:orderId/status")
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles("barista")
  updateStatus(
    @Param("orderId") orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.updateStatus(orderId, dto.status, user.id);
  }

  @Patch("orders/:orderId/items/:itemId/fulfill")
  @UseGuards(StaffAuthGuard, RolesGuard)
  @Roles("barista")
  fulfillOrderItem(
    @Param("orderId") orderId: string,
    @Param("itemId") itemId: string,
  ) {
    return this.ordersService.fulfillOrderItem(orderId, itemId);
  }
}
