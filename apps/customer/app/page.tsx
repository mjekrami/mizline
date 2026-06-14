import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <div className="flex max-w-md flex-col gap-2 text-center">
        <p className="text-sm font-medium text-muted-foreground">Customer PWA</p>
        <h1 className="text-3xl font-semibold tracking-tight">Mizline</h1>
        <p className="text-muted-foreground">
          Scan a table QR code to browse the menu and place orders.
        </p>
      </div>
      <Link
        href="/store/demo-store/table/demo-table"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Open demo table
      </Link>
    </main>
  );
}
