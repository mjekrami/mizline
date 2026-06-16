"use client";

import type { KitchenMetrics, OrderStatus, Store } from "@mizline/shared";
import {
  Loader2,
  Maximize2,
  Minimize2,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { KitchenDndProvider } from "@/components/kitchen/kitchen-dnd-provider";
import { KitchenStatusColumn } from "@/components/kitchen/kitchen-status-column";
import { KitchenMetricsBar } from "@/components/kitchen-metrics";
import { StaffLiveControls } from "@/components/staff-live-controls";
import { ThemeToggle } from "@/components/theme-toggle";
import { useKitchenBoard } from "@/hooks/use-kitchen-board";

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
  initialMetrics: KitchenMetrics;
}

export function KitchenBoard({
  store,
  storeId,
  initialOrders,
  initialMetrics,
}: KitchenBoardProps) {
  const {
    columns,
    ordersByStatus,
    metrics,
    loading,
    error,
    advancingId,
    fulfillingItemId,
    now,
    connected,
    audioEnabled,
    myOrdersOnly,
    setMyOrdersOnly,
    showMyOrdersFilter,
    refreshOrders,
    advanceOrder,
    advanceOrderToStatus,
    fulfillItem,
    unlockAudio,
  } = useKitchenBoard({
    storeId,
    initialOrders,
    initialMetrics,
    delayWarningMinutes: store.delayWarningMinutes ?? 5,
    delayCriticalMinutes: store.delayCriticalMinutes ?? 10,
  });

  const [fullscreen, setFullscreen] = useState(false);

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

  return (
    <main className="flex min-h-dvh flex-col gap-4 p-4 md:h-dvh md:min-h-0 md:overflow-hidden md:p-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">
            Kitchen Dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {store.name}
          </h1>
          <StaffLiveControls
            connected={connected}
            audioEnabled={audioEnabled}
            onEnableAudio={unlockAudio}
          />
          {showMyOrdersFilter ? (
            <label className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={myOrdersOnly}
                onChange={(event) => setMyOrdersOnly(event.target.checked)}
              />
              My orders only
            </label>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
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

      <KitchenMetricsBar metrics={metrics} />

      <KitchenDndProvider>
        <div className="grid gap-3 md:min-h-0 md:flex-1 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((status) => (
            <KitchenStatusColumn
              key={status}
              status={status}
              accentClassName={columnAccent[status]}
              orders={ordersByStatus[status]}
              now={now}
              advancingId={advancingId}
              fulfillingItemId={fulfillingItemId}
              delayWarningMinutes={store.delayWarningMinutes ?? 5}
              delayCriticalMinutes={store.delayCriticalMinutes ?? 10}
              onAdvance={advanceOrder}
              onAdvanceToStatus={advanceOrderToStatus}
              onFulfillItem={fulfillItem}
            />
          ))}
        </div>
      </KitchenDndProvider>
    </main>
  );
}
