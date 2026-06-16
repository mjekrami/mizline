"use client";

import type { Order } from "@mizline/shared";
import { Loader2 } from "lucide-react";
import { getAdvanceActionLabel } from "@/lib/order-status";
import { cn } from "@/lib/utils";

interface OrderAdvanceButtonProps {
  order: Order;
  advancing: boolean;
  onAdvance: (order: Order) => void;
  size?: "sm" | "md";
  className?: string;
}

export function OrderAdvanceButton({
  order,
  advancing,
  onAdvance,
  size = "sm",
  className,
}: OrderAdvanceButtonProps) {
  const actionLabel = getAdvanceActionLabel(order.status);
  if (!actionLabel) return null;

  return (
    <button
      type="button"
      disabled={advancing}
      onClick={() => onAdvance(order)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-accent font-semibold text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-3 py-1.5 text-sm",
        className,
      )}
    >
      {advancing ? (
        <Loader2 className={size === "sm" ? "size-3.5 animate-spin" : "size-4 animate-spin"} />
      ) : null}
      {actionLabel}
    </button>
  );
}
