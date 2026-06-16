import type { OrderStatus } from "@mizline/shared";
import { orderStatusLabels } from "@mizline/shared";
import { cn } from "@/lib/utils";

const statusStyles: Record<OrderStatus, string> = {
  new: "border-order-new/40 bg-order-new/10 text-order-new",
  preparing: "border-order-preparing/40 bg-order-preparing/10 text-order-preparing",
  ready: "border-order-ready/40 bg-order-ready/10 text-order-ready",
  fulfilled: "border-order-fulfilled/40 bg-order-fulfilled/10 text-order-fulfilled",
  cancelled: "border-order-cancelled/40 bg-order-cancelled/10 text-order-cancelled",
};

interface AdminStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function AdminStatusBadge({ status, className }: AdminStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        statusStyles[status],
        className,
      )}
    >
      {orderStatusLabels[status]}
    </span>
  );
}
