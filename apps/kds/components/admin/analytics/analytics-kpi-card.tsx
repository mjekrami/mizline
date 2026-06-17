import { SparklineChart } from "@/components/admin/analytics/sparkline-chart";
import { TrendBadge } from "@/components/admin/analytics/trend-badge";
import { cn } from "@/lib/utils";

interface AnalyticsKpiCardProps {
  label: string;
  value: string;
  trend: number | null;
  comparisonLabel: string;
  sparkline: number[];
  className?: string;
}

export function AnalyticsKpiCard({
  label,
  value,
  trend,
  comparisonLabel,
  sparkline,
  className,
}: AnalyticsKpiCardProps) {
  return (
    <article className={cn("admin-panel flex min-w-0 flex-col gap-3 p-4", className)}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="font-mono text-3xl font-semibold tracking-tight">{value}</p>
      <TrendBadge value={trend} label={comparisonLabel} />
      <SparklineChart values={sparkline} className="mt-auto h-8 w-full" />
    </article>
  );
}
