"use client";

import type { AddOrderItemsRequest, Order } from "@mizline/shared";
import { useCallback, useState } from "react";
import { addItemsToOrder } from "@/lib/api/customer";

export type OrderModificationAction = "add" | "qty" | "remove";

interface UseOrderModificationsOptions {
  storeId: string;
  tableId: string;
  onOrderUpdated: (order: Order, action: OrderModificationAction) => void;
  onError?: (message: string) => void;
}

export function useOrderModifications({
  storeId,
  tableId,
  onOrderUpdated,
  onError,
}: UseOrderModificationsOptions) {
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const run = useCallback(
    async (key: string, action: OrderModificationAction, task: () => Promise<Order>) => {
      setBusyKey(key);
      try {
        const updated = await task();
        onOrderUpdated(updated, action);
        return updated;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not update order";
        onError?.(message);
        throw error;
      } finally {
        setBusyKey((current) => (current === key ? null : current));
      }
    },
    [onError, onOrderUpdated],
  );

  const addItems = useCallback(
    (orderId: string, body: AddOrderItemsRequest) =>
      run(`add:${orderId}`, "add", () =>
        addItemsToOrder(storeId, tableId, orderId, body),
      ),
    [run, storeId, tableId],
  );

  return {
    busyKey,
    addItems,
  };
}
