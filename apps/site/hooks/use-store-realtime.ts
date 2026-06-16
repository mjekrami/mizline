"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type {
  OrderAssignedEvent,
  OrderCreatedEvent,
  OrderStatusEvent,
} from "@mizline/shared";
import { getApiBaseUrl } from "@/lib/api";
import { getAccessToken, loadAuthSession } from "@/lib/auth-session";
import { playNewOrderAlert } from "@/lib/order-alert";

export type StoreRealtimeUpdate =
  | { type: "created"; payload: OrderCreatedEvent }
  | { type: "status"; payload: OrderStatusEvent }
  | { type: "assigned"; payload: OrderAssignedEvent };

interface UseStoreRealtimeOptions {
  storeId: string;
  onUpdate: (update: StoreRealtimeUpdate) => void | Promise<void>;
  enabled?: boolean;
}

export function useStoreRealtime({
  storeId,
  onUpdate,
  enabled = true,
}: UseStoreRealtimeOptions) {
  const [connected, setConnected] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const audioUnlocked = useRef(false);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

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
      socket = io(`${getApiBaseUrl()}/realtime`, {
        query: { storeId },
        auth: token ? { token } : undefined,
        transports: ["websocket", "polling"],
      });

      const handleCreated = (payload: OrderCreatedEvent) => {
        if (audioUnlocked.current) {
          playNewOrderAlert();
        }
        void onUpdateRef.current({ type: "created", payload });
      };

      const handleStatus = (payload: OrderStatusEvent) => {
        void onUpdateRef.current({ type: "status", payload });
      };

      const handleAssigned = (payload: OrderAssignedEvent) => {
        void onUpdateRef.current({ type: "assigned", payload });
      };

      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));
      socket.on("order.created", handleCreated);
      socket.on("order.preparing", handleStatus);
      socket.on("order.ready", handleStatus);
      socket.on("order.fulfilled", handleStatus);
      socket.on("order.assigned", handleAssigned);
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
      socket?.disconnect();
    };
  }, [enabled, storeId]);

  const unlockAudio = useCallback(() => {
    audioUnlocked.current = true;
    setAudioEnabled(true);
    playNewOrderAlert();
  }, []);

  return { connected, audioEnabled, unlockAudio };
}
