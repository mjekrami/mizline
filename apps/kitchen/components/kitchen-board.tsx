"use client";

import type { OrderStatus, Store } from "@mizline/shared";
import { orderStatusLabels } from "@mizline/shared";
import {
  Loader2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Volume2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { OrderCard } from "@/components/order-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useKitchenBoard } from "@/hooks/use-kitchen-board";
import { cn } from "@/lib/utils";

const columnAccent: Record<OrderStatus, string> = {
  new: "border-order-new text-order-new",
  preparing: "border-order-preparing text-order-preparing",
  ready: "border-order-ready text-order-ready",
  fulfilled: "border-order-fulfilled text-order-fulfilled",
  cancelled: "border-order-cancelled text-order-cancelled",
};

interface KitchenBoardProps {
  store: Store;
  storeId: string;
  initialOrders: import("@mizline/shared").Order[];
}

export function KitchenBoard({
  store,
  storeId,
  initialOrders,
}: KitchenBoardProps) {
  const {
    columns,
    ordersByStatus,
    loading,
    error,
    advancingId,
    fulfillingItemId,
    now,
    refreshOrders,
    advanceOrder,
    fulfillItem,
    unlockAudio,
  } = useKitchenBoard({ storeId, initialOrders });

  const [fullscreen, setFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  }, []);

  const enableAudio = useCallback(() => {
    unlockAudio();
    setAudioEnabled(true);
  }, [unlockAudio]);

  return (
    <main className="flex min-h-full flex-col gap-4 p-4 md:p-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">
            Kitchen Dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {store.name}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wifi className="size-4 text-success" />
            Live · Socket.IO
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          {!audioEnabled ? (
            <button
              type="button"
              onClick={enableAudio}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Volume2 className="size-4" />
              Enable alerts
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void refreshOrders()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            {fullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
            {fullscreen ? "Exit full screen" : "Full screen"}
          </button>
        </div>
      </header>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          <WifiOff className="size-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((status) => {
          const columnOrders = ordersByStatus[status];

          return (
            <section
              key={status}
              className={cn(
                "flex min-h-[24rem] flex-col gap-3 rounded-lg border border-t-4 bg-card/80 p-3",
                columnAccent[status],
              )}
            >
              <div className="flex items-center justify-between gap-2 px-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide">
                  {orderStatusLabels[status]}
                </h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {columnOrders.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
                {columnOrders.length === 0 ? (
                  <p className="px-1 text-sm text-muted-foreground">
                    No orders
                  </p>
                ) : (
                  columnOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      now={now}
                      advancing={advancingId === order.id}
                      fulfillingItemId={fulfillingItemId}
                      onAdvance={advanceOrder}
                      onFulfillItem={fulfillItem}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
