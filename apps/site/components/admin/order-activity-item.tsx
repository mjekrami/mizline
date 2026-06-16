"use client";

import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  CheckCircle2,
  ChefHat,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import type { ActivityEntry, ActivityEventType } from "@/lib/admin/dashboard";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const eventIcons: Record<ActivityEventType, LucideIcon> = {
  created: ShoppingBag,
  new: ShoppingBag,
  preparing: ChefHat,
  ready: BellRing,
  fulfilled: CheckCircle2,
  cancelled: XCircle,
};

const eventStyles: Record<ActivityEventType, string> = {
  created: "border-order-new/30 bg-order-new/10 text-order-new",
  new: "border-order-new/30 bg-order-new/10 text-order-new",
  preparing: "border-order-preparing/30 bg-order-preparing/10 text-order-preparing",
  ready: "border-order-ready/30 bg-order-ready/10 text-order-ready",
  fulfilled: "border-order-fulfilled/30 bg-order-fulfilled/10 text-order-fulfilled",
  cancelled: "border-order-cancelled/30 bg-order-cancelled/10 text-order-cancelled",
};

interface OrderActivityItemProps {
  entry: ActivityEntry;
  now: number;
  variant?: "stream" | "card";
  onSelect?: (orderId: string) => void;
}

export function OrderActivityItem({
  entry,
  now,
  variant = "card",
  onSelect,
}: OrderActivityItemProps) {
  const Icon = eventIcons[entry.eventType];

  if (variant === "stream") {
    const content = (
      <>
        <span
          className={cn(
            "inline-flex size-6 shrink-0 items-center justify-center rounded-full border",
            eventStyles[entry.eventType],
          )}
        >
          <Icon className="size-3.5" />
        </span>
        <span className="min-w-0 truncate text-sm text-foreground">
          <span className="font-medium">Table {entry.tableName}</span>
          <span className="text-muted-foreground"> · {entry.title}</span>
        </span>
        <time
          dateTime={entry.timestamp}
          className="shrink-0 text-[11px] text-muted-foreground"
        >
          {formatRelativeTime(entry.timestamp, now)}
        </time>
      </>
    );

    const className = cn(
      "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3",
      "max-w-[20rem] shadow-sm",
      onSelect &&
        "cursor-pointer transition hover:border-accent/40 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
    );

    if (onSelect) {
      return (
        <button
          type="button"
          onClick={() => onSelect(entry.orderId)}
          className={className}
          title={`${entry.title} — ${entry.description}`}
        >
          {content}
        </button>
      );
    }

    return (
      <article className={className} title={`${entry.title} — ${entry.description}`}>
        {content}
      </article>
    );
  }

  return (
    <article className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/50 px-3 py-3">
      <span
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-full border",
          eventStyles[entry.eventType],
        )}
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{entry.title}</p>
          <time
            dateTime={entry.timestamp}
            className="shrink-0 text-[11px] text-muted-foreground"
            title={new Date(entry.timestamp).toLocaleString()}
          >
            {formatRelativeTime(entry.timestamp, now)}
          </time>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
        <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
          #{entry.orderNumber} · Table {entry.tableName}
        </p>
      </div>
    </article>
  );
}
