"use client";

import type { KitchenMetrics, Order, OrderStatus } from "@mizline/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOrderActions } from "@/hooks/use-order-actions";
import { useOrderDelayAlerts } from "@/hooks/use-order-delay-alerts";
import {
  getKitchenMetrics,
  getKitchenOrder,
  listStoreOrders,
  updateOrderStatus,
} from "@/lib/kitchen-api";
import { canAdvanceOrderTo } from "@/lib/order-status";
import { getAuthUser, loadAuthSession } from "@/lib/auth-session";
import {
  useStoreRealtime,
  type StoreRealtimeUpdate,
} from "@/hooks/use-store-realtime";

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
  delayWarningMinutes: number;
  delayCriticalMinutes: number;
}

export function useKitchenBoard({
  storeId,
  initialOrders,
  initialMetrics,
  delayWarningMinutes,
  delayCriticalMinutes,
}: UseKitchenBoardOptions) {
  const [orders, setOrders] = useState(initialOrders);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [myOrdersOnly, setMyOrdersOnly] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const syncSeqRef = useRef(0);

  useEffect(() => {
    void loadAuthSession().then((user) => {
      setCurrentUserId(user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    setMetrics(initialMetrics);
  }, [initialMetrics]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
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

  const updateOrderInList = useCallback((updated: Order) => {
    setOrders((current) =>
      current.map((entry) => (entry.id === updated.id ? updated : entry)),
    );
  }, []);

  const { advancingId, fulfillingItemId, advanceOrder, fulfillItem } =
    useOrderActions({
      onOrderUpdated: updateOrderInList,
      onError: setError,
      onAfterAction: refreshMetrics,
    });

  const syncOrders = useCallback(async () => {
    const seq = ++syncSeqRef.current;

    try {
      const latest = await listStoreOrders();
      if (seq !== syncSeqRef.current) return;
      setOrders(latest);
      await refreshMetrics();
    } catch (err) {
      if (seq !== syncSeqRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to refresh orders");
    }
  }, [refreshMetrics]);

  const syncOrderById = useCallback(
    async (orderId: string) => {
      try {
        const updated = await getKitchenOrder(orderId);
        updateOrderInList(updated);
        await refreshMetrics();
      } catch {
        await syncOrders();
      }
    },
    [refreshMetrics, syncOrders, updateOrderInList],
  );

  const handleRealtimeUpdate = useCallback(
    (update: StoreRealtimeUpdate) => {
      switch (update.type) {
        case "created":
          return syncOrders();
        case "status":
          return syncOrderById(update.payload.orderId);
        case "assigned":
          setOrders((current) =>
            current.map((order) =>
              order.id === update.payload.orderId
                ? { ...order, assignedTo: update.payload.assignedTo }
                : order,
            ),
          );
          return syncOrderById(update.payload.orderId);
      }
    },
    [syncOrderById, syncOrders],
  );

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
    onUpdate: handleRealtimeUpdate,
  });

  useOrderDelayAlerts({
    orders,
    now,
    thresholds: {
      warningMinutes: delayWarningMinutes,
      criticalMinutes: delayCriticalMinutes,
    },
    audioEnabled,
  });

  const advanceOrderToStatus = useCallback(
    async (orderId: string, targetStatus: OrderStatus) => {
      let previousOrder: Order | undefined;
      let shouldAdvance = false;

      setOrders((current) => {
        previousOrder = current.find((entry) => entry.id === orderId);
        if (
          !previousOrder ||
          !canAdvanceOrderTo(previousOrder.status, targetStatus)
        ) {
          return current;
        }

        shouldAdvance = true;
        return current.map((entry) =>
          entry.id === orderId ? { ...entry, status: targetStatus } : entry,
        );
      });

      if (!shouldAdvance || !previousOrder) return;

      setError(null);

      try {
        const updated = await updateOrderStatus(orderId, targetStatus);
        updateOrderInList(updated);
        await refreshMetrics();
      } catch (err) {
        updateOrderInList(previousOrder);
        setError(err instanceof Error ? err.message : "Failed to update order");
      }
    },
    [refreshMetrics, updateOrderInList],
  );

  const visibleOrders = useMemo(() => {
    if (!myOrdersOnly || !currentUserId) {
      return orders;
    }

    return orders.filter((order) => order.assignedTo?.id === currentUserId);
  }, [currentUserId, myOrdersOnly, orders]);

  const ordersByStatus = useMemo(() => {
    const grouped = Object.fromEntries(
      KITCHEN_COLUMNS.map((status) => [status, [] as Order[]]),
    ) as Record<OrderStatus, Order[]>;

    for (const order of visibleOrders) {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    }

    return grouped;
  }, [visibleOrders]);

  const isBarista = getAuthUser()?.role === "barista";

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
    myOrdersOnly,
    setMyOrdersOnly,
    showMyOrdersFilter: isBarista,
    refreshOrders,
    advanceOrder,
    advanceOrderToStatus,
    fulfillItem,
    unlockAudio,
  };
}
