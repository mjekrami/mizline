"use client";

import type { AddOrderItemsRequest, Order } from "@mizline/shared";
import { useCallback, useState } from "react";
import {
  addOrderItems,
  removeOrderItem,
  updateOrderItem,
} from "@/lib/api/kitchen";

export type OrderModificationAction = "add" | "qty" | "remove";

interface UseOrderModificationsOptions {
  onOrderUpdated: (order: Order, action: OrderModificationAction) => void;
  onError?: (message: string) => void;
}

export function useOrderModifications({
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
      run(`add:${orderId}`, "add", () => addOrderItems(orderId, body)),
    [run],
  );

  const changeItemQuantity = useCallback(
    (orderId: string, itemId: string, quantity: number) =>
      run(`qty:${itemId}`, "qty", () =>
        updateOrderItem(orderId, itemId, { quantity }),
      ),
    [run],
  );

  const removeItem = useCallback(
    (orderId: string, itemId: string) =>
      run(`remove:${itemId}`, "remove", () => removeOrderItem(orderId, itemId)),
    [run],
  );

  return {
    busyKey,
    addItems,
    changeItemQuantity,
    removeItem,
  };
}
