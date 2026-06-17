"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OrderActivityItem } from "@/components/admin/order-activity-item";
import type { ActivityEntry } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";

interface AdminActivityLogProps {
  entries: ActivityEntry[];
  connected: boolean;
  onOrderSelect?: (orderId: string) => void;
}

export function AdminActivityLog({
  entries,
  connected,
  onOrderSelect,
}: AdminActivityLogProps) {
  const [now, setNow] = useState(() => Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const updateScrollHints = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollHints();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollHints, { passive: true });
    const observer = new ResizeObserver(updateScrollHints);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollHints);
      observer.disconnect();
    };
  }, [entries.length]);

  const scrollBy = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  const latest = entries.slice(0, 20);

  return (
    <section className="admin-panel overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <p className="shrink-0 text-sm font-medium text-foreground">
            Order stream
          </p>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium",
              connected
                ? "border-success/30 bg-success/10 text-success"
                : "border-muted-foreground/30 bg-muted text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                connected ? "animate-pulse bg-success" : "bg-muted-foreground",
              )}
            />
            {connected ? "Live" : "Offline"}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => scrollBy("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll activity left"
            className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy("right")}
            disabled={!canScrollRight}
            aria-label="Scroll activity right"
            className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="relative h-14 px-4 py-2">
        {latest.length === 0 ? (
          <p className="flex h-full items-center text-sm text-muted-foreground">
            No orders yet — activity will scroll here as tables place orders.
          </p>
        ) : (
          <>
            <div
              ref={scrollRef}
              className="flex h-full flex-nowrap items-center gap-2 overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {latest.map((entry) => (
                <OrderActivityItem
                  key={entry.id}
                  entry={entry}
                  now={now}
                  variant="stream"
                  onSelect={onOrderSelect}
                />
              ))}
            </div>
            {canScrollLeft ? (
              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-card to-transparent" />
            ) : null}
            {canScrollRight ? (
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent" />
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
