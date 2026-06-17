"use client";

import type { OrderItem } from "@mizline/shared";
import { AlertCircle } from "lucide-react";
import { splitItemModifiers } from "@/lib/kitchen/display";

interface KitchenItemRowProps {
  item: OrderItem;
  showReadyBadge: boolean;
}

export function KitchenItemRow({
  item,
  showReadyBadge,
}: KitchenItemRowProps) {
  const { base, extras } = splitItemModifiers(item);

  return (
    <li className="rounded-lg border border-border/70 bg-background/60 px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-sm font-semibold leading-snug">
          {item.productName}
        </p>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">
          × {item.quantity}
        </span>
      </div>

      {item.variantName ? (
        <p className="mt-1 text-xs text-muted-foreground">{item.variantName}</p>
      ) : null}

      {base.length > 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {base.map((mod) => mod.optionName).join(", ")}
        </p>
      ) : null}

      {extras.length > 0 ? (
        <p className="mt-1 text-xs font-medium text-accent">
          Extras: {extras.map((mod) => mod.optionName).join(", ")}
        </p>
      ) : null}

      {item.notes ? (
        <p className="mt-1.5 inline-flex items-start gap-1 text-xs font-medium text-warning">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {item.notes}
        </p>
      ) : null}

      <div className="mt-2 flex items-center justify-end gap-2">
        {showReadyBadge ? (
          <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
            Ready
          </span>
        ) : null}

        {item.fulfilled ? (
          <span className="rounded-md bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
            Delivered
          </span>
        ) : null}
      </div>
    </li>
  );
}
