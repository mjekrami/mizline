import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OrderStatus as PrismaOrderStatus, StaffRole } from "@prisma/client";
import type { WaiterBuzzEvent } from "@mizline/shared";
import { WAITER_BUZZ_COOLDOWN_SECONDS } from "@mizline/shared";
import {
  mapOrder,
  orderWithRelationsInclude,
} from "../common/mappers/order.mapper";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeService } from "../realtime/realtime.service";

const ACTIVE_WAITER_STATUSES: PrismaOrderStatus[] = [
  PrismaOrderStatus.new,
  PrismaOrderStatus.preparing,
  PrismaOrderStatus.ready,
];

@Injectable()
export class WaiterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  async callWaiter(storeId: string, tableId: string) {
    const table = await this.prisma.table.findFirst({
      where: { id: tableId, storeId, active: true },
      select: { id: true, name: true, lastBuzzAt: true },
    });

    if (!table) {
      throw new NotFoundException("Table not found");
    }

    if (table.lastBuzzAt) {
      const elapsedMs = Date.now() - table.lastBuzzAt.getTime();
      const cooldownMs = WAITER_BUZZ_COOLDOWN_SECONDS * 1000;

      if (elapsedMs < cooldownMs) {
        const retryAfterSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
        throw new HttpException(
          {
            message: "Please wait before calling again",
            retryAfterSeconds,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const activeOrder = await this.prisma.order.findFirst({
      where: {
        tableId,
        storeId,
        status: { notIn: ["fulfilled", "cancelled"] },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, assignedToId: true },
    });

    let targetWaiterIds: string[];

    if (activeOrder?.assignedToId) {
      targetWaiterIds = [activeOrder.assignedToId];
    } else {
      const waiters = await this.prisma.user.findMany({
        where: {
          active: true,
          role: StaffRole.waiter,
          storeLinks: { some: { storeId } },
        },
        select: { id: true },
      });
      targetWaiterIds = waiters.map((waiter) => waiter.id);
    }

    if (targetWaiterIds.length === 0) {
      throw new BadRequestException("No waiters available");
    }

    const now = new Date();

    await this.prisma.table.update({
      where: { id: tableId },
      data: { lastBuzzAt: now },
    });

    const payload: WaiterBuzzEvent = {
      tableId,
      tableName: table.name,
      orderId: activeOrder?.id,
      targetWaiterIds,
      createdAt: now.toISOString(),
    };

    this.realtime.emitWaiterBuzz(storeId, payload);

    return { ok: true as const };
  }

  async listAssignedOrders(storeId: string, userId: string) {
    await this.assertWaiterForStore(storeId, userId);

    const orders = await this.prisma.order.findMany({
      where: {
        storeId,
        assignedToId: userId,
        status: { in: ACTIVE_WAITER_STATUSES },
      },
      orderBy: { createdAt: "asc" },
      include: orderWithRelationsInclude,
    });

    return orders.map(mapOrder);
  }

  async getAssignedOrder(storeId: string, userId: string, orderId: string) {
    await this.assertWaiterForStore(storeId, userId);

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        storeId,
        assignedToId: userId,
      },
      include: orderWithRelationsInclude,
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return mapOrder(order);
  }

  private async assertWaiterForStore(storeId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        active: true,
        role: StaffRole.waiter,
        storeLinks: { some: { storeId } },
      },
      select: { id: true },
    });

    if (!user) {
      throw new ForbiddenException("Waiter access required");
    }
  }
}
