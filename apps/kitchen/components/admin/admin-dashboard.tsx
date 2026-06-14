"use client";

import type {
  AdminCatalog,
  AdminTable,
  Store,
} from "@mizline/shared";
import { Loader2, RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
import { CategoriesPanel } from "@/components/admin/categories-panel";
import { ProductsPanel } from "@/components/admin/products-panel";
import { TablesPanel } from "@/components/admin/tables-panel";
import { fetchAdminCatalog, fetchAdminTables } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

type AdminTab = "products" | "categories" | "tables";

interface AdminDashboardProps {
  store: Store;
  initialCatalog: AdminCatalog;
  initialTables: AdminTable[];
  customerBaseUrl: string;
}

export function AdminDashboard({
  store,
  initialCatalog,
  initialTables,
  customerBaseUrl,
}: AdminDashboardProps) {
  const [tab, setTab] = useState<AdminTab>("products");
  const [catalog, setCatalog] = useState(initialCatalog);
  const [tables, setTables] = useState(initialTables);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextCatalog, nextTables] = await Promise.all([
        fetchAdminCatalog(),
        fetchAdminTables(),
      ]);
      setCatalog(nextCatalog);
      setTables(nextTables);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Failed to refresh admin data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const tabs: { id: AdminTab; label: string; count?: number }[] = [
    { id: "products", label: "Products", count: catalog.products.length },
    { id: "categories", label: "Categories", count: catalog.categories.length },
    { id: "tables", label: "Tables", count: tables.length },
  ];

  return (
    <main className="flex min-h-full flex-col gap-6 p-4 md:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">
            Admin Dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {store.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage menu items, categories, and table QR codes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Refresh
        </button>
      </header>

      {error ? (
        <div className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === id
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            {count !== undefined ? (
              <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                {count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "products" ? (
        <ProductsPanel
          catalog={catalog}
          onCatalogChange={setCatalog}
          onError={setError}
        />
      ) : null}

      {tab === "categories" ? (
        <CategoriesPanel
          categories={catalog.categories}
          onCategoriesChange={(categories) =>
            setCatalog((current) => ({ ...current, categories }))
          }
          onError={setError}
        />
      ) : null}

      {tab === "tables" ? (
        <TablesPanel
          storeId={store.id}
          tables={tables}
          customerBaseUrl={customerBaseUrl}
          onTablesChange={setTables}
          onError={setError}
        />
      ) : null}
    </main>
  );
}
