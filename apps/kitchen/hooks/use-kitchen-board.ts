"use client";

import type { KitchenMetrics, Order, OrderStatus } from "@mizline/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fulfillOrderItem,
  getKitchenMetrics,
  listStoreOrders,
  updateOrderStatus,
} from "@/lib/api";
import { getNextOrderStatus } from "@/lib/order-status";
import { useStoreRealtime } from "@/hooks/use-store-realtime";

const KITCHEN_COLUMNS: OrderStatus[] = [
  "new",
  "preparing",
  "ready",
  "fulfilled",
];

interface UseKitchenBoardOptions {
  storeId: string;
  initialOrders: Order[];
  initialMetrics: KitchenMetrics;
}

export function useKitchenBoard({
  storeId,
  initialOrders,
  initialMetrics,
}: UseKitchenBoardOptions) {
  const [orders, setOrders] = useState(initialOrders);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const [fulfillingItemId, setFulfillingItemId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    setMetrics(initialMetrics);
  }, [initialMetrics]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const refreshMetrics = useCallback(async () => {
    try {
      const latest = await getKitchenMetrics();
      setMetrics(latest);
    } catch {
      // Metrics refresh failures should not block the board.
    }
  }, []);

  const syncOrders = useCallback(async () => {
    try {
      const latest = await listStoreOrders();
      setOrders(latest);
      await refreshMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh orders");
    }
  }, [refreshMetrics]);

  const refreshOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await syncOrders();
    } finally {
      setLoading(false);
    }
  }, [syncOrders]);

  const { connected, audioEnabled, unlockAudio } = useStoreRealtime({
    storeId,
    onUpdate: syncOrders,
  });

  const advanceOrder = useCallback(async (order: Order) => {
    const nextStatus = getNextOrderStatus(order.status);
    if (!nextStatus) return;

    setAdvancingId(order.id);
    setError(null);

    try {
      const updated = await updateOrderStatus(order.id, nextStatus);
      setOrders((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
      await refreshMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setAdvancingId(null);
    }
  }, [refreshMetrics]);

  const fulfillItem = useCallback(async (order: Order, itemId: string) => {
    setFulfillingItemId(itemId);
    setError(null);

    try {
      const updated = await fulfillOrderItem(order.id, itemId);
      setOrders((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
      await refreshMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to hand off item");
    } finally {
      setFulfillingItemId(null);
    }
  }, [refreshMetrics]);

  const ordersByStatus = useMemo(() => {
    const grouped = Object.fromEntries(
      KITCHEN_COLUMNS.map((status) => [status, [] as Order[]]),
    ) as Record<OrderStatus, Order[]>;

    for (const order of orders) {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    }

    return grouped;
  }, [orders]);

  return {
    columns: KITCHEN_COLUMNS,
    ordersByStatus,
    metrics,
    loading,
    error,
    advancingId,
    fulfillingItemId,
    now,
    connected,
    audioEnabled,
    refreshOrders,
    advanceOrder,
    fulfillItem,
    unlockAudio,
  };
}
