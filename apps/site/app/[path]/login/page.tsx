import type { AuthUser, LoginRequest } from "@mizline/shared";
import { canAccessAdmin, canAccessKitchen } from "@mizline/shared";
import { LoginForm } from "@/components/login-form";
import { StaffSetupNotice } from "@/components/staff-setup-notice";
import { getServerAuthUser } from "@/lib/auth-server";
import { getConfiguredStoreId } from "@/lib/api-server";
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
    const destination = resolvePostLoginPath(user, path, next);
    redirect(destination);
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

  return (
    <LoginForm
      staffPath={path}
      nextPath={next ?? `/${path}/kitchen`}
    />
  );
}

function resolvePostLoginPath(
  user: AuthUser,
  staffPath: string,
  next?: string,
): string {
  if (next?.startsWith(`/${staffPath}/`)) {
    if (next.includes("/admin") && !canAccessAdmin(user.role)) {
      return `/${staffPath}/kitchen`;
    }
    if (next.includes("/kitchen") && !canAccessKitchen(user.role)) {
      return `/${staffPath}/admin`;
    }
    return next;
  }

  return canAccessAdmin(user.role)
    ? `/${staffPath}/admin`
    : `/${staffPath}/kitchen`;
}
