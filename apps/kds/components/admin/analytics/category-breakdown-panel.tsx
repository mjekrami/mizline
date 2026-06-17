"use client";

import type { SalesAnalyticsCategoryShare } from "@mizline/shared";
import { formatPrice } from "@mizline/shared";
import { useRef } from "react";
import { CategoryBreakdownDialog } from "@/components/admin/analytics/category-breakdown-dialog";
import { AnalyticsDonutChart } from "@/components/admin/analytics/analytics-donut-chart";
import {
  AnalyticsSectionCard,
  AnalyticsSectionLink,
  AnalyticsSectionSelect,
} from "@/components/admin/analytics/analytics-section-card";
import type { DialogHandle } from "@/components/ui/dialog";
import { ANALYTICS_SEGMENT_COLORS } from "@/lib/admin/analytics-chart";

interface CategoryBreakdownPanelProps {
  categories: SalesAnalyticsCategoryShare[];
}

export function CategoryBreakdownPanel({ categories }: CategoryBreakdownPanelProps) {
  const dialogRef = useRef<DialogHandle>(null);
  const previewCategories = categories.slice(0, 4);
  const donutData = previewCategories.map((category) => ({
    key: category.categoryName,
    value: category.percentage,
  }));

  return (
    <>
      <AnalyticsSectionCard
        title="Sales by Category"
        action={<AnalyticsSectionSelect label="By sales" />}
        footer={
          <AnalyticsSectionLink
            label="View full breakdown →"
            onClick={() => dialogRef.current?.showModal()}
          />
        }
      >
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <AnalyticsDonutChart
            data={donutData}
            emptyLabel="No sales"
            className="size-36"
          />

          <ul className="min-w-0 flex-1 space-y-3">
            {previewCategories.length > 0 ? (
              previewCategories.map((category, index) => (
                <li key={category.categoryName} className="flex items-start justify-between gap-3">
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          ANALYTICS_SEGMENT_COLORS[
                            index % ANALYTICS_SEGMENT_COLORS.length
                          ],
                      }}
                    />
                    <span className="truncate text-sm font-medium">
                      {category.categoryName}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-sm">
                    <span className="font-semibold">{category.percentage}%</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {formatPrice(category.revenueCents)}
                    </span>
                  </span>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">No category data yet</li>
            )}
          </ul>
        </div>
      </AnalyticsSectionCard>

      <CategoryBreakdownDialog ref={dialogRef} categories={categories} />
    </>
  );
}
