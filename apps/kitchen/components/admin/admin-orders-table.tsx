import type { Order } from "@mizline/shared";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { formatOrderNumber, formatPrice } from "@/lib/format";

interface AdminOrdersTableProps {
  orders: Order[];
  limit?: number;
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function AdminOrdersTable({ orders, limit = 8 }: AdminOrdersTableProps) {
  const recentOrders = [...orders]
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    )
    .slice(0, limit);

  return (
    <section className="admin-panel overflow-hidden">
      <header className="border-b border-border/60 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Recent orders
        </p>
        <p className="text-sm text-foreground">Latest table activity</p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="border-b border-border/60 bg-muted/20 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Order</th>
              <th className="px-4 py-2 font-medium">Table</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Items</th>
              <th className="px-4 py-2 font-medium">Total</th>
              <th className="px-4 py-2 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No orders yet today.
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border/40 last:border-b-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-2.5 font-mono text-xs font-medium">
                    #{formatOrderNumber(order.id)}
                  </td>
                  <td className="px-4 py-2.5">{order.tableName}</td>
                  <td className="px-4 py-2.5">
                    <AdminStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {order.items.length}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {formatTime(order.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
