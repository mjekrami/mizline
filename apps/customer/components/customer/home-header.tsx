"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HomeHeaderProps {
  greeting: string;
  title: string;
  subtitle?: string;
  searchOpen: boolean;
  searchQuery: string;
  onSearchToggle: () => void;
  onSearchChange: (value: string) => void;
  trailing?: ReactNode;
}

export function getHomeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function HomeHeader({
  greeting,
  title,
  subtitle,
  searchOpen,
  searchQuery,
  onSearchToggle,
  onSearchChange,
  trailing,
}: HomeHeaderProps) {
  return (
    <header className="flex flex-col gap-4 px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="customer-home-avatar flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground"
            aria-hidden
          >
            {title.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="customer-home-greeting text-sm text-muted-foreground">
              {greeting}
            </p>
            <h1 className="customer-home-title truncate text-lg font-extrabold tracking-tight">
              {title}
            </h1>
            {subtitle ? (
              <p className="customer-home-subtitle truncate text-xs text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {trailing}
          <button
            type="button"
            onClick={onSearchToggle}
            className="customer-icon-btn flex size-11 items-center justify-center rounded-full"
            aria-label={searchOpen ? "Close search" : "Search menu"}
            aria-expanded={searchOpen}
          >
            <Search className="size-5" />
          </button>
        </div>
      </div>

      {searchOpen ? (
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Find your coffee…"
          autoFocus
          className="customer-search w-full rounded-2xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
          aria-label="Search menu"
        />
      ) : null}
    </header>
  );
}

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function SectionHeader({
  title,
  actionLabel = "View All",
  onAction,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
