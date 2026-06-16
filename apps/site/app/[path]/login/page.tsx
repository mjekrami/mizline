import { LoginForm } from "@/components/login-form";
import { StaffSetupNotice } from "@/components/staff-setup-notice";
import { getServerAuthUser } from "@/lib/auth/server";
import { resolvePostLoginPath } from "@/lib/auth/post-login-path";
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
    redirect(resolvePostLoginPath(user, path, next));
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

  return (
    <LoginForm
      staffPath={path}
      tenantSlug={store.tenantSlug}
      nextPath={next ?? `/${path}/waiter`}
    />
  );
}
