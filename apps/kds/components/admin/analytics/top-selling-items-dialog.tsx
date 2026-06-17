"use client";

import type { AnalyticsTopSellingItem } from "@mizline/shared";
import { formatPrice } from "@mizline/shared";
import { Coffee } from "lucide-react";
import { forwardRef } from "react";
import { Dialog, type DialogHandle } from "@/components/ui/dialog";

interface TopSellingItemsDialogProps {
  items: AnalyticsTopSellingItem[];
}

export const TopSellingItemsDialog = forwardRef<
  DialogHandle,
  TopSellingItemsDialogProps
>(function TopSellingItemsDialog({ items }, ref) {
  const totalRevenue = items.reduce((sum, item) => sum + item.revenueCents, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantitySold, 0);

  return (
    <Dialog
      ref={ref}
      title="Top Selling Items"
      description="All items sold in the selected date range, ranked by quantity."
      className="w-[min(100%-2rem,42rem)]"
    >
      {items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">#</th>
                <th className="pb-3 pr-4 font-medium">Item</th>
                <th className="pb-3 pr-4 font-medium">Sold</th>
                <th className="pb-3 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.productId} className="border-b border-border/40">
                  <td className="py-3 pr-4 text-muted-foreground">{index + 1}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-2">
                      <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <Coffee className="size-3.5 text-muted-foreground" aria-hidden />
                        )}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-4">{item.quantitySold}</td>
                  <td className="py-3">{formatPrice(item.revenueCents)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td className="pt-4 pr-4" colSpan={2}>
                  Total
                </td>
                <td className="pt-4 pr-4">{totalQuantity}</td>
                <td className="pt-4">{formatPrice(totalRevenue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No item sales in this period.
        </p>
      )}
    </Dialog>
  );
});
