"use client";

import type { Order } from "@mizline/shared";
import { CheckCircle2, Loader2 } from "lucide-react";
import { canHandOffOrderItems } from "@/lib/order/display";
import { formatPrice } from "@mizline/shared";
import { cn } from "@/lib/utils";

type OrderItemsVariant = "kitchen" | "admin";

interface OrderItemsListProps {
  order: Order;
  variant: OrderItemsVariant;
  fulfillingItemId: string | null;
  onFulfillItem: (order: Order, itemId: string) => void;
  className?: string;
}

const rowStyles: Record<OrderItemsVariant, string> = {
  kitchen: "rounded-md border px-2 py-1.5",
  admin: "rounded-lg border px-3 py-2.5",
};

export function OrderItemsList({
  order,
  variant,
  fulfillingItemId,
  onFulfillItem,
  className,
}: OrderItemsListProps) {
  const canHandOffItems = canHandOffOrderItems(order);

  return (
    <ul className={cn("flex flex-col gap-2 text-sm", className)}>
      {order.items.map((item) => {
        const handingOff = fulfillingItemId === item.id;

        return (
          <li
            key={item.id}
            className={cn(
              "flex items-start justify-between gap-2",
              rowStyles[variant],
              item.fulfilled
                ? "border-success/30 bg-success/5"
                : variant === "kitchen"
                  ? "border-border bg-background"
                  : "border-border/60 bg-background/40",
              variant === "admin" && "gap-3",
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
              {item.modifiers.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {item.modifiers.map((mod) => mod.optionName).join(", ")}
                </p>
              ) : null}
              {item.notes ? (
                <p
                  className={cn(
                    "text-xs text-muted-foreground",
                    variant === "kitchen" && "italic",
                  )}
                >
                  {item.notes}
                </p>
              ) : null}
              {variant === "admin" && item.fulfilled ? (
                <p className="text-xs text-success">Handed off</p>
              ) : null}
              {variant === "admin" && !item.fulfilled && order.status === "ready" ? (
                <p className="text-xs text-muted-foreground">Awaiting hand-off</p>
              ) : null}
            </div>

            <OrderItemActions
              variant={variant}
              fulfilled={item.fulfilled}
              canHandOff={canHandOffItems}
              handingOff={handingOff}
              lineTotal={item.price * item.quantity}
              onHandOff={() => onFulfillItem(order, item.id)}
            />
          </li>
        );
      })}
    </ul>
  );
}

interface OrderItemActionsProps {
  variant: OrderItemsVariant;
  fulfilled: boolean;
  canHandOff: boolean;
  handingOff: boolean;
  lineTotal: number;
  onHandOff: () => void;
}

function OrderItemActions({
  variant,
  fulfilled,
  canHandOff,
  handingOff,
  lineTotal,
  onHandOff,
}: OrderItemActionsProps) {
  if (variant === "kitchen") {
    if (fulfilled) {
      return (
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-success">
          <CheckCircle2 className="size-3.5" />
          Handed off
        </span>
      );
    }

    if (!canHandOff) return null;

    return (
      <button
        type="button"
        disabled={handingOff}
        onClick={onHandOff}
        className="inline-flex shrink-0 items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {handingOff ? <Loader2 className="size-3.5 animate-spin" /> : null}
        Hand off
      </button>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      {fulfilled ? (
        <CheckCircle2 className="size-4 text-success" />
      ) : canHandOff ? (
        <button
          type="button"
          disabled={handingOff}
          onClick={onHandOff}
          className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {handingOff ? <Loader2 className="size-3.5 animate-spin" /> : null}
          Hand off
        </button>
      ) : null}
      <span className="font-mono text-xs">{formatPrice(lineTotal)}</span>
    </div>
  );
}
