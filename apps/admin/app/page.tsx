export default function AdminDashboardPage() {
  return (
    <main className="flex min-h-full flex-col gap-6 p-8">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">
          Admin Dashboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Store management
        </h1>
        <p className="text-muted-foreground">
          JWT-protected CRUD for products, categories, tables, and staff will
          live here.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Products", "Categories", "Tables"].map((section) => (
          <section
            key={section}
            className="rounded-lg border border-border bg-card p-6"
          >
            <h2 className="font-medium">{section}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Placeholder module.
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
