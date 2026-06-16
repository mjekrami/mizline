import Link from "next/link";
import { getStaffPathPrefix } from "@/lib/site-path";

export default function Home() {
  const staffPath = getStaffPathPrefix();
  const staffLoginHref = `/${staffPath}/login`;
  const waiterHref = `/${staffPath}/waiter`;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 pr-20">
      <div className="flex max-w-md flex-col gap-2 text-center">
        <p className="text-sm font-medium text-muted-foreground">Mizline</p>
        <h1 className="text-3xl font-semibold tracking-tight">Staff portal</h1>
        <p className="text-muted-foreground">
          Kitchen display, waiter tools, and store management.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href={waiterHref}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Waiter
        </Link>

        <Link
          href={staffLoginHref}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Staff login
        </Link>
      </div>
    </main>
  );
}
