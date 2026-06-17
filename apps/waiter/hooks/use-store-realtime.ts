"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type {
  OrderAssignedEvent,
  OrderCreatedEvent,
  OrderStatusEvent,
  OrderUpdatedEvent,
  WaiterBuzzEvent,
} from "@mizline/shared";
import { getApiBaseUrl, getClientKitchenDevToken } from "@/lib/auth/constants";
import { getAccessToken, loadAuthSession } from "@/lib/auth/session";
import { playWaiterBuzzAlert } from "@/lib/waiter/alerts";

export type StoreRealtimeUpdate =
  | { type: "created"; payload: OrderCreatedEvent }
  | { type: "status"; payload: OrderStatusEvent }
  | { type: "assigned"; payload: OrderAssignedEvent }
  | { type: "updated"; payload: OrderUpdatedEvent };

interface UseStoreRealtimeOptions {
  storeId: string;
  onUpdate: (update: StoreRealtimeUpdate) => void | Promise<void>;
  onBuzz?: (payload: WaiterBuzzEvent) => void;
  enabled?: boolean;
}

export function useStoreRealtime({
  storeId,
  onUpdate,
  onBuzz,
  enabled = true,
}: UseStoreRealtimeOptions) {
  const [connected, setConnected] = useState(false);
  const audioUnlocked = useRef(false);
  const onUpdateRef = useRef(onUpdate);
  const onBuzzRef = useRef(onBuzz);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    onBuzzRef.current = onBuzz;
  }, [onBuzz]);

  useEffect(() => {
    if (audioUnlocked.current) return;

    const unlock = () => {
      audioUnlocked.current = true;
    };

    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });

    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !storeId) return;

    let socket: Socket | null = null;
    let cancelled = false;

    void loadAuthSession().then(() => {
      if (cancelled) return;

      const token = getAccessToken();
      const devToken = getClientKitchenDevToken();
      socket = io(`${getApiBaseUrl()}/realtime`, {
        query: { storeId },
        auth: token ? { token } : devToken ? { devToken } : undefined,
        transports: ["websocket", "polling"],
      });

      const handleCreated = (payload: OrderCreatedEvent) => {
        void onUpdateRef.current({ type: "created", payload });
      };

      const handleStatus = (payload: OrderStatusEvent) => {
        void onUpdateRef.current({ type: "status", payload });
      };

      const handleAssigned = (payload: OrderAssignedEvent) => {
        void onUpdateRef.current({ type: "assigned", payload });
      };

      const handleUpdated = (payload: OrderUpdatedEvent) => {
        void onUpdateRef.current({ type: "updated", payload });
      };

      const handleBuzz = (payload: WaiterBuzzEvent) => {
        onBuzzRef.current?.(payload);
      };

      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));
      socket.on("order.created", handleCreated);
      socket.on("order.preparing", handleStatus);
      socket.on("order.ready", handleStatus);
      socket.on("order.fulfilled", handleStatus);
      socket.on("order.assigned", handleAssigned);
      socket.on("order.updated", handleUpdated);
      socket.on("waiter.buzz", handleBuzz);
    });

    return () => {
      cancelled = true;
      socket?.off("connect");
      socket?.off("disconnect");
      socket?.off("order.created");
      socket?.off("order.preparing");
      socket?.off("order.ready");
      socket?.off("order.fulfilled");
      socket?.off("order.assigned");
      socket?.off("order.updated");
      socket?.off("waiter.buzz");
      socket?.disconnect();
    };
  }, [enabled, storeId]);

  const unlockAudio = useCallback(() => {
    audioUnlocked.current = true;
    playWaiterBuzzAlert();
  }, []);

  return { connected, unlockAudio };
}
