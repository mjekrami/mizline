import type { Order, OrderStatus } from "@mizline/shared";
import type { AdminCatalog, AdminTable, KitchenMetrics } from "@mizline/shared";
import { formatOrderNumber, formatPrepTime, formatPrice } from "@/lib/format";

export interface AdminDashboardStats {
  revenueTodayCents: number;
  activeOrders: number;
  ordersByStatus: Record<Order["status"], number>;
  availableProducts: number;
  activeTables: number;
}

function isToday(iso: string, now = new Date()): boolean {
  const date = new Date(iso);
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function computeAdminStats(
  orders: Order[],
  catalog: AdminCatalog,
  tables: AdminTable[],
): AdminDashboardStats {
  const ordersByStatus: AdminDashboardStats["ordersByStatus"] = {
    new: 0,
    preparing: 0,
    ready: 0,
    fulfilled: 0,
    cancelled: 0,
  };

  let revenueTodayCents = 0;
  let activeOrders = 0;

  for (const order of orders) {
    ordersByStatus[order.status] += 1;

    if (order.status === "new" || order.status === "preparing" || order.status === "ready") {
      activeOrders += 1;
    }

    if (order.status === "fulfilled" && isToday(order.updatedAt)) {
      revenueTodayCents += order.total;
    }
  }

  return {
    revenueTodayCents,
    activeOrders,
    ordersByStatus,
    availableProducts: catalog.products.filter((product) => product.available).length,
    activeTables: tables.filter((table) => table.active).length,
  };
}

export type ActivityEventType = "created" | OrderStatus;

export interface ActivityEntry {
  id: string;
  timestamp: string;
  eventType: ActivityEventType;
  orderId: string;
  orderNumber: string;
  tableName: string;
  itemCount: number;
  totalCents: number;
  title: string;
  description: string;
  tone: "neutral" | "success" | "warning" | "info";
}

const activityTitles: Record<ActivityEventType, string> = {
  created: "New order received",
  new: "Waiting for kitchen",
  preparing: "Preparation started",
  ready: "Ready to serve",
  fulfilled: "Order completed",
  cancelled: "Order cancelled",
};

const activityDescriptions: Record<ActivityEventType, (order: Order) => string> = {
  created: (order) =>
    `Table ${order.tableName} · ${order.items.length} item${order.items.length === 1 ? "" : "s"} · ${formatPrice(order.total)}`,
  new: (order) =>
    `Order #${formatOrderNumber(order.id)} is waiting to be picked up by the kitchen.`,
  preparing: (order) =>
    `Kitchen is preparing order #${formatOrderNumber(order.id)} for Table ${order.tableName}.`,
  ready: (order) =>
    `Order #${formatOrderNumber(order.id)} is ready for hand-off at Table ${order.tableName}.`,
  fulfilled: (order) =>
    `All items delivered to Table ${order.tableName} · ${formatPrice(order.total)}.`,
  cancelled: (order) =>
    `Order #${formatOrderNumber(order.id)} for Table ${order.tableName} was cancelled.`,
};

function activityTone(eventType: ActivityEventType): ActivityEntry["tone"] {
  switch (eventType) {
    case "created":
      return "info";
    case "preparing":
      return "warning";
    case "ready":
    case "fulfilled":
      return "success";
    case "cancelled":
      return "neutral";
    default:
      return "neutral";
  }
}

export function buildActivityLog(orders: Order[], limit = 24): ActivityEntry[] {
  const entries: ActivityEntry[] = [];

  for (const order of orders) {
    entries.push({
      id: `${order.id}-created`,
      timestamp: order.createdAt,
      eventType: "created",
      orderId: order.id,
      orderNumber: formatOrderNumber(order.id),
      tableName: order.tableName,
      itemCount: order.items.length,
      totalCents: order.total,
      title: activityTitles.created,
      description: activityDescriptions.created(order),
      tone: activityTone("created"),
    });

    if (order.status !== "new") {
      entries.push({
        id: `${order.id}-status`,
        timestamp: order.updatedAt,
        eventType: order.status,
        orderId: order.id,
        orderNumber: formatOrderNumber(order.id),
        tableName: order.tableName,
        itemCount: order.items.length,
        totalCents: order.total,
        title: activityTitles[order.status],
        description: activityDescriptions[order.status](order),
        tone: activityTone(order.status),
      });
    }
  }

  return entries
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    )
    .slice(0, limit);
}

export function summarizeMetrics(metrics: KitchenMetrics) {
  return {
    ordersWaiting: metrics.ordersWaiting,
    averagePrepTimeSeconds: metrics.averagePrepTimeSeconds,
    ordersCompletedToday: metrics.ordersCompletedToday,
  };
}

export interface MenuBreakdownItem {
  label: string;
  value: number;
  total: number;
  color: string;
}

export function buildMenuBreakdown(
  catalog: AdminCatalog,
  tables: AdminTable[],
  stats: AdminDashboardStats,
): MenuBreakdownItem[] {
  return [
    {
      label: "Available products",
      value: stats.availableProducts,
      total: catalog.products.length,
      color: "bg-success",
    },
    {
      label: "Categories",
      value: catalog.categories.length,
      total: catalog.categories.length,
      color: "bg-info",
    },
    {
      label: "Modifier groups",
      value: catalog.modifierGroups.length,
      total: catalog.modifierGroups.length,
      color: "bg-accent",
    },
    {
      label: "Active tables",
      value: stats.activeTables,
      total: tables.length,
      color: "bg-primary",
    },
  ];
}

export function countTrackedOrders(
  ordersByStatus: AdminDashboardStats["ordersByStatus"],
): number {
  return Object.values(ordersByStatus).reduce((sum, count) => sum + count, 0);
}

export interface HeaderMetric {
  label: string;
  value: string;
  tone: string;
}

export function buildHeaderMetrics(
  stats: AdminDashboardStats,
  metrics: KitchenMetrics,
): HeaderMetric[] {
  return [
    {
      label: "Revenue today",
      value: formatPrice(stats.revenueTodayCents),
      tone: "text-success",
    },
    {
      label: "Active orders",
      value: stats.activeOrders.toString(),
      tone: stats.activeOrders > 0 ? "text-warning" : "text-foreground",
    },
    {
      label: "Completed today",
      value: metrics.ordersCompletedToday.toString(),
      tone: "text-foreground",
    },
    {
      label: "Avg prep",
      value: formatPrepTime(metrics.averagePrepTimeSeconds),
      tone: "text-foreground",
    },
  ];
}
