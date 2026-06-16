import { MyOrdersList } from "@/components/my-orders";
import { ArrowLeft } from "lucide-react";
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
    <main className="flex min-h-full flex-1 flex-col">
      <header className="px-4 py-5">
        <Link
          href={`/store/${storeId}/table/${tableId}`}
          className="customer-nav-link"
        >
          <ArrowLeft className="size-4" />
          Back to menu
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
          My orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Orders placed from this table on this device
        </p>
      </header>

      <MyOrdersList storeId={storeId} tableId={tableId} />
    </main>
  );
}
