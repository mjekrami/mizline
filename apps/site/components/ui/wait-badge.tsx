import { Clock3 } from "lucide-react";
import { formatWaitTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type WaitUrgency = "normal" | "warning" | "critical";

function getWaitUrgency(createdAt: string, now: number): WaitUrgency {
  const minutes = (now - new Date(createdAt).getTime()) / 60_000;
  if (minutes >= 10) return "critical";
  if (minutes >= 5) return "warning";
  return "normal";
}

const urgencyStyles: Record<WaitUrgency, string> = {
  normal:
    "border-order-ready-strong/30 bg-order-ready-soft text-order-ready-strong",
  warning:
    "border-order-preparing-strong/30 bg-order-preparing-soft text-order-preparing-strong",
  critical:
    "border-order-cancelled-strong/30 bg-order-cancelled-soft text-order-cancelled-strong",
};

interface WaitBadgeProps {
  createdAt: string;
  now: number;
  className?: string;
}

export function WaitBadge({ createdAt, now, className }: WaitBadgeProps) {
  const urgency = getWaitUrgency(createdAt, now);

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
