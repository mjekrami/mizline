import { Clock3 } from "lucide-react";
import {
  getWaitUrgency,
  type WaitUrgencyThresholds,
} from "@mizline/shared";
import { formatWaitTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const urgencyStyles = {
  normal:
    "border-order-ready-strong/30 bg-order-ready-soft text-order-ready-strong",
  warning:
    "border-order-preparing-strong/30 bg-order-preparing-soft text-order-preparing-strong",
  critical:
    "border-order-cancelled-strong/30 bg-order-cancelled-soft text-order-cancelled-strong",
} as const;

interface WaitBadgeProps {
  createdAt: string;
  now: number;
  thresholds?: WaitUrgencyThresholds;
  className?: string;
}

export function WaitBadge({
  createdAt,
  now,
  thresholds = { warningMinutes: 5, criticalMinutes: 10 },
  className,
}: WaitBadgeProps) {
  const urgency = getWaitUrgency(createdAt, now, thresholds);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium tabular-nums",
        urgencyStyles[urgency],
        className,
      )}
    >
      <Clock3 className="size-4" aria-hidden />
      {formatWaitTime(createdAt, now)}
    </span>
  );
}

export { getWaitUrgency };
