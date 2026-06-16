"use client";

import type { KitchenMetrics, Store } from "@mizline/shared";
import { Loader2, RefreshCw } from "lucide-react";
import { HeaderMetricCard } from "@/components/admin/header-metric-card";
import { StaffLiveControls } from "@/components/staff-live-controls";
import { ThemeToggle } from "@/components/theme-toggle";
import type { AdminDashboardStats } from "@/lib/admin/dashboard";
import { buildHeaderMetrics } from "@/lib/admin/dashboard";

interface AdminHeaderProps {
  store: Store;
  stats: AdminDashboardStats;
  metrics: KitchenMetrics;
  loading: boolean;
  connected: boolean;
  audioEnabled: boolean;
  onEnableAudio: () => void;
  onRefresh: () => void;
}

export function AdminHeader({
  store,
  stats,
  metrics,
  loading,
  connected,
  audioEnabled,
  onEnableAudio,
  onRefresh,
}: AdminHeaderProps) {
  const headerMetrics = buildHeaderMetrics(stats, metrics);

  return (
    <header className="flex flex-col gap-4 border-b border-border/60 bg-card/30 px-4 py-4 md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              Store / {store.id.slice(-6)}
            </p>
            <StaffLiveControls
              connected={connected}
              audioEnabled={audioEnabled}
              onEnableAudio={onEnableAudio}
            />
          </div>
          <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight">
            {store.name}
          </h1>
          {store.address ? (
            <p className="text-sm text-muted-foreground">{store.address}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 self-start lg:self-center">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Refresh
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {headerMetrics.map((metric) => (
          <HeaderMetricCard key={metric.label} {...metric} />
        ))}
      </div>
    </header>
  );
}
