import type { AdminCatalog, AdminTable } from "@mizline/shared";
import { QrCode, UtensilsCrossed } from "lucide-react";
import type { AdminDashboardStats } from "@/lib/admin/dashboard";
import { buildMenuBreakdown } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";

interface AdminStoreSnapshotProps {
  catalog: AdminCatalog;
  stats: AdminDashboardStats;
  tables: AdminTable[];
}

export function AdminStoreSnapshot({
  catalog,
  stats,
  tables,
}: AdminStoreSnapshotProps) {
  const menuBreakdown = buildMenuBreakdown(catalog, tables, stats);

  return (
    <section className="admin-panel flex flex-col gap-4 p-4 xl:col-span-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Store snapshot
        </p>
        <p className="text-sm text-foreground">Menu & floor overview</p>
      </div>

      <div className="rounded-lg border border-border/60 bg-background/40 p-3">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Catalog health
        </p>
        <p className="mt-2 font-mono text-3xl font-semibold text-success">
          {stats.availableProducts}
          <span className="text-base text-muted-foreground">
            {" "}
            / {catalog.products.length}
          </span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          products available for ordering
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {menuBreakdown.map(({ label, value, total, color }) => {
          const width =
            total > 0 ? Math.max(8, Math.round((value / total) * 100)) : 0;

          return (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-mono text-foreground">{value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", color)}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2">
        <div className="rounded-md border border-border/60 bg-background/40 p-3">
          <UtensilsCrossed className="size-4 text-muted-foreground" />
          <p className="mt-2 font-mono text-xl font-semibold">
            {catalog.products.length}
          </p>
          <p className="text-xs text-muted-foreground">Products</p>
        </div>
        <div className="rounded-md border border-border/60 bg-background/40 p-3">
          <QrCode className="size-4 text-muted-foreground" />
          <p className="mt-2 font-mono text-xl font-semibold">
            {stats.activeTables}
          </p>
          <p className="text-xs text-muted-foreground">Active tables</p>
        </div>
      </div>
    </section>
  );
}
