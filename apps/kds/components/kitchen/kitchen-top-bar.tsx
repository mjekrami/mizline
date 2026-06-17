"use client";

import {
  LayoutGrid,
  List,
  Loader2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Star,
  WifiOff,
} from "lucide-react";
import { KitchenLogo } from "@/components/kitchen/kitchen-logo";
import { KitchenStatsPill } from "@/components/kitchen/kitchen-stats-pill";
import { StaffLiveControls } from "@/components/staff-live-controls";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  KITCHEN_BOARD_SCOPE_LABEL,
  kitchenLogoStoreClassName,
} from "@/lib/kitchen/brand";
import type { KitchenBoardStats, KitchenViewMode } from "@/lib/kitchen/display";
import { cn } from "@/lib/utils";

interface KitchenTopBarProps {
  storeName: string;
  stats: KitchenBoardStats;
  loading: boolean;
  error: string | null;
  connected: boolean;
  audioEnabled: boolean;
  fullscreen: boolean;
  viewMode: KitchenViewMode;
  favoritesOnly: boolean;
  showMyOrdersFilter: boolean;
  myOrdersOnly: boolean;
  onRefresh: () => void;
  onToggleFullscreen: () => void;
  onEnableAudio: () => void;
  onViewModeChange: (mode: KitchenViewMode) => void;
  onFavoritesOnlyChange: (value: boolean) => void;
  onMyOrdersOnlyChange: (value: boolean) => void;
}

export function KitchenTopBar({
  storeName,
  stats,
  loading,
  error,
  connected,
  audioEnabled,
  fullscreen,
  viewMode,
  favoritesOnly,
  showMyOrdersFilter,
  myOrdersOnly,
  onRefresh,
  onToggleFullscreen,
  onEnableAudio,
  onViewModeChange,
  onFavoritesOnlyChange,
  onMyOrdersOnlyChange,
}: KitchenTopBarProps) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <KitchenLogo />
            <span className={cn("truncate text-sm md:text-base", kitchenLogoStoreClassName)}>
              {storeName}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {KITCHEN_BOARD_SCOPE_LABEL}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <KitchenStatsPill stats={stats} />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <StaffLiveControls
          connected={connected}
          audioEnabled={audioEnabled}
          onEnableAudio={onEnableAudio}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              aria-label="Grid view"
              className={cn(
                "inline-flex items-center justify-center rounded-md px-2.5 py-1.5 transition",
                viewMode === "grid"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              aria-label="List view"
              className={cn(
                "inline-flex items-center justify-center rounded-md px-2.5 py-1.5 transition",
                viewMode === "list"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="size-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition",
              favoritesOnly
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            <Star className={cn("size-4", favoritesOnly && "fill-current")} />
            Favorites
          </button>

          {showMyOrdersFilter ? (
            <button
              type="button"
              onClick={() => onMyOrdersOnlyChange(!myOrdersOnly)}
              className={cn(
                "inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition",
                myOrdersOnly
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              My orders
            </button>
          ) : null}

          <ThemeToggle />

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Refresh
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            {fullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
            {fullscreen ? "Exit" : "Full screen"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          <WifiOff className="size-4 shrink-0" />
          {error}
        </div>
      ) : null}
    </header>
  );
}
