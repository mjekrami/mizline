"use client";

import type { Order } from "@mizline/shared";
import { getWaitUrgency } from "@mizline/shared";
import {
  Clock3,
  Hourglass,
  Loader2,
  RefreshCw,
  Star,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { KitchenItemRow } from "@/components/kitchen/kitchen-item-row";
import { orderStatusBarColors } from "@/constants/order-status-colors";
import {
  OrderModifySheet,
  OrderModifyTrigger,
} from "@/components/order/order-modify-sheet";
import {
  filterItemsByTab,
  formatKitchenTableLabel,
  getDefaultItemTab,
  getReadyAllLabel,
  type KitchenItemTab,
} from "@/lib/kitchen/display";
import { formatOrderNumber, formatTimeOfDay, formatWaitTime } from "@mizline/shared";
import { cn } from "@/lib/utils";

const ITEM_TABS: { id: KitchenItemTab; label: string }[] = [
  { id: "called", label: "Called" },
  { id: "pending", label: "Pending" },
  { id: "delivered", label: "Delivered" },
];

const statusBadge: Record<Order["status"], string> = {
  new: "bg-order-new-soft text-order-new-strong",
  preparing: "bg-order-preparing-soft text-order-preparing-strong",
  ready: "bg-order-ready-soft text-order-ready-strong",
  fulfilled: "bg-order-fulfilled-soft text-order-fulfilled-strong",
  cancelled: "bg-order-cancelled-soft text-order-cancelled-strong",
};

const urgencyAccent = {
  normal: "",
  warning: "border-l-[3px] border-l-order-preparing kitchen-urgency-warning",
  critical: "border-l-[3px] border-l-order-cancelled kitchen-urgency-critical",
} as const;

interface KitchenOrderCardProps {
  order: Order;
  storeId: string;
  now: number;
  index: number;
  isNew: boolean;
  advancing: boolean;
  syncing: boolean;
  delayWarningMinutes: number;
  delayCriticalMinutes: number;
  favorite: boolean;
  onToggleFavorite: () => void;
  onAdvance: (order: Order) => void;
  onSync: (orderId: string) => void;
  onOrderUpdated: (order: Order) => void;
}

export function KitchenOrderCard({
  order,
  storeId,
  now,
  index,
  isNew,
  advancing,
  syncing,
  delayWarningMinutes,
  delayCriticalMinutes,
  favorite,
  onToggleFavorite,
  onAdvance,
  onSync,
  onOrderUpdated,
}: KitchenOrderCardProps) {
  const [activeTab, setActiveTab] = useState<KitchenItemTab>(() =>
    getDefaultItemTab(order.status),
  );
  const [modifyOpen, setModifyOpen] = useState(false);

  useEffect(() => {
    setActiveTab(getDefaultItemTab(order.status));
  }, [order.status]);

  const showUrgency =
    order.status === "new" ||
    order.status === "preparing" ||
    order.status === "ready";
  const urgency = showUrgency
    ? getWaitUrgency(order.createdAt, now, {
        warningMinutes: delayWarningMinutes,
        criticalMinutes: delayCriticalMinutes,
      })
    : "normal";

  const visibleItems = filterItemsByTab(order.items, activeTab, order.status);
  const readyAllLabel = getReadyAllLabel(order.status);
  const itemCountByTab = ITEM_TABS.reduce(
    (counts, tab) => {
      counts[tab.id] = filterItemsByTab(
        order.items,
        tab.id,
        order.status,
      ).length;
      return counts;
    },
    {} as Record<KitchenItemTab, number>,
  );

  return (
    <article
      className={cn(
        "kitchen-card-enter group relative flex h-fit w-full flex-col self-start overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md",
        showUrgency && urgencyAccent[urgency],
        isNew && "kitchen-new-order ring-1 ring-order-new/30",
      )}
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      <div
        className={cn("h-1 w-full shrink-0", orderStatusBarColors[order.status])}
        aria-hidden
      />

      <header className="border-b border-border/70 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-lg font-bold tracking-tight transition-colors group-hover:text-accent">
                {formatKitchenTableLabel(order.tableName)}
              </h2>
              <button
                type="button"
                onClick={onToggleFavorite}
                aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
                className="shrink-0 rounded-md p-1 text-muted-foreground transition hover:scale-110 hover:bg-muted hover:text-accent active:scale-95"
              >
                <Star
                  className={cn(
                    "size-4",
                    favorite && "fill-accent text-accent",
                  )}
                />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Order #{formatOrderNumber(order.id)}
            </p>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3.5" aria-hidden />
            {formatTimeOfDay(order.createdAt)}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium tabular-nums",
              urgency === "critical" && "text-order-cancelled-strong",
              urgency === "warning" && "text-order-preparing-strong",
            )}
          >
            <Hourglass className="size-3.5" aria-hidden />
            {formatWaitTime(order.createdAt, now)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={syncing}
            onClick={() => onSync(order.id)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground transition hover:bg-muted active:scale-[0.97] disabled:opacity-60"
          >
            {syncing ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <RefreshCw className="size-3" />
            )}
            Sync
          </button>
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              statusBadge[order.status],
            )}
          >
            {order.status}
          </span>
          <OrderModifyTrigger
            order={order}
            onClick={() => setModifyOpen(true)}
          />
        </div>
      </header>

      <nav
        aria-label="Order item status"
        className="flex border-b border-border/70"
      >
        {ITEM_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative flex-1 px-2 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors duration-200",
              activeTab === tab.id
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {itemCountByTab[tab.id] > 0 ? (
              <span className="ml-1 tabular-nums">({itemCountByTab[tab.id]})</span>
            ) : null}
            {activeTab === tab.id ? (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent transition-all duration-200" />
            ) : null}
          </button>
        ))}
      </nav>

      <div className="flex items-center justify-between gap-2 border-b border-border/70 px-4 py-2.5">
        {order.assignedTo ? (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <UserRound className="size-3.5" aria-hidden />
            By {order.assignedTo.name}
          </p>
        ) : (
          <span className="text-xs text-muted-foreground">Unassigned</span>
        )}

        {readyAllLabel ? (
          <button
            type="button"
            disabled={advancing}
            onClick={() => onAdvance(order)}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-accent-foreground shadow-sm transition hover:opacity-90 hover:shadow active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {advancing ? <Loader2 className="size-3.5 animate-spin" /> : null}
            {readyAllLabel}
          </button>
        ) : null}
      </div>

      <ul key={activeTab} className="kitchen-tab-content flex flex-col gap-2 p-3">
        {visibleItems.length === 0 ? (
          <li className="px-1 py-6 text-center text-sm text-muted-foreground">
            No {activeTab} items
          </li>
        ) : (
          visibleItems.map((item, itemIndex) => (
            <KitchenItemRow
              key={item.id}
              item={item}
              showReadyBadge={activeTab === "called"}
              index={itemIndex}
            />
          ))
        )}
      </ul>

      <OrderModifySheet
        order={order}
        storeId={storeId}
        open={modifyOpen}
        onClose={() => setModifyOpen(false)}
        onOrderUpdated={onOrderUpdated}
      />
    </article>
  );
}
