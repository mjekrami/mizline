import type { ActivityEntry } from "@/lib/admin-stats";

interface AdminActionsFeedProps {
  entries: ActivityEntry[];
}

function formatActivityTime(timestamp: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function AdminActionsFeed({ entries }: AdminActionsFeedProps) {
  return (
    <section className="admin-panel flex flex-col gap-3 p-4 xl:col-span-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Actions feed
        </p>
        <p className="text-sm text-foreground">Latest order events</p>
      </div>

      <ul className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto">
        {entries.length === 0 ? (
          <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
            Waiting for the first order.
          </li>
        ) : (
          entries.slice(0, 12).map((entry) => (
            <li
              key={entry.id}
              className="rounded-md border border-border/60 bg-background/40 px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                  {entry.category}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatActivityTime(entry.timestamp)}
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground">{entry.message}</p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
