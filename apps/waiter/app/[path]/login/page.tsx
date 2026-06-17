import { LoginForm } from "@/components/login-form";
import { StaffSetupNotice } from "@/components/staff-setup-notice";
import { getServerAuthUser } from "@/lib/auth/server";
import {
  canAccessWaiterPath,
  resolvePostLoginPath,
} from "@/lib/auth/post-login-path";
import { getConfiguredStoreId, getStore } from "@/lib/api/server";
import { canAccessWaiter } from "@mizline/shared";
import { isConfiguredStaffPath, staffHref } from "@/lib/waiter-path";
import { notFound, redirect } from "next/navigation";

interface LoginPageProps {
  params: Promise<{ path: string }>;
  searchParams: Promise<{ next?: string }>;
}

export default async function WaiterLoginPage({
  params,
  searchParams,
}: LoginPageProps) {
  const { path } = await params;
  const { next } = await searchParams;

  if (!isConfiguredStaffPath(path)) {
    notFound();
  }

  const user = await getServerAuthUser();

  if (user) {
    const intendedPath = next?.startsWith(`/${path}`) ? next : undefined;

    if (intendedPath && canAccessWaiterPath(user.role, intendedPath)) {
      redirect(intendedPath);
    }

    if (!intendedPath && canAccessWaiter(user.role)) {
      redirect(resolvePostLoginPath(user, path));
    }
  }

  const storeId = getConfiguredStoreId();
  if (!storeId) {
    return (
      <StaffSetupNotice
        title="Waiter Login"
        message="Set NEXT_PUBLIC_KITCHEN_STORE_ID in apps/waiter/.env.local."
      />
    );
  }

  try {
    const store = await getStore(storeId);
    const nextPath = next ?? staffHref(path);

    return (
      <LoginForm
        staffPath={path}
        tenantSlug={store.tenantSlug}
        nextPath={nextPath}
        switchAccount={Boolean(user && !canAccessWaiter(user.role))}
      />
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not load store details. Is the API running?";

    return <StaffSetupNotice title="Waiter Login" message={message} />;
  }
}
