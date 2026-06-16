import type { KitchenMetrics } from "@mizline/shared";
import { Clock3, CheckCircle2, Hourglass } from "lucide-react";
import { formatPrepTime } from "@/lib/format";

interface KitchenMetricsBarProps {
  metrics: KitchenMetrics;
}

export function KitchenMetricsBar({ metrics }: KitchenMetricsBarProps) {
  const items = [
    {
      label: "Orders waiting",
      value: metrics.ordersWaiting.toString(),
      icon: Hourglass,
    },
    {
      label: "Average prep time",
      value: formatPrepTime(metrics.averagePrepTimeSeconds),
      icon: Clock3,
    },
    {
      label: "Orders completed today",
      value: metrics.ordersCompletedToday.toString(),
      icon: CheckCircle2,
    },
  ] as const;

  return (
    <section
      aria-label="Kitchen metrics"
      className="grid gap-3 sm:grid-cols-3"
    >
      {items.map(({ label, value, icon: Icon }) => (
        <article
          key={label}
          className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <Icon className="size-5 text-muted-foreground" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
