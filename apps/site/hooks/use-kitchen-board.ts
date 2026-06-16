"use client";

import type { KitchenMetrics, Order, OrderStatus } from "@mizline/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOrderActions } from "@/hooks/use-order-actions";
import { useOrderDelayAlerts } from "@/hooks/use-order-delay-alerts";
import {
  getKitchenMetrics,
  listStoreOrders,
  updateOrderStatus,
} from "@/lib/kitchen-api";
import { canAdvanceOrderTo } from "@/lib/order-status";
import { getAuthUser, loadAuthSession } from "@/lib/auth-session";
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

  useEffect(() => {
    void loadAuthSession().then((user) => {
      setCurrentUserId(user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

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

  const handleAssigned = useCallback(
    (payload: { orderId: string; assignedTo: { id: string; name: string } }) => {
      setOrders((current) =>
        current.map((order) =>
          order.id === payload.orderId
            ? { ...order, assignedTo: payload.assignedTo }
            : order,
        ),
      );
    },
    [],
  );

  const { connected, audioEnabled, unlockAudio } = useStoreRealtime({
    storeId,
    onUpdate: syncOrders,
    onAssigned: handleAssigned,
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
      const order = orders.find((entry) => entry.id === orderId);
      if (!order || !canAdvanceOrderTo(order.status, targetStatus)) return;

      setError(null);

      try {
        const updated = await updateOrderStatus(orderId, targetStatus);
        updateOrderInList(updated);
        await refreshMetrics();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update order");
      }
    },
    [orders, refreshMetrics, updateOrderInList],
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
