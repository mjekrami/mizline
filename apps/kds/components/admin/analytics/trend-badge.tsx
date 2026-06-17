import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendBadgeProps {
  value: number | null;
  label?: string;
  className?: string;
}

export function TrendBadge({ value, label = "vs previous period", className }: TrendBadgeProps) {
  if (value === null) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
        <Minus className="size-3" aria-hidden />
        No comparison data
      </span>
    );
  }

  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        positive ? "text-success" : "text-error",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {Math.abs(value).toFixed(1)}% {label}
    </span>
  );
}
