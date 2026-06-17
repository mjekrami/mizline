import { KitchenBoard } from "@/components/kitchen-board";
import { StaffSetupNotice } from "@/components/staff-setup-notice";
import { STAFF_SETUP_MESSAGES } from "@/constants/staff-setup";
import { redirectIfUnauthorizedStaffSection } from "@/lib/auth/staff-section";
import { getServerAccessToken } from "@/lib/auth/server";
import { loadKitchenBoardData } from "@/lib/kitchen/board";
import { getStaffStoreId, hasKitchenDevToken } from "@/lib/auth/constants";

interface KitchenPageProps {
  params: Promise<{ path: string }>;
}

export default async function KitchenDashboardPage({ params }: KitchenPageProps) {
  const { path } = await params;
  await redirectIfUnauthorizedStaffSection(path, "kitchen");

  const storeId = getStaffStoreId();

  if (!storeId) {
    return (
      <StaffSetupNotice
        title="Kitchen Dashboard"
        message={STAFF_SETUP_MESSAGES.missingStoreId}
      />
    );
  }

  const accessToken = await getServerAccessToken();
  if (!accessToken && !hasKitchenDevToken()) {
    return (
      <StaffSetupNotice
        title="Kitchen Dashboard"
        message="Sign in to access the kitchen display."
      />
    );
  }

  try {
    const { store, orders } = await loadKitchenBoardData(storeId);

    return (
      <KitchenBoard
        store={store}
        storeId={storeId}
        initialOrders={orders}
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
