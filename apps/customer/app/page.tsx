import Link from "next/link";
import { getDemoTablePath } from "@/lib/pwa";

export default function Home() {
  const tableHref = getDemoTablePath();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-16">
      <div className="flex max-w-md flex-col gap-2 text-center">
        <p className="text-sm font-medium text-muted-foreground">Mizline</p>
        <h1 className="text-3xl font-semibold tracking-tight">Order at your table</h1>
        <p className="text-muted-foreground">
          Scan the QR code at your table, or use the demo link below.
        </p>
      </div>

      {tableHref ? (
        <Link
          href={tableHref}
          className="customer-btn-primary rounded-lg px-5 py-2.5 text-sm font-medium"
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
          in{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            apps/customer/.env.local
          </code>
          , or open{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            /store/&#123;storeId&#125;/table/&#123;tableId&#125;
          </code>
          .
        </p>
      )}
    </main>
  );
}
