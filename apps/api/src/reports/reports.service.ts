import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  DailySalesSummary,
  HourlyActivityReport,
  StoreSettings,
} from "@mizline/shared";
import { OrderStatus } from "@prisma/client";
import { getStoreDayBounds } from "../common/timezone";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailySummary(
    tenantId: string,
    storeId: string,
    date?: string,
  ): Promise<DailySalesSummary> {
    const store = await this.getStore(tenantId, storeId);
    const reportDate = date ?? this.todayInStoreTimezone(store.timezone);
    const { start, end } = getStoreDayBounds(store.timezone, new Date(`${reportDate}T12:00:00.000Z`));

    const aggregate = await this.prisma.order.aggregate({
      where: {
        tenantId,
        storeId,
        status: OrderStatus.fulfilled,
        fulfilledAt: { gte: start, lte: end },
      },
      _sum: { total: true },
      _count: { _all: true },
    });

    const orderCount = aggregate._count._all;
    const revenueCents = aggregate._sum.total ?? 0;

    return {
      date: reportDate,
      revenueCents,
      orderCount,
      averageTicketCents:
        orderCount > 0 ? Math.round(revenueCents / orderCount) : null,
    };
  }

  async getHourlyActivity(
    tenantId: string,
    storeId: string,
    date?: string,
  ): Promise<HourlyActivityReport> {
    const store = await this.getStore(tenantId, storeId);
    const reportDate = date ?? this.todayInStoreTimezone(store.timezone);
    const { start, end } = getStoreDayBounds(store.timezone, new Date(`${reportDate}T12:00:00.000Z`));

    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        storeId,
        createdAt: { gte: start, lte: end },
      },
      select: { createdAt: true, total: true },
    });

    const buckets = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      orderCount: 0,
      revenueCents: 0,
    }));

    for (const order of orders) {
      const hour = this.getHourInTimezone(order.createdAt, store.timezone);
      buckets[hour].orderCount += 1;
      buckets[hour].revenueCents += order.total;
    }

    return { date: reportDate, entries: buckets };
  }

  async updateStoreSettings(
    tenantId: string,
    storeId: string,
    settings: StoreSettings,
  ): Promise<StoreSettings> {
    if (settings.delayWarningMinutes >= settings.delayCriticalMinutes) {
      throw new BadRequestException(
        "Warning threshold must be less than critical threshold",
      );
    }

    const store = await this.prisma.store.update({
      where: { id: storeId, tenantId },
      data: {
        delayWarningMinutes: settings.delayWarningMinutes,
        delayCriticalMinutes: settings.delayCriticalMinutes,
      },
      select: {
        delayWarningMinutes: true,
        delayCriticalMinutes: true,
      },
    });

    if (!store) {
      throw new NotFoundException("Store not found");
    }

    return store;
  }

  async getStoreSettings(
    tenantId: string,
    storeId: string,
  ): Promise<StoreSettings> {
    const store = await this.getStore(tenantId, storeId);
    return {
      delayWarningMinutes: store.delayWarningMinutes,
      delayCriticalMinutes: store.delayCriticalMinutes,
    };
  }

  private async getStore(tenantId: string, storeId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, tenantId },
    });

    if (!store) {
      throw new NotFoundException("Store not found");
    }

    return store;
  }

  private todayInStoreTimezone(timezone: string): string {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }

  private getHourInTimezone(date: Date, timezone: string): number {
    const hour = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hourCycle: "h23",
    }).format(date);

    return Number(hour);
  }
}
