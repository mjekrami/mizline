import { getStore, listStoreOrders } from "@/lib/api/server";

export async function loadKitchenBoardData(storeId: string) {
  const [store, orders] = await Promise.all([
    getStore(storeId),
    listStoreOrders(storeId),
  ]);

  return { store, orders };
}
