import Link from "next/link";

const demoStoreId = process.env.NEXT_PUBLIC_DEMO_STORE_ID;
const demoTableId = process.env.NEXT_PUBLIC_DEMO_TABLE_ID;

export default function Home() {
  const demoHref =
    demoStoreId && demoTableId
      ? `/store/${demoStoreId}/table/${demoTableId}`
      : null;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 pr-20">
      <div className="flex max-w-md flex-col gap-2 text-center">
        <p className="text-sm font-medium text-muted-foreground">Customer PWA</p>
        <h1 className="text-3xl font-semibold tracking-tight">Mizline</h1>
        <p className="text-muted-foreground">
          Scan a table QR code to browse the menu and place orders.
        </p>
      </div>
      {demoHref ? (
        <Link
          href={demoHref}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Open demo table
        </Link>
      ) : (
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Set{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            NEXT_PUBLIC_DEMO_STORE_ID
          </code>{" "}
          and{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            NEXT_PUBLIC_DEMO_TABLE_ID
          </code>{" "}
          after running the API seed, or open{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            /store/&#123;storeId&#125;/table/&#123;tableId&#125;
          </code>
          .
        </p>
      )}
    </main>
  );
}
