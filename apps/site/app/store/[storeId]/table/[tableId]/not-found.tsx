import Link from "next/link";

export default function StoreNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Store not found</h1>
      <p className="max-w-md text-muted-foreground">
        This store ID doesn&apos;t exist in the API. After seeding the database,
        copy the printed store and table IDs into{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          apps/site/.env.local
        </code>{" "}
        and restart the customer dev server.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
      >
        Back to home
      </Link>
    </main>
  );
}
