"use client";

import type { Order } from "@mizline/shared";
import { useCallback, useState } from "react";
import { fulfillOrderItem, updateOrderStatus } from "@/lib/kitchen-api";
import { getNextOrderStatus } from "@/lib/order-status";

interface UseOrderActionsOptions {
  onOrderUpdated: (order: Order) => void;
  onError?: (message: string) => void;
  onAfterAction?: () => void | Promise<void>;
}

export function useOrderActions({
  onOrderUpdated,
  onError,
  onAfterAction,
}: UseOrderActionsOptions) {
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const [fulfillingItemId, setFulfillingItemId] = useState<string | null>(null);

  const advanceOrder = useCallback(
    async (order: Order) => {
      const nextStatus = getNextOrderStatus(order.status);
      if (!nextStatus) return;

      setAdvancingId(order.id);

      try {
        const updated = await updateOrderStatus(order.id, nextStatus);
        onOrderUpdated(updated);
        await onAfterAction?.();
      } catch (err) {
        onError?.(
          err instanceof Error ? err.message : "Failed to update order",
        );
      } finally {
        setAdvancingId(null);
      }
    },
    [onAfterAction, onError, onOrderUpdated],
  );

  const fulfillItem = useCallback(
    async (order: Order, itemId: string) => {
      setFulfillingItemId(itemId);

      try {
        const updated = await fulfillOrderItem(order.id, itemId);
        onOrderUpdated(updated);
        await onAfterAction?.();
      } catch (err) {
        onError?.(
          err instanceof Error ? err.message : "Failed to hand off item",
        );
      } finally {
        setFulfillingItemId(null);
      }
    },
    [onAfterAction, onError, onOrderUpdated],
  );

  return {
    advancingId,
    fulfillingItemId,
    advanceOrder,
    fulfillItem,
  };
}
