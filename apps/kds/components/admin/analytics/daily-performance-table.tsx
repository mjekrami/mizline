import type { AnalyticsDailySnapshot } from "@mizline/shared";
import { formatPrice } from "@mizline/shared";
import { AnalyticsSectionCard } from "@/components/admin/analytics/analytics-section-card";
import { formatShortDate } from "@/lib/admin/analytics-format";

interface DailyPerformanceTableProps {
  dailySales: AnalyticsDailySnapshot[];
  totals: {
    orderCount: number;
    revenueCents: number;
    averageTicketCents: number | null;
    itemsSold: number;
  };
}

export function DailyPerformanceTable({
  dailySales,
  totals,
}: DailyPerformanceTableProps) {
  const rows = [...dailySales].reverse();

  return (
    <AnalyticsSectionCard title="Recent Orders Performance">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 text-muted-foreground">
              <th className="pb-3 pr-4 font-medium">Date</th>
              <th className="pb-3 pr-4 font-medium">Orders</th>
              <th className="pb-3 pr-4 font-medium">Sales</th>
              <th className="pb-3 pr-4 font-medium">Avg. Order Value</th>
              <th className="pb-3 font-medium">Items Sold</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.date} className="border-b border-border/40">
                <td className="py-3 pr-4 font-medium">{formatShortDate(row.date, true)}</td>
                <td className="py-3 pr-4">{row.orderCount}</td>
                <td className="py-3 pr-4">{formatPrice(row.revenueCents)}</td>
                <td className="py-3 pr-4">
                  {row.averageTicketCents != null
                    ? formatPrice(row.averageTicketCents)
                    : "—"}
                </td>
                <td className="py-3">{row.itemsSold}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="pt-4 pr-4">Total</td>
              <td className="pt-4 pr-4">{totals.orderCount}</td>
              <td className="pt-4 pr-4">{formatPrice(totals.revenueCents)}</td>
              <td className="pt-4 pr-4">
                {totals.averageTicketCents != null
                  ? formatPrice(totals.averageTicketCents)
                  : "—"}
              </td>
              <td className="pt-4">{totals.itemsSold}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </AnalyticsSectionCard>
  );
}
