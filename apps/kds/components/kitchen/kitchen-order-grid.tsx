"use client";

import type { Order } from "@mizline/shared";
import { ChefHat } from "lucide-react";
import { KitchenOrderCard } from "@/components/kitchen/kitchen-order-card";
import type { KitchenViewMode } from "@/lib/kitchen/display";
import { cn } from "@/lib/utils";

interface KitchenOrderGridProps {
  orders: Order[];
  storeId: string;
  viewMode: KitchenViewMode;
  now: number;
  advancingId: string | null;
  syncingId: string | null;
  delayWarningMinutes: number;
  delayCriticalMinutes: number;
  newOrderIds: Set<string>;
  isFavorite: (tableId: string) => boolean;
  onToggleFavorite: (tableId: string) => void;
  onAdvance: (order: Order) => void;
  onSync: (orderId: string) => void;
  onOrderUpdated: (order: Order) => void;
}

export function KitchenOrderGrid({
  orders,
  storeId,
  viewMode,
  now,
  advancingId,
  syncingId,
  delayWarningMinutes,
  delayCriticalMinutes,
  newOrderIds,
  isFavorite,
  onToggleFavorite,
  onAdvance,
  onSync,
  onOrderUpdated,
}: KitchenOrderGridProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
        <div className="kitchen-fade-up">
          <div className="kitchen-empty-icon mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-border bg-muted/40">
            <ChefHat className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <p className="text-lg font-semibold">No active orders</p>
          <p className="mt-1 text-sm text-muted-foreground">
            New orders will appear here in real time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid min-h-0 flex-1 auto-rows-max items-start gap-3 overflow-y-auto pb-2 pr-1",
        viewMode === "grid"
          ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          : "grid-cols-1",
      )}
    >
      {orders.map((order, index) => (
        <KitchenOrderCard
          key={order.id}
          order={order}
          storeId={storeId}
          now={now}
          index={index}
          isNew={newOrderIds.has(order.id)}
          advancing={advancingId === order.id}
          syncing={syncingId === order.id}
          delayWarningMinutes={delayWarningMinutes}
          delayCriticalMinutes={delayCriticalMinutes}
          favorite={isFavorite(order.tableId)}
          onToggleFavorite={() => onToggleFavorite(order.tableId)}
          onAdvance={onAdvance}
          onSync={onSync}
          onOrderUpdated={onOrderUpdated}
        />
      ))}
    </div>
  );
}
