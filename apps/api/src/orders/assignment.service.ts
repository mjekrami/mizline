import { Injectable } from "@nestjs/common";
import { StaffRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeService } from "../realtime/realtime.service";

@Injectable()
export class AssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  async assignNextWaiter(storeId: string, orderId: string) {
    const waiters = await this.prisma.user.findMany({
      where: {
        active: true,
        role: StaffRole.waiter,
        storeLinks: { some: { storeId } },
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    if (waiters.length === 0) {
      return null;
    }

    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { lastAssignedUserId: true },
    });

    let nextIndex = 0;

    if (store?.lastAssignedUserId) {
      const currentIndex = waiters.findIndex(
        (waiter) => waiter.id === store.lastAssignedUserId,
      );
      nextIndex = currentIndex >= 0 ? (currentIndex + 1) % waiters.length : 0;
    }

    const assignee = waiters[nextIndex];

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          assignedToId: assignee.id,
          assignedAt: new Date(),
        },
      }),
      this.prisma.store.update({
        where: { id: storeId },
        data: { lastAssignedUserId: assignee.id },
      }),
    ]);

    this.realtime.emitOrderAssigned(storeId, {
      orderId,
      assignedTo: { id: assignee.id, name: assignee.name },
    });

    return assignee;
  }

  async claimOrderForUser(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { assignedToId: true, storeId: true },
    });

    if (!order || order.assignedToId) {
      return;
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        active: true,
        storeLinks: { some: { storeId: order.storeId } },
      },
      select: { id: true, name: true },
    });

    if (!user) {
      return;
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        assignedToId: user.id,
        assignedAt: new Date(),
      },
    });

    this.realtime.emitOrderAssigned(order.storeId, {
      orderId,
      assignedTo: { id: user.id, name: user.name },
    });
  }
}
