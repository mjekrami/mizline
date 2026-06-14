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
import { KitchenDevTokenGuard } from "../common/guards/kitchen-dev-token.guard";
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

  @Get("stores/:storeId/orders")
  @UseGuards(KitchenDevTokenGuard)
  listStoreOrders(
    @Param("storeId") storeId: string,
    @Query() query: ListStoreOrdersQueryDto,
  ) {
    return this.ordersService.listStoreOrders(storeId, query.status);
  }

  @Patch("orders/:orderId/status")
  @UseGuards(KitchenDevTokenGuard)
  updateStatus(
    @Param("orderId") orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(orderId, dto.status);
  }
}
