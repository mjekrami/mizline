import Link from "next/link";
import { getStaffPathPrefix } from "@/lib/site-path";
import { getDemoTablePath } from "@/lib/pwa";

export default function Home() {
  const customerHref = getDemoTablePath();
  const staffLoginHref = `/${getStaffPathPrefix()}/login`;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 pr-20">
      <div className="flex max-w-md flex-col gap-2 text-center">
        <p className="text-sm font-medium text-muted-foreground">Mizline</p>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome</h1>
        <p className="text-muted-foreground">
          Choose how you&apos;re using Mizline today.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        {customerHref ? (
          <Link
            href={customerHref}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Customer
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
            for the customer demo, or open{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              /store/&#123;storeId&#125;/table/&#123;tableId&#125;
            </code>
            .
          </p>
        )}

        <Link
          href={staffLoginHref}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Staff
        </Link>
      </div>
    </main>
  );
}
