"use client";

import type { Order, OrderStatus } from "@mizline/shared";
import { orderStatusLabels } from "@mizline/shared";
import { CheckCircle2, Clock3, Loader2 } from "lucide-react";
import {
  formatOrderNumber,
  formatPrice,
  formatWaitTime,
} from "@/lib/format";
import { getAdvanceActionLabel } from "@/lib/order-status";
import { cn } from "@/lib/utils";

const columnAccent: Record<OrderStatus, string> = {
  new: "border-order-new text-order-new",
  preparing: "border-order-preparing text-order-preparing",
  ready: "border-order-ready text-order-ready",
  fulfilled: "border-order-fulfilled text-order-fulfilled",
  cancelled: "border-order-cancelled text-order-cancelled",
};

interface OrderCardProps {
  order: Order;
  now: number;
  advancing: boolean;
  fulfillingItemId: string | null;
  onAdvance: (order: Order) => void;
  onFulfillItem: (order: Order, itemId: string) => void;
}

export function OrderCard({
  order,
  now,
  advancing,
  fulfillingItemId,
  onAdvance,
  onFulfillItem,
}: OrderCardProps) {
  const actionLabel = getAdvanceActionLabel(order.status);
  const notes = order.items
    .map((item) => item.notes?.trim())
    .filter(Boolean) as string[];
  const pendingItems = order.items.filter((item) => !item.fulfilled);
  const canHandOffItems = order.status === "ready" && pendingItems.length > 0;

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-sm",
        columnAccent[order.status],
        "border-t-4",
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-semibold tracking-tight">
            #{formatOrderNumber(order.id)}
          </p>
          <p className="text-sm text-muted-foreground">
            Table {order.tableName}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
            columnAccent[order.status],
            "bg-muted/60",
          )}
        >
          <Clock3 className="size-3.5" />
          {formatWaitTime(order.createdAt, now)}
        </div>
      </header>

      <ul className="flex flex-col gap-2 text-sm">
        {order.items.map((item) => {
          const handingOff = fulfillingItemId === item.id;

          return (
            <li
              key={item.id}
              className={cn(
                "flex items-start justify-between gap-2 rounded-md border px-2 py-1.5",
                item.fulfilled
                  ? "border-success/30 bg-success/5"
                  : "border-border bg-background",
              )}
            >
              <div className={cn(item.fulfilled && "text-muted-foreground")}>
                <span className="font-medium">
                  {item.quantity}× {item.productName}
                </span>
                {item.variantName ? (
                  <span className="text-muted-foreground">
                    {" "}
                    · {item.variantName}
                  </span>
                ) : null}
                {item.modifiers && item.modifiers.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {item.modifiers.map((mod) => mod.optionName).join(", ")}
                  </p>
                ) : null}
                {item.notes ? (
                  <p className="text-xs text-muted-foreground italic">
                    {item.notes}
                  </p>
                ) : null}
              </div>

              {item.fulfilled ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-success">
                  <CheckCircle2 className="size-3.5" />
                  Handed off
                </span>
              ) : canHandOffItems ? (
                <button
                  type="button"
                  disabled={handingOff}
                  onClick={() => onFulfillItem(order, item.id)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {handingOff ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : null}
                  Hand off
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      {notes.length > 0 ? (
        <div className="rounded-md border border-border bg-muted/40 px-2 py-1.5 text-xs">
          <p className="font-medium text-foreground">Special instructions</p>
          <ul className="mt-1 list-disc pl-4 text-muted-foreground">
            {notes.map((note, index) => (
              <li key={`${order.id}-note-${index}`}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <footer className="flex items-center justify-between gap-2 border-t border-border pt-2">
        <span className="text-sm font-medium">{formatPrice(order.total)}</span>
        {actionLabel ? (
          <button
            type="button"
            disabled={advancing}
            onClick={() => onAdvance(order)}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {advancing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : null}
            {actionLabel}
          </button>
        ) : canHandOffItems ? (
          <span className="text-xs font-medium text-muted-foreground">
            {pendingItems.length} item{pendingItems.length === 1 ? "" : "s"}{" "}
            remaining
          </span>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">
            {orderStatusLabels[order.status]}
          </span>
        )}
      </footer>
    </article>
  );
}
