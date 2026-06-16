import type { OrderStatus } from "@mizline/shared";
import { orderStatusLabels } from "@mizline/shared";
import {
  BellRing,
  CheckCircle2,
  ChefHat,
  Inbox,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<OrderStatus, { icon: LucideIcon; className: string }> =
  {
    new: {
      icon: Inbox,
      className:
        "bg-order-new-soft text-order-new-strong border-order-new-strong/30",
    },
    preparing: {
      icon: ChefHat,
      className:
        "bg-order-preparing-soft text-order-preparing-strong border-order-preparing-strong/30",
    },
    ready: {
      icon: BellRing,
      className:
        "bg-order-ready-soft text-order-ready-strong border-order-ready-strong/30",
    },
    fulfilled: {
      icon: CheckCircle2,
      className:
        "bg-order-fulfilled-soft text-order-fulfilled-strong border-order-fulfilled-strong/30",
    },
    cancelled: {
      icon: XCircle,
      className:
        "bg-order-cancelled-soft text-order-cancelled-strong border-order-cancelled-strong/30",
    },
  };

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({
  status,
  className,
  size = "md",
}: StatusBadgeProps) {
  const { icon: Icon, className: statusClassName } = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        size === "sm" ? "px-2.5 py-1 text-sm" : "px-3 py-1.5 text-base",
        statusClassName,
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden />
      {orderStatusLabels[status]}
    </span>
  );
}
