"use client";

import type { Order, OrderStatus } from "@mizline/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getApiBaseUrl, getOrder } from "@/lib/api";
import { loadOrderRefs } from "@/lib/orders";

const ACTIVE_STATUSES: OrderStatus[] = ["new", "preparing", "ready"];

export function useMyOrders(storeId: string, tableId: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const trackedOrderIds = useMemo(
    () => orders.map((order) => order.id),
    [orders],
  );

  const refresh = useCallback(async () => {
    const refs = loadOrderRefs(storeId, tableId);
    if (refs.length === 0) {
      setOrders([]);
      return;
    }

    const results = await Promise.allSettled(
      refs.map((ref) => getOrder(ref.orderId)),
    );

    const next = results
      .flatMap((result) => (result.status === "fulfilled" ? [result.value] : []))
      .filter((order) => order.storeId === storeId && order.tableId === tableId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    setOrders(next);
  }, [storeId, tableId]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        await refresh();
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [refresh]);

  useEffect(() => {
    const handleFocus = () => {
      void refresh();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refresh]);

  useEffect(() => {
    if (trackedOrderIds.length === 0) return;

    let socket: Socket | null = null;
    let active = true;

    async function connect() {
      socket = io(`${getApiBaseUrl()}/realtime`, {
        query: { storeId },
        transports: ["websocket", "polling"],
      });

      const handleUpdate = async () => {
        if (!active) return;
        setRefreshing(true);
        try {
          await refresh();
        } finally {
          if (active) setRefreshing(false);
        }
      };

      socket.on("order.preparing", handleUpdate);
      socket.on("order.ready", handleUpdate);
      socket.on("order.fulfilled", handleUpdate);
    }

    void connect();

    return () => {
      active = false;
      socket?.disconnect();
    };
  }, [trackedOrderIds.length, refresh, storeId]);

  const activeOrders = useMemo(
    () => orders.filter((order) => ACTIVE_STATUSES.includes(order.status)),
    [orders],
  );

  return {
    orders,
    activeOrders,
    loading,
    refreshing,
    hasOrders: orders.length > 0,
    refresh,
  };
}
