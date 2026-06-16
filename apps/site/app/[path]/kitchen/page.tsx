import { KitchenBoard } from "@/components/kitchen-board";
import { StaffSetupNotice } from "@/components/staff-setup-notice";
import { STAFF_SETUP_MESSAGES } from "@/constants/staff-setup";
import { loadKitchenBoardData } from "@/lib/load-kitchen-board";
import { getStaffStoreId, hasKitchenDevToken } from "@/lib/staff-env";

export default async function KitchenDashboardPage() {
  const storeId = getStaffStoreId();

  if (!storeId) {
    return (
      <StaffSetupNotice
        title="Kitchen Dashboard"
        message={STAFF_SETUP_MESSAGES.missingStoreId}
      />
    );
  }

  if (!hasKitchenDevToken()) {
    return (
      <StaffSetupNotice
        title="Kitchen Dashboard"
        message={STAFF_SETUP_MESSAGES.missingDevToken}
      />
    );
  }

  try {
    const { store, orders, metrics } = await loadKitchenBoardData(storeId);

    return (
      <KitchenBoard
        store={store}
        storeId={storeId}
        initialOrders={orders}
        initialMetrics={metrics}
      />
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : STAFF_SETUP_MESSAGES.kitchenLoadFailed;

    return <StaffSetupNotice title="Kitchen Dashboard" message={message} />;
  }
}
