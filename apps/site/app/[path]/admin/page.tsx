import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { StaffSetupNotice } from "@/components/staff-setup-notice";
import { STAFF_SETUP_MESSAGES } from "@/constants/staff-setup";
import { getServerAccessToken } from "@/lib/auth/server";
import { loadAdminDashboardData } from "@/lib/admin/load";
import { getCustomerBaseUrl, getStaffStoreId, hasKitchenDevToken } from "@/lib/auth/constants";

export default async function AdminDashboardPage() {
  const storeId = getStaffStoreId();

  if (!storeId) {
    return (
      <StaffSetupNotice
        title="Admin Dashboard"
        message={STAFF_SETUP_MESSAGES.missingStoreId}
      />
    );
  }

  const accessToken = await getServerAccessToken();
  if (!accessToken && !hasKitchenDevToken()) {
    return (
      <StaffSetupNotice
        title="Admin Dashboard"
        message="Sign in with a manager account to access the admin dashboard."
      />
    );
  }

  try {
    const { store, catalog, tables, orders, metrics } =
      await loadAdminDashboardData(storeId);

    return (
      <AdminDashboard
        store={store}
        initialCatalog={catalog}
        initialTables={tables}
        initialOrders={orders}
        initialMetrics={metrics}
        customerBaseUrl={getCustomerBaseUrl()}
      />
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : STAFF_SETUP_MESSAGES.adminLoadFailed;

    return <StaffSetupNotice title="Admin Dashboard" message={message} />;
  }
}
