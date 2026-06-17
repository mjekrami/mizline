"use client";

import type { SalesAnalyticsCategoryShare } from "@mizline/shared";
import { formatPrice } from "@mizline/shared";
import { forwardRef } from "react";
import { Dialog, type DialogHandle } from "@/components/ui/dialog";
import { ANALYTICS_SEGMENT_COLORS } from "@/lib/admin/analytics-chart";

interface CategoryBreakdownDialogProps {
  categories: SalesAnalyticsCategoryShare[];
}

export const CategoryBreakdownDialog = forwardRef<
  DialogHandle,
  CategoryBreakdownDialogProps
>(function CategoryBreakdownDialog({ categories }, ref) {
  const totalRevenue = categories.reduce(
    (sum, category) => sum + category.revenueCents,
    0,
  );

  return (
    <Dialog
      ref={ref}
      title="Sales by Category"
      description="Full category breakdown for the selected date range."
      className="w-[min(100%-2rem,40rem)]"
    >
      {categories.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Category</th>
                <th className="pb-3 pr-4 font-medium">Share</th>
                <th className="pb-3 font-medium">Sales</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.categoryName} className="border-b border-border/40">
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            ANALYTICS_SEGMENT_COLORS[
                              index % ANALYTICS_SEGMENT_COLORS.length
                            ],
                        }}
                      />
                      <span className="font-medium">{category.categoryName}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-4">{category.percentage}%</td>
                  <td className="py-3">{formatPrice(category.revenueCents)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td className="pt-4 pr-4">Total</td>
                <td className="pt-4 pr-4">100%</td>
                <td className="pt-4">{formatPrice(totalRevenue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No category sales in this period.
        </p>
      )}
    </Dialog>
  );
});
