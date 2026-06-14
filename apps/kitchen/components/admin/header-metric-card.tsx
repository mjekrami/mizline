interface HeaderMetricCardProps {
  label: string;
  value: string;
  tone: string;
}

export function HeaderMetricCard({ label, value, tone }: HeaderMetricCardProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/50 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 font-mono text-lg font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
