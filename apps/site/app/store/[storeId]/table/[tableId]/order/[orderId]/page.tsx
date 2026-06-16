import { OrderTracking } from "@/components/order-tracking";
import { getOrder } from "@/lib/api/customer";
import { notFound } from "next/navigation";

type OrderPageProps = {
  params: Promise<{
    storeId: string;
    tableId: string;
    orderId: string;
  }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { storeId, tableId, orderId } = await params;

  let order;

  try {
    order = await getOrder(orderId);
  } catch {
    notFound();
  }

  if (order.storeId !== storeId || order.tableId !== tableId) {
    notFound();
  }

  return (
    <main className="flex min-h-full flex-1 flex-col">
      <OrderTracking
        initialOrder={order}
        storeId={storeId}
        tableId={tableId}
      />
    </main>
  );
}
