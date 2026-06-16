import { LoginForm } from "@/components/login-form";
import { StaffSetupNotice } from "@/components/staff-setup-notice";
import { getServerAuthUser } from "@/lib/auth/server";
import {
  canAccessStaffPath,
  resolvePostLoginPath,
} from "@/lib/auth/post-login-path";
import { getConfiguredStoreId, getStore } from "@/lib/api/server";
import { redirect } from "next/navigation";

interface LoginPageProps {
  params: Promise<{ path: string }>;
  searchParams: Promise<{ next?: string }>;
}

export default async function StaffLoginPage({
  params,
  searchParams,
}: LoginPageProps) {
  const { path } = await params;
  const { next } = await searchParams;
  const user = await getServerAuthUser();

  if (user) {
    const intendedPath = next?.startsWith(`/${path}/`) ? next : undefined;

    if (intendedPath && canAccessStaffPath(user.role, intendedPath)) {
      redirect(intendedPath);
    }

    if (!intendedPath) {
      redirect(resolvePostLoginPath(user, path));
    }
  }

  const storeId = getConfiguredStoreId();
  if (!storeId) {
    return (
      <StaffSetupNotice
        title="Staff Login"
        message="Set NEXT_PUBLIC_KITCHEN_STORE_ID in apps/site/.env.local."
      />
    );
  }

  const store = await getStore(storeId);
  const nextPath = next ?? `/${path}/waiter`;
  const isWaiterLogin = nextPath.includes("/waiter");

  return (
    <LoginForm
      staffPath={path}
      tenantSlug={store.tenantSlug}
      nextPath={nextPath}
      title={isWaiterLogin ? "Waiter sign in" : "Staff login"}
      description={
        isWaiterLogin
          ? "Sign in with your waiter account to receive orders and table buzzes."
          : "Sign in to access the kitchen display or admin dashboard."
      }
      switchAccount={Boolean(user && isWaiterLogin)}
    />
  );
}
