"use client";

import type { Order, WaiterBuzzEvent } from "@mizline/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getWaiterOrder, listWaiterOrders } from "@/lib/api/waiter";
import { getAuthUser, loadAuthSession } from "@/lib/auth/session";
import {
  useStoreRealtime,
  type StoreRealtimeUpdate,
} from "@/hooks/use-store-realtime";
import { getActiveKitchenOrders } from "@/lib/kitchen/display";
import { playWaiterBuzzAlert } from "@/lib/waiter/alerts";

interface UseWaiterBoardOptions {
  storeId: string;
  initialOrders: Order[];
}

export interface WaiterBuzzAlert {
  tableName: string;
  tableId: string;
  createdAt: string;
}

export function useWaiterBoard({
  storeId,
  initialOrders,
}: UseWaiterBoardOptions) {
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [buzzAlert, setBuzzAlert] = useState<WaiterBuzzAlert | null>(null);
  const syncSeqRef = useRef(0);
  const audioUnlocked = useRef(false);

  useEffect(() => {
    void loadAuthSession().then((user) => {
      setCurrentUserId(user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!buzzAlert) return;

    const timer = window.setTimeout(() => setBuzzAlert(null), 8_000);
    return () => window.clearTimeout(timer);
  }, [buzzAlert]);

  const updateOrderInList = useCallback((updated: Order) => {
    setOrders((current) =>
      current.map((entry) => (entry.id === updated.id ? updated : entry)),
    );
  }, []);

  const syncOrders = useCallback(async () => {
    const seq = ++syncSeqRef.current;

    try {
      const latest = await listWaiterOrders();
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
        const updated = await getWaiterOrder(orderId);
        updateOrderInList(updated);
      } catch {
        await syncOrders();
      }
    },
    [syncOrders, updateOrderInList],
  );

  const handleBuzz = useCallback(
    (payload: WaiterBuzzEvent) => {
      const userId = currentUserId ?? getAuthUser()?.id;
      if (!userId || !payload.targetWaiterIds.includes(userId)) {
        return;
      }

      if (audioUnlocked.current) {
        playWaiterBuzzAlert();
      }

      setBuzzAlert({
        tableName: payload.tableName,
        tableId: payload.tableId,
        createdAt: payload.createdAt,
      });
    },
    [currentUserId],
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

  const { connected, unlockAudio } = useStoreRealtime({
    storeId,
    onUpdate: handleRealtimeUpdate,
    onBuzz: handleBuzz,
    alertOnCreated: false,
  });

  const unlockAlerts = useCallback(() => {
    audioUnlocked.current = true;
    unlockAudio();
  }, [unlockAudio]);

  const visibleOrders = useMemo(() => {
    if (!currentUserId) {
      return [];
    }

    return getActiveKitchenOrders(orders)
      .filter((order) => order.assignedTo?.id === currentUserId)
      .sort(
        (left, right) =>
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime(),
      );
  }, [currentUserId, orders]);

  return {
    visibleOrders,
    loading,
    error,
    now,
    connected,
    buzzAlert,
    refreshOrders,
    unlockAlerts,
    waiterName: getAuthUser()?.name ?? "Waiter",
  };
}
