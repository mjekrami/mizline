import {
  orderStatusLabels,
  type OrderStatus,
} from "@mizline/shared";

const kitchenColumns: OrderStatus[] = [
  "new",
  "preparing",
  "ready",
  "fulfilled",
];

const columnAccent: Record<OrderStatus, string> = {
  new: "border-order-new text-order-new",
  preparing: "border-order-preparing text-order-preparing",
  ready: "border-order-ready text-order-ready",
  fulfilled: "border-order-fulfilled text-order-fulfilled",
  cancelled: "border-order-cancelled text-order-cancelled",
};

export default function KitchenDashboardPage() {
  return (
    <main className="flex min-h-full flex-col gap-6 p-8">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">
          Kitchen Dashboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Order board</h1>
        <p className="text-muted-foreground">
          Real-time KDS columns will connect via Socket.IO.
        </p>
      </header>
      <div className="grid flex-1 gap-4 md:grid-cols-4">
        {kitchenColumns.map((status) => (
          <section
            key={status}
            className={`flex flex-col gap-3 rounded-lg border border-t-4 bg-card p-4 ${columnAccent[status]}`}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              {orderStatusLabels[status]}
            </h2>
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          </section>
        ))}
      </div>
    </main>
  );
}
