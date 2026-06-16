"use client";

import type {
  AdminCatalog,
  AdminTable,
  KitchenMetrics,
  Order,
  Store,
} from "@mizline/shared";
import { useCallback, useMemo, useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminOrdersPanel } from "@/components/admin/admin-orders-panel";
import { AdminOverview } from "@/components/admin/admin-overview";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSidebar, type AdminSection } from "@/components/admin/admin-sidebar";
import { CategoriesPanel } from "@/components/admin/categories-panel";
import { ModifiersPanel } from "@/components/admin/modifiers-panel";
import { ProductsPanel } from "@/components/admin/products-panel";
import { ReportsPanel } from "@/components/admin/reports-panel";
import { StaffPanel } from "@/components/admin/staff-panel";
import { TablesPanel } from "@/components/admin/tables-panel";
import { useStoreRealtime } from "@/hooks/use-store-realtime";
import { fetchAdminCatalog, fetchAdminTables } from "@/lib/admin-api";
import { computeAdminStats } from "@/lib/admin-stats";
import { getKitchenMetrics, listStoreOrders } from "@/lib/kitchen-api";

interface AdminDashboardProps {
  store: Store;
  initialCatalog: AdminCatalog;
  initialTables: AdminTable[];
  initialOrders: Order[];
  initialMetrics: KitchenMetrics;
  customerBaseUrl: string;
}

export function AdminDashboard({
  store,
  initialCatalog,
  initialTables,
  initialOrders,
  initialMetrics,
  customerBaseUrl,
}: AdminDashboardProps) {
  const [section, setSection] = useState<AdminSection>("overview");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [catalog, setCatalog] = useState(initialCatalog);
  const [tables, setTables] = useState(initialTables);
  const [orders, setOrders] = useState(initialOrders);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(
    () => computeAdminStats(orders, catalog, tables),
    [orders, catalog, tables],
  );

  const refreshOrdersAndMetrics = useCallback(async () => {
    try {
      const [nextOrders, nextMetrics] = await Promise.all([
        listStoreOrders(),
        getKitchenMetrics(),
      ]);
      setOrders(nextOrders);
      setMetrics(nextMetrics);
    } catch {
      // Realtime refresh failures should not block the dashboard.
    }
  }, []);

  const { connected, audioEnabled, unlockAudio } = useStoreRealtime({
    storeId: store.id,
    onUpdate: () => refreshOrdersAndMetrics(),
  });

  const openOrder = useCallback((orderId: string) => {
    setSelectedOrderId(orderId);
    setSection("orders");
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextCatalog, nextTables, nextOrders, nextMetrics] = await Promise.all([
        fetchAdminCatalog(),
        fetchAdminTables(),
        listStoreOrders(),
        getKitchenMetrics(),
      ]);

      setCatalog(nextCatalog);
      setTables(nextTables);
      setOrders(nextOrders);
      setMetrics(nextMetrics);
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

  return (
    <AdminShell
      sidebar={
        <AdminSidebar
          section={section}
          onSectionChange={setSection}
          counts={{
            orders: stats.activeOrders,
            products: catalog.products.length,
            categories: catalog.categories.length,
            modifiers: catalog.modifierGroups.length,
            tables: tables.length,
          }}
        />
      }
      header={
        <AdminHeader
          store={store}
          stats={stats}
          metrics={metrics}
          loading={loading}
          connected={connected}
          audioEnabled={audioEnabled}
          onEnableAudio={unlockAudio}
          onRefresh={() => void refresh()}
        />
      }
    >
      {error ? (
        <div className="mb-4 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      {section === "overview" ? (
        <AdminOverview
          catalog={catalog}
          tables={tables}
          orders={orders}
          metrics={metrics}
          stats={stats}
          connected={connected}
          onOrderSelect={openOrder}
        />
      ) : null}

      {section === "orders" ? (
        <AdminOrdersPanel
          orders={orders}
          onOrdersChange={setOrders}
          selectedOrderId={selectedOrderId}
          onSelectOrderId={setSelectedOrderId}
        />
      ) : null}

      {section === "products" ? (
        <ProductsPanel
          catalog={catalog}
          onCatalogChange={setCatalog}
          onError={setError}
        />
      ) : null}

      {section === "categories" ? (
        <CategoriesPanel
          categories={catalog.categories}
          onCategoriesChange={(categories) =>
            setCatalog((current) => ({ ...current, categories }))
          }
          onError={setError}
        />
      ) : null}

      {section === "modifiers" ? (
        <ModifiersPanel
          catalog={catalog}
          onCatalogChange={setCatalog}
          onError={setError}
        />
      ) : null}

      {section === "tables" ? (
        <TablesPanel
          storeId={store.id}
          tables={tables}
          customerBaseUrl={customerBaseUrl}
          onTablesChange={setTables}
          onError={setError}
        />
      ) : null}

      {section === "staff" ? <StaffPanel /> : null}

      {section === "reports" ? <ReportsPanel /> : null}
    </AdminShell>
  );
}
