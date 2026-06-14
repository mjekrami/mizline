import type { AdminCatalog, AdminTable } from "@mizline/shared";
import type { AdminDashboardStats } from "@/lib/admin-stats";

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
