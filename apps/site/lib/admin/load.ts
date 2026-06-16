import {
  getAdminCatalog,
  getAdminTables,
  getStore,
  getStoreMetrics,
  listStoreOrders,
} from "@/lib/api/server";

export async function loadAdminDashboardData(storeId: string) {
  const [store, catalog, tables, orders, metrics] = await Promise.all([
    getStore(storeId),
    getAdminCatalog(storeId),
    getAdminTables(storeId),
    listStoreOrders(storeId),
    getStoreMetrics(storeId),
  ]);

  return { store, catalog, tables, orders, metrics };
}
