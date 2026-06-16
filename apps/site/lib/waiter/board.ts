import { getStore, listWaiterOrders } from "@/lib/api/server";

export async function loadWaiterBoardData(storeId: string) {
  const [store, orders] = await Promise.all([
    getStore(storeId),
    listWaiterOrders(storeId),
  ]);

  return { store, orders };
}
