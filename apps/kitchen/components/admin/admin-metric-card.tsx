import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminMetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "info";
  className?: string;
}

const toneStyles = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  info: "text-info",
} as const;

export function AdminMetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
}: AdminMetricCardProps) {
  return (
    <article
      className={cn(
        "admin-panel flex min-w-0 flex-col gap-2 p-3",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <Icon className="size-3.5 text-muted-foreground" aria-hidden />
      </div>
      <p className={cn("font-mono text-2xl font-semibold tracking-tight", toneStyles[tone])}>
        {value}
      </p>
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </article>
  );
}
