import { KitchenBoard } from "@/components/kitchen-board";
import { ThemeToggle } from "@/components/theme-toggle";
import { listStoreOrders, getStore } from "@/lib/api-server";

function KitchenSetupNotice({ message }: { message: string }) {
  return (
    <main className="flex min-h-full items-center justify-center p-8">
      <div className="relative max-w-lg rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Kitchen Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Setup required
        </h1>
        <p className="mt-3 text-muted-foreground">{message}</p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-xs">
          {`cp apps/kitchen/.env.example apps/kitchen/.env.local
# Set NEXT_PUBLIC_KITCHEN_STORE_ID from prisma db seed output
# Set KITCHEN_DEV_TOKEN to match apps/api/.env`}
        </pre>
      </div>
    </main>
  );
}

export default async function KitchenDashboardPage() {
  const storeId = process.env.NEXT_PUBLIC_KITCHEN_STORE_ID;

  if (!storeId) {
    return (
      <KitchenSetupNotice message="Set NEXT_PUBLIC_KITCHEN_STORE_ID in apps/kitchen/.env.local to the demo store ID printed by prisma db seed." />
    );
  }

  if (!process.env.KITCHEN_DEV_TOKEN) {
    return (
      <KitchenSetupNotice message="Set KITCHEN_DEV_TOKEN in apps/kitchen/.env.local to match apps/api/.env." />
    );
  }

  try {
    const [store, orders] = await Promise.all([
      getStore(storeId),
      listStoreOrders(storeId),
    ]);

    return (
      <KitchenBoard store={store} storeId={storeId} initialOrders={orders} />
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load kitchen board";

    return <KitchenSetupNotice message={message} />;
  }
}
