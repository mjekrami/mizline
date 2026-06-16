"use client";

import type { Order, Store } from "@mizline/shared";
import { BellRing, Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { WaiterOrderCard } from "@/components/waiter/waiter-order-card";
import { useWaiterBoard } from "@/hooks/use-waiter-board";
import { cn } from "@/lib/utils";

interface WaiterBoardProps {
  store: Store;
  storeId: string;
  initialOrders: Order[];
}

export function WaiterBoard({ store, storeId, initialOrders }: WaiterBoardProps) {
  const {
    visibleOrders,
    loading,
    error,
    now,
    connected,
    buzzAlert,
    refreshOrders,
    unlockAlerts,
    waiterName,
  } = useWaiterBoard({ storeId, initialOrders });

  return (
    <main className="flex min-h-dvh flex-col gap-4 px-4 py-5 pb-8">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Waiter</p>
            <h1 className="text-2xl font-bold tracking-tight">{store.name}</h1>
            <p className="text-sm text-muted-foreground">Hi, {waiterName}</p>
          </div>
          <button
            type="button"
            onClick={() => void refreshOrders()}
            disabled={loading}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
            aria-label="Refresh orders"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              connected
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground",
            )}
          >
            {connected ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
            {connected ? "Connected" : "Reconnecting…"}
          </span>
          <button
            type="button"
            onClick={unlockAlerts}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <BellRing className="size-3.5" />
            Enable alerts
          </button>
        </div>
      </header>

      {buzzAlert ? (
        <div className="rounded-2xl border border-accent bg-accent/10 px-4 py-4 text-sm shadow-sm">
          <p className="font-semibold text-accent">Table needs you</p>
          <p className="mt-1 text-foreground">
            {buzzAlert.tableName} is calling for a waiter.
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      {visibleOrders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <p className="text-lg font-semibold">No assigned orders</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            New orders assigned to you will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleOrders.map((order) => (
            <WaiterOrderCard key={order.id} order={order} now={now} />
          ))}
        </div>
      )}
    </main>
  );
}
