"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { OrderAssignedEvent } from "@mizline/shared";
import { getApiBaseUrl } from "@/lib/api";
import { getAccessToken, loadAuthSession } from "@/lib/auth-session";
import { playNewOrderAlert } from "@/lib/order-alert";

interface UseStoreRealtimeOptions {
  storeId: string;
  onUpdate: () => void | Promise<void>;
  onAssigned?: (payload: OrderAssignedEvent) => void;
  enabled?: boolean;
}

export function useStoreRealtime({
  storeId,
  onUpdate,
  onAssigned,
  enabled = true,
}: UseStoreRealtimeOptions) {
  const [connected, setConnected] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioUnlocked = useRef(false);
  const onUpdateRef = useRef(onUpdate);
  const onAssignedRef = useRef(onAssigned);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    onAssignedRef.current = onAssigned;
  }, [onAssigned]);

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

      const handleCreated = () => {
        if (audioUnlocked.current) {
          playNewOrderAlert();
        }
        void onUpdateRef.current();
      };

      const handleUpdate = () => {
        void onUpdateRef.current();
      };

      const handleAssigned = (payload: OrderAssignedEvent) => {
        onAssignedRef.current?.(payload);
        void onUpdateRef.current();
      };

      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));
      socket.on("order.created", handleCreated);
      socket.on("order.preparing", handleUpdate);
      socket.on("order.ready", handleUpdate);
      socket.on("order.fulfilled", handleUpdate);
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
