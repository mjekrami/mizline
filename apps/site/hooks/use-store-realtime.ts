"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getApiBaseUrl } from "@/lib/api";
import { playNewOrderAlert } from "@/lib/order-alert";

interface UseStoreRealtimeOptions {
  storeId: string;
  onUpdate: () => void | Promise<void>;
  enabled?: boolean;
}

export function useStoreRealtime({
  storeId,
  onUpdate,
  enabled = true,
}: UseStoreRealtimeOptions) {
  const [connected, setConnected] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioUnlocked = useRef(false);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!enabled || !storeId) return;

    let socket: Socket | null = null;

    socket = io(`${getApiBaseUrl()}/realtime`, {
      query: { storeId },
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

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("order.created", handleCreated);
    socket.on("order.preparing", handleUpdate);
    socket.on("order.ready", handleUpdate);
    socket.on("order.fulfilled", handleUpdate);

    return () => {
      socket?.off("connect");
      socket?.off("disconnect");
      socket?.off("order.created", handleCreated);
      socket?.off("order.preparing", handleUpdate);
      socket?.off("order.ready", handleUpdate);
      socket?.off("order.fulfilled", handleUpdate);
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
