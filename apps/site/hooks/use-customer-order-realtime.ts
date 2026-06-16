"use client";

import type { OrderStatusEvent } from "@mizline/shared";
import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { getApiBaseUrl } from "@/lib/auth/constants";

interface UseCustomerOrderRealtimeOptions {
  storeId: string;
  orderIds: string[];
  onStatusUpdate: (payload: OrderStatusEvent) => void;
  enabled?: boolean;
}

export function useCustomerOrderRealtime({
  storeId,
  orderIds,
  onStatusUpdate,
  enabled = true,
}: UseCustomerOrderRealtimeOptions) {
  const onUpdateRef = useRef(onStatusUpdate);
  const orderIdsRef = useRef(orderIds);

  useEffect(() => {
    onUpdateRef.current = onStatusUpdate;
  }, [onStatusUpdate]);

  useEffect(() => {
    orderIdsRef.current = orderIds;
  }, [orderIds]);

  useEffect(() => {
    if (!enabled || !storeId || orderIds.length === 0) return;

    let socket: Socket | null = null;
    let active = true;

    const joinOrders = () => {
      for (const orderId of orderIdsRef.current) {
        socket?.emit("joinOrder", { orderId });
      }
    };

    const handleStatus = (payload: OrderStatusEvent) => {
      if (!active || !orderIdsRef.current.includes(payload.orderId)) return;
      onUpdateRef.current(payload);
    };

    socket = io(`${getApiBaseUrl()}/realtime`, {
      query: { storeId },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", joinOrders);
    socket.on("order.preparing", handleStatus);
    socket.on("order.ready", handleStatus);
    socket.on("order.fulfilled", handleStatus);
    socket.on("order.updated", handleStatus);

    return () => {
      active = false;
      socket?.off("connect", joinOrders);
      socket?.off("order.preparing", handleStatus);
      socket?.off("order.ready", handleStatus);
      socket?.off("order.fulfilled", handleStatus);
      socket?.disconnect();
    };
  }, [enabled, orderIds, storeId]);
}
