import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  DailySalesSummary,
  HourlyActivityEntry,
  HourlyActivityReport,
  SalesAnalyticsDashboard,
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

  async getSalesAnalytics(
    tenantId: string,
    storeId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<SalesAnalyticsDashboard> {
    const store = await this.getStore(tenantId, storeId);
    const defaultRange = this.defaultDateRange(store.timezone);
    const rangeStart = startDate ?? defaultRange.startDate;
    const rangeEnd = endDate ?? defaultRange.endDate;
    const comparison = this.comparisonRange(rangeStart, rangeEnd);
    const dates = this.listDatesInRange(rangeStart, rangeEnd);

    const currentBounds = this.getRangeBounds(store.timezone, rangeStart, rangeEnd);
    const comparisonBounds = this.getRangeBounds(
      store.timezone,
      comparison.comparisonStartDate,
      comparison.comparisonEndDate,
    );

    const [
      currentOrders,
      comparisonOrders,
      currentItems,
      comparisonItems,
      rangeOrders,
    ] = await Promise.all([
      this.listFulfilledOrdersInBounds(tenantId, storeId, currentBounds),
      this.listFulfilledOrdersInBounds(tenantId, storeId, comparisonBounds),
      this.listFulfilledItemsInBounds(tenantId, storeId, currentBounds),
      this.listFulfilledItemsInBounds(tenantId, storeId, comparisonBounds),
      this.listOrdersInBounds(tenantId, storeId, currentBounds),
    ]);

    const currentTotals = this.sumFulfilledOrders(currentOrders);
    const comparisonTotals = this.sumFulfilledOrders(comparisonOrders);
    const currentItemsSold = this.sumItemQuantities(currentItems);
    const comparisonItemsSold = this.sumItemQuantities(comparisonItems);

    const dailySales = this.buildDailySnapshots(
      dates,
      store.timezone,
      currentOrders,
      currentItems,
    );

    return {
      range: {
        startDate: rangeStart,
        endDate: rangeEnd,
        comparisonStartDate: comparison.comparisonStartDate,
        comparisonEndDate: comparison.comparisonEndDate,
      },
      revenueCents: currentTotals.revenueCents,
      revenueChangePercent: this.percentChange(
        currentTotals.revenueCents,
        comparisonTotals.revenueCents,
      ),
      orderCount: currentTotals.orderCount,
      orderCountChangePercent: this.percentChange(
        currentTotals.orderCount,
        comparisonTotals.orderCount,
      ),
      averageTicketCents: currentTotals.averageTicketCents,
      averageTicketChangePercent: this.percentChange(
        currentTotals.averageTicketCents ?? 0,
        comparisonTotals.averageTicketCents ?? 0,
      ),
      itemsSold: currentItemsSold,
      itemsSoldChangePercent: this.percentChange(
        currentItemsSold,
        comparisonItemsSold,
      ),
      revenueSparkline: dailySales.map((day) => day.revenueCents),
      ordersSparkline: dailySales.map((day) => day.orderCount),
      averageTicketSparkline: dailySales.map((day) => day.averageTicketCents ?? 0),
      itemsSoldSparkline: dailySales.map((day) => day.itemsSold),
      dailySales,
      categoryBreakdown: this.buildCategoryBreakdown(currentItems),
      topSellingItems: this.buildTopSellingItems(currentItems),
      peakHours: this.buildPeakHours(rangeOrders, store.timezone),
      channelBreakdown: this.buildChannelBreakdown(rangeOrders.length),
      statusBreakdown: this.buildStatusBreakdown(rangeOrders),
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

  private async listFulfilledOrdersInBounds(
    tenantId: string,
    storeId: string,
    bounds: { start: Date; end: Date },
  ) {
    return this.prisma.order.findMany({
      where: {
        tenantId,
        storeId,
        status: OrderStatus.fulfilled,
        fulfilledAt: { gte: bounds.start, lte: bounds.end },
      },
      select: { fulfilledAt: true, total: true },
    });
  }

  private async listFulfilledItemsInBounds(
    tenantId: string,
    storeId: string,
    bounds: { start: Date; end: Date },
  ) {
    return this.prisma.orderItem.findMany({
      where: {
        order: {
          tenantId,
          storeId,
          status: OrderStatus.fulfilled,
          fulfilledAt: { gte: bounds.start, lte: bounds.end },
        },
      },
      select: {
        productId: true,
        productName: true,
        quantity: true,
        price: true,
        order: { select: { fulfilledAt: true } },
        product: {
          select: {
            image: true,
            category: { select: { name: true } },
          },
        },
      },
    });
  }

  private async listOrdersInBounds(
    tenantId: string,
    storeId: string,
    bounds: { start: Date; end: Date },
  ) {
    return this.prisma.order.findMany({
      where: {
        tenantId,
        storeId,
        createdAt: { gte: bounds.start, lte: bounds.end },
      },
      select: { createdAt: true, status: true },
    });
  }

  private sumFulfilledOrders(
    orders: Array<{ total: number }>,
  ) {
    const orderCount = orders.length;
    const revenueCents = orders.reduce((sum, order) => sum + order.total, 0);

    return {
      orderCount,
      revenueCents,
      averageTicketCents:
        orderCount > 0 ? Math.round(revenueCents / orderCount) : null,
    };
  }

  private sumItemQuantities(items: Array<{ quantity: number }>) {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  private buildDailySnapshots(
    dates: string[],
    timezone: string,
    orders: Array<{ fulfilledAt: Date | null; total: number }>,
    items: Array<{ quantity: number; order: { fulfilledAt: Date | null } }>,
  ) {
    const revenueByDate = new Map<string, number>();
    const ordersByDate = new Map<string, number>();
    const itemsByDate = new Map<string, number>();

    for (const date of dates) {
      revenueByDate.set(date, 0);
      ordersByDate.set(date, 0);
      itemsByDate.set(date, 0);
    }

    for (const order of orders) {
      if (!order.fulfilledAt) continue;
      const date = this.dateInTimezone(order.fulfilledAt, timezone);
      if (!revenueByDate.has(date)) continue;
      revenueByDate.set(date, (revenueByDate.get(date) ?? 0) + order.total);
      ordersByDate.set(date, (ordersByDate.get(date) ?? 0) + 1);
    }

    for (const item of items) {
      const fulfilledAt = item.order.fulfilledAt;
      if (!fulfilledAt) continue;
      const date = this.dateInTimezone(fulfilledAt, timezone);
      if (!itemsByDate.has(date)) continue;
      itemsByDate.set(date, (itemsByDate.get(date) ?? 0) + item.quantity);
    }

    return dates.map((date) => {
      const revenueCents = revenueByDate.get(date) ?? 0;
      const orderCount = ordersByDate.get(date) ?? 0;

      return {
        date,
        revenueCents,
        orderCount,
        averageTicketCents:
          orderCount > 0 ? Math.round(revenueCents / orderCount) : null,
        itemsSold: itemsByDate.get(date) ?? 0,
      };
    });
  }

  private buildCategoryBreakdown(
    items: Array<{
      quantity: number;
      price: number;
      product: { category: { name: string } };
    }>,
  ) {
    const totals = new Map<string, number>();
    let totalRevenue = 0;

    for (const item of items) {
      const lineTotal = item.price * item.quantity;
      const categoryName = item.product.category.name;
      totals.set(categoryName, (totals.get(categoryName) ?? 0) + lineTotal);
      totalRevenue += lineTotal;
    }

    if (totalRevenue === 0) return [];

    return [...totals.entries()]
      .map(([categoryName, revenueCents]) => ({
        categoryName,
        revenueCents,
        percentage: Math.round((revenueCents / totalRevenue) * 1000) / 10,
      }))
      .sort((a, b) => b.revenueCents - a.revenueCents);
  }

  private buildTopSellingItems(
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      product: { image: string | null };
    }>,
  ) {
    const totals = new Map<
      string,
      {
        productId: string;
        name: string;
        image: string | null;
        quantitySold: number;
        revenueCents: number;
      }
    >();

    for (const item of items) {
      const existing = totals.get(item.productId);
      const lineTotal = item.price * item.quantity;

      if (existing) {
        existing.quantitySold += item.quantity;
        existing.revenueCents += lineTotal;
        continue;
      }

      totals.set(item.productId, {
        productId: item.productId,
        name: item.productName,
        image: item.product.image,
        quantitySold: item.quantity,
        revenueCents: lineTotal,
      });
    }

    return [...totals.values()].sort((a, b) => b.quantitySold - a.quantitySold);
  }

  private buildPeakHours(
    orders: Array<{ createdAt: Date }>,
    timezone: string,
  ): HourlyActivityEntry[] {
    const buckets = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      orderCount: 0,
      revenueCents: 0,
    }));

    for (const order of orders) {
      const hour = this.getHourInTimezone(order.createdAt, timezone);
      buckets[hour].orderCount += 1;
    }

    return buckets;
  }

  private buildChannelBreakdown(orderCount: number) {
    if (orderCount === 0) return [];

    return [
      {
        channel: "QR Code",
        orderCount,
        percentage: 100,
      },
    ];
  }

  private buildStatusBreakdown(
    orders: Array<{ status: OrderStatus }>,
  ) {
    const total = orders.length;
    if (total === 0) {
      return [
        { key: "completed" as const, label: "Completed", orderCount: 0, percentage: 0 },
        { key: "inProgress" as const, label: "In Progress", orderCount: 0, percentage: 0 },
        { key: "canceled" as const, label: "Canceled", orderCount: 0, percentage: 0 },
      ];
    }

    let completed = 0;
    let inProgress = 0;
    let canceled = 0;

    for (const order of orders) {
      if (order.status === OrderStatus.fulfilled) {
        completed += 1;
      } else if (order.status === OrderStatus.cancelled) {
        canceled += 1;
      } else {
        inProgress += 1;
      }
    }

    const toShare = (orderCount: number) => ({
      orderCount,
      percentage: Math.round((orderCount / total) * 1000) / 10,
    });

    return [
      { key: "completed" as const, label: "Completed", ...toShare(completed) },
      { key: "inProgress" as const, label: "In Progress", ...toShare(inProgress) },
      { key: "canceled" as const, label: "Canceled", ...toShare(canceled) },
    ];
  }

  private defaultDateRange(timezone: string) {
    const endDate = this.todayInStoreTimezone(timezone);
    let startDate = endDate;

    for (let index = 0; index < 6; index += 1) {
      startDate = this.previousDate(startDate);
    }

    return { startDate, endDate };
  }

  private comparisonRange(startDate: string, endDate: string) {
    const dayCount = this.listDatesInRange(startDate, endDate).length;
    let comparisonEndDate = this.previousDate(startDate);
    let comparisonStartDate = comparisonEndDate;

    for (let index = 1; index < dayCount; index += 1) {
      comparisonStartDate = this.previousDate(comparisonStartDate);
    }

    return { comparisonStartDate, comparisonEndDate };
  }

  private listDatesInRange(startDate: string, endDate: string) {
    const dates: string[] = [];
    let current = startDate;

    while (current <= endDate) {
      dates.push(current);
      current = this.nextDate(current);
    }

    return dates;
  }

  private getRangeBounds(timezone: string, startDate: string, endDate: string) {
    const { start } = getStoreDayBounds(
      timezone,
      new Date(`${startDate}T12:00:00.000Z`),
    );
    const { end } = getStoreDayBounds(
      timezone,
      new Date(`${endDate}T12:00:00.000Z`),
    );

    return { start, end };
  }

  private dateInTimezone(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }

  private nextDate(ymd: string): string {
    const [year, month, day] = ymd.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + 1);

    return date.toISOString().slice(0, 10);
  }

  private percentChange(current: number, previous: number): number | null {
    if (previous === 0) {
      return current > 0 ? 100 : null;
    }

    return Math.round(((current - previous) / previous) * 1000) / 10;
  }

  private previousDate(ymd: string): string {
    const [year, month, day] = ymd.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() - 1);

    return date.toISOString().slice(0, 10);
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
