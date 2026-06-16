import { WaiterBoard } from "@/components/waiter/waiter-board";
import { StaffSetupNotice } from "@/components/staff-setup-notice";
import { STAFF_SETUP_MESSAGES } from "@/constants/staff-setup";
import { redirectIfUnauthorizedStaffSection } from "@/lib/auth/staff-section";
import { getServerAccessToken } from "@/lib/auth/server";
import { loadWaiterBoardData } from "@/lib/waiter/board";
import { getStaffStoreId, hasKitchenDevToken } from "@/lib/auth/constants";

interface WaiterPageProps {
  params: Promise<{ path: string }>;
}

export default async function WaiterDashboardPage({ params }: WaiterPageProps) {
  const { path } = await params;
  await redirectIfUnauthorizedStaffSection(path, "waiter");

  const storeId = getStaffStoreId();

  if (!storeId) {
    return (
      <StaffSetupNotice
        title="Waiter App"
        message={STAFF_SETUP_MESSAGES.missingStoreId}
      />
    );
  }

  const accessToken = await getServerAccessToken();
  if (!accessToken && !hasKitchenDevToken()) {
    return (
      <StaffSetupNotice
        title="Waiter App"
        message="Sign in to access the waiter app."
      />
    );
  }

  try {
    const { store, orders } = await loadWaiterBoardData(storeId);

    return (
      <WaiterBoard store={store} storeId={storeId} initialOrders={orders} />
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : STAFF_SETUP_MESSAGES.kitchenLoadFailed;

    return <StaffSetupNotice title="Waiter App" message={message} />;
  }
}
