"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { BottomTabBar } from "@/components/customer/bottom-tab-bar";
import { CustomerPageTransition } from "@/components/customer/page-transition";
import { resolveCustomerTabFromPath } from "@/lib/customer-tabs";

interface CustomerTableShellProps {
  storeId: string;
  tableId: string;
  children: ReactNode;
}

function CustomerTableShellContent({
  storeId,
  tableId,
  children,
}: CustomerTableShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const transitionKey = `${pathname}?${searchParams.toString()}`;
  const activeTab = resolveCustomerTabFromPath(
    pathname,
    searchParams.get("tab") ?? undefined,
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <CustomerPageTransition
        transitionKey={transitionKey}
        className="flex flex-1 flex-col pb-36"
      >
        {children}
      </CustomerPageTransition>
      <BottomTabBar active={activeTab} storeId={storeId} tableId={tableId} />
    </div>
  );
}

export function CustomerTableShell({
  storeId,
  tableId,
  children,
}: CustomerTableShellProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh flex-col pb-36">{children}</div>
      }
    >
      <CustomerTableShellContent storeId={storeId} tableId={tableId}>
        {children}
      </CustomerTableShellContent>
    </Suspense>
  );
}
