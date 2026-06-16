"use client";

import type { AddOrderItemsRequest, Order } from "@mizline/shared";
import { useCallback, useState } from "react";
import {
  addOrderItems,
  removeOrderItem,
  updateOrderItem,
} from "@/lib/api/kitchen";
import { addItemsToOrder } from "@/lib/api/customer";

type OrderModifyMode = "staff" | "customer";

interface UseOrderModificationsOptions {
  mode: OrderModifyMode;
  storeId: string;
  tableId?: string;
  onOrderUpdated: (order: Order) => void;
  onError?: (message: string) => void;
}

export function useOrderModifications({
  mode,
  storeId,
  tableId,
  onOrderUpdated,
  onError,
}: UseOrderModificationsOptions) {
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const run = useCallback(
    async (key: string, action: () => Promise<Order>) => {
      setBusyKey(key);
      try {
        const updated = await action();
        onOrderUpdated(updated);
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
      run(`add:${orderId}`, () => {
        if (mode === "customer") {
          if (!tableId) {
            throw new Error("Table is required to add items");
          }
          return addItemsToOrder(storeId, tableId, orderId, body);
        }
        return addOrderItems(orderId, body);
      }),
    [mode, run, storeId, tableId],
  );

  const changeItemQuantity = useCallback(
    (orderId: string, itemId: string, quantity: number) =>
      run(`qty:${itemId}`, () =>
        updateOrderItem(orderId, itemId, { quantity }),
      ),
    [run],
  );

  const removeItem = useCallback(
    (orderId: string, itemId: string) =>
      run(`remove:${itemId}`, () => removeOrderItem(orderId, itemId)),
    [run],
  );

  return {
    busyKey,
    addItems,
    changeItemQuantity,
    removeItem,
  };
}
