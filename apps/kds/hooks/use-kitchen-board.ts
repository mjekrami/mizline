"use client";

import type { Order } from "@mizline/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOrderActions } from "@/hooks/use-order-actions";
import { useOrderDelayAlerts } from "@/hooks/use-order-delay-alerts";
import {
  getKitchenOrder,
  listStoreOrders,
} from "@/lib/api/kitchen";
import { getAuthUser, loadAuthSession } from "@/lib/auth/session";
import {
  useStoreRealtime,
  type StoreRealtimeUpdate,
} from "@/hooks/use-store-realtime";
import { getActiveKitchenOrders } from "@/lib/kitchen/display";

interface UseKitchenBoardOptions {
  storeId: string;
  initialOrders: Order[];
  delayWarningMinutes: number;
  delayCriticalMinutes: number;
}

export function useKitchenBoard({
  storeId,
  initialOrders,
  delayWarningMinutes,
  delayCriticalMinutes,
}: UseKitchenBoardOptions) {
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [myOrdersOnly, setMyOrdersOnly] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const syncSeqRef = useRef(0);

  useEffect(() => {
    void loadAuthSession().then((user) => {
      setCurrentUserId(user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const updateOrderInList = useCallback((updated: Order) => {
    setOrders((current) =>
      current.map((entry) => (entry.id === updated.id ? updated : entry)),
    );
  }, []);

  const { advancingId, advanceOrder } = useOrderActions({
    onOrderUpdated: updateOrderInList,
    onError: setError,
  });

  const syncOrders = useCallback(async () => {
    const seq = ++syncSeqRef.current;

    try {
      const latest = await listStoreOrders();
      if (seq !== syncSeqRef.current) return;
      setOrders(latest);
    } catch (err) {
      if (seq !== syncSeqRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to refresh orders");
    }
  }, []);

  const syncOrderById = useCallback(
    async (orderId: string) => {
      try {
        const updated = await getKitchenOrder(orderId);
        updateOrderInList(updated);
      } catch {
        await syncOrders();
      }
    },
    [syncOrders, updateOrderInList],
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
        case "updated":
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

  const syncOrder = useCallback(
    async (orderId: string) => {
      setSyncingId(orderId);
      setError(null);
      try {
        await syncOrderById(orderId);
      } finally {
        setSyncingId((current) => (current === orderId ? null : current));
      }
    },
    [syncOrderById],
  );

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

  const visibleOrders = useMemo(() => {
    let next = getActiveKitchenOrders(orders);

    if (myOrdersOnly && currentUserId) {
      next = next.filter((order) => order.assignedTo?.id === currentUserId);
    }

    return next.sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
  }, [currentUserId, myOrdersOnly, orders]);

  return {
    visibleOrders,
    loading,
    error,
    advancingId,
    syncingId,
    now,
    connected,
    audioEnabled,
    myOrdersOnly,
    setMyOrdersOnly,
    showMyOrdersFilter: false,
    refreshOrders,
    syncOrder,
    replaceOrder: updateOrderInList,
    advanceOrder,
    unlockAudio,
  };
}
