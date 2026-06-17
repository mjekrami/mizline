"use client";

import type { AnalyticsTopSellingItem } from "@mizline/shared";
import { formatPrice } from "@mizline/shared";
import { Coffee } from "lucide-react";
import { useRef } from "react";
import {
  AnalyticsSectionCard,
  AnalyticsSectionLink,
  AnalyticsSectionSelect,
} from "@/components/admin/analytics/analytics-section-card";
import { TopSellingItemsDialog } from "@/components/admin/analytics/top-selling-items-dialog";
import type { DialogHandle } from "@/components/ui/dialog";

interface TopSellingItemsPanelProps {
  items: AnalyticsTopSellingItem[];
}

export function TopSellingItemsPanel({ items }: TopSellingItemsPanelProps) {
  const dialogRef = useRef<DialogHandle>(null);
  const previewItems = items.slice(0, 5);

  return (
    <>
      <AnalyticsSectionCard
        title="Top Selling Items"
        action={<AnalyticsSectionSelect label="By quantity" />}
        className="h-full"
        footer={
          items.length > 5 ? (
            <AnalyticsSectionLink
              label="View all items →"
              onClick={() => dialogRef.current?.showModal()}
            />
          ) : null
        }
      >
        <ol className="space-y-3">
          {previewItems.length > 0 ? (
            previewItems.map((item, index) => (
              <li
                key={item.productId}
                className="flex items-center gap-3 rounded-md border border-border/60 bg-background/40 px-3 py-2.5"
              >
                <span className="w-4 shrink-0 text-sm font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <Coffee className="size-4 text-muted-foreground" aria-hidden />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.quantitySold} sold
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold">
                  {formatPrice(item.revenueCents)}
                </span>
              </li>
            ))
          ) : (
            <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
              No item sales in this period
            </li>
          )}
        </ol>
      </AnalyticsSectionCard>

      <TopSellingItemsDialog ref={dialogRef} items={items} />
    </>
  );
}
