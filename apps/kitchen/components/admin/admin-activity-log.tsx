import type { ActivityEntry } from "@/lib/admin-stats";
import { cn } from "@/lib/utils";

interface AdminActivityLogProps {
  entries: ActivityEntry[];
}

const toneStyles: Record<ActivityEntry["tone"], string> = {
  neutral: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  info: "text-info",
};

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function AdminActivityLog({ entries }: AdminActivityLogProps) {
  return (
    <section className="admin-panel overflow-hidden">
      <header className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Live activity
          </p>
          <p className="text-sm text-foreground">Order stream</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
          <span className="size-1.5 rounded-full bg-success" />
          Streaming
        </span>
      </header>

      <div className="admin-terminal max-h-44 overflow-y-auto bg-background/40 px-4 py-3">
        {entries.length === 0 ? (
          <p className="text-muted-foreground">No recent order activity.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="grid grid-cols-[5.5rem_8.5rem_1fr] gap-3 text-[11px] leading-5"
              >
                <span className="text-muted-foreground">
                  {formatTimestamp(entry.timestamp)}
                </span>
                <span className={cn("font-medium", toneStyles[entry.tone])}>
                  {entry.category}
                </span>
                <span className="truncate text-foreground/90">{entry.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
