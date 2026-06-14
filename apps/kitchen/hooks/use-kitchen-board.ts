"use client";

import type { Order, OrderStatus } from "@mizline/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getApiBaseUrl, listStoreOrders, updateOrderStatus } from "@/lib/api";
import { getNextOrderStatus } from "@/lib/order-status";

const KITCHEN_COLUMNS: OrderStatus[] = [
  "new",
  "preparing",
  "ready",
  "fulfilled",
];

function playNewOrderAlert() {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.35);
    oscillator.onended = () => {
      void context.close();
    };
  } catch {
    // Audio may be blocked until user interaction.
  }
}

interface UseKitchenBoardOptions {
  storeId: string;
  initialOrders: Order[];
}

export function useKitchenBoard({
  storeId,
  initialOrders,
}: UseKitchenBoardOptions) {
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const audioUnlocked = useRef(false);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const refreshOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const latest = await listStoreOrders();
      setOrders(latest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let socket: Socket | null = null;

    socket = io(`${getApiBaseUrl()}/realtime`, {
      query: { storeId },
      transports: ["websocket", "polling"],
    });

    const handleCreated = () => {
      if (audioUnlocked.current) {
        playNewOrderAlert();
      }
      void refreshOrders();
    };

    socket.on("order.created", handleCreated);
    socket.on("order.preparing", refreshOrders);
    socket.on("order.ready", refreshOrders);
    socket.on("order.fulfilled", refreshOrders);

    return () => {
      socket?.off("order.created", handleCreated);
      socket?.off("order.preparing", refreshOrders);
      socket?.off("order.ready", refreshOrders);
      socket?.off("order.fulfilled", refreshOrders);
      socket?.disconnect();
    };
  }, [refreshOrders, storeId]);

  const unlockAudio = useCallback(() => {
    audioUnlocked.current = true;
    playNewOrderAlert();
  }, []);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setAdvancingId(null);
    }
  }, []);

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
    loading,
    error,
    advancingId,
    now,
    refreshOrders,
    advanceOrder,
    unlockAudio,
  };
}
