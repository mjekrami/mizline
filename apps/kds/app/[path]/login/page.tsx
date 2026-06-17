import { LoginForm } from "@/components/login-form";
import { StaffSetupNotice } from "@/components/staff-setup-notice";
import { getServerAuthUser } from "@/lib/auth/server";
import {
  canAccessStaffPath,
  resolvePostLoginPath,
} from "@/lib/auth/post-login-path";
import { getConfiguredStoreId, getStore } from "@/lib/api/server";
import { staffHref } from "@/lib/staff-path";
import { canAccessAdmin, canAccessKitchen } from "@mizline/shared";
import { redirect } from "next/navigation";

function canAccessStaffSite(role: Parameters<typeof canAccessAdmin>[0]): boolean {
  return canAccessAdmin(role) || canAccessKitchen(role);
}

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
  const loginPath = `/${path}/login`;

  if (user) {
    const intendedPath = next?.startsWith(`/${path}/`) ? next : undefined;

    if (
      intendedPath &&
      intendedPath !== loginPath &&
      canAccessStaffPath(user.role, intendedPath)
    ) {
      redirect(intendedPath);
    }

    if (!intendedPath && canAccessStaffSite(user.role)) {
      const postLoginPath = resolvePostLoginPath(user, path);
      if (postLoginPath !== loginPath) {
        redirect(postLoginPath);
      }
    }
  }

  const storeId = getConfiguredStoreId();
  if (!storeId) {
    return (
      <StaffSetupNotice
        title="Sign in"
        message="Set NEXT_PUBLIC_KITCHEN_STORE_ID in apps/kds/.env.local."
      />
    );
  }

  const store = await getStore(storeId);
  const nextPath = next ?? staffHref("kitchen", path);

  return (
    <LoginForm
      staffPath={path}
      tenantSlug={store.tenantSlug}
      nextPath={nextPath}
      switchAccount={Boolean(user && !canAccessStaffSite(user.role))}
    />
  );
}
