import { getStore, getStoreMetrics, listStoreOrders } from "@/lib/api-server";

export async function loadKitchenBoardData(storeId: string) {
  const [store, orders, metrics] = await Promise.all([
    getStore(storeId),
    listStoreOrders(storeId),
    getStoreMetrics(storeId),
  ]);

  return { store, orders, metrics };
}
