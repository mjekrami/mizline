import { MyOrdersList } from "@/components/my-orders";
import Link from "next/link";

type OrdersPageProps = {
  params: Promise<{
    storeId: string;
    tableId: string;
  }>;
};

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { storeId, tableId } = await params;

  return (
    <main className="flex min-h-full flex-1 flex-col bg-background">
      <header className="border-b border-border px-4 py-4">
        <Link
          href={`/store/${storeId}/table/${tableId}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to menu
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">My orders</h1>
        <p className="text-sm text-muted-foreground">
          Orders placed from this table on this device
        </p>
      </header>

      <MyOrdersList storeId={storeId} tableId={tableId} />
    </main>
  );
}
