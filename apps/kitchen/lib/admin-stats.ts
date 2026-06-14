import type { AdminCatalog, AdminTable, KitchenMetrics, Order } from "@mizline/shared";

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

export interface ActivityEntry {
  id: string;
  timestamp: string;
  category: string;
  message: string;
  tone: "neutral" | "success" | "warning" | "info";
}

export function buildActivityLog(orders: Order[], limit = 24): ActivityEntry[] {
  const entries: ActivityEntry[] = [];

  for (const order of orders) {
    const orderRef = `#${order.id.slice(-6).toUpperCase()}`;
    const tableRef = `Table ${order.tableName}`;

    entries.push({
      id: `${order.id}-created`,
      timestamp: order.createdAt,
      category: "order.created",
      message: `${tableRef} · ${orderRef} · ${order.items.length} item${order.items.length === 1 ? "" : "s"}`,
      tone: "info",
    });

    if (order.status !== "new") {
      entries.push({
        id: `${order.id}-status`,
        timestamp: order.updatedAt,
        category: `order.${order.status}`,
        message: `${tableRef} · ${orderRef} · ${order.status}`,
        tone:
          order.status === "fulfilled"
            ? "success"
            : order.status === "ready"
              ? "success"
              : order.status === "preparing"
                ? "warning"
                : "neutral",
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
