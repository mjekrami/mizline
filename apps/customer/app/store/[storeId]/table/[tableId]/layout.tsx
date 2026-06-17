import { CustomerTableShell } from "@/components/customer/table-shell";
import type { ReactNode } from "react";

type CustomerTableLayoutProps = {
  children: ReactNode;
  params: Promise<{
    storeId: string;
    tableId: string;
  }>;
};

export default async function CustomerTableLayout({
  children,
  params,
}: CustomerTableLayoutProps) {
  const { storeId, tableId } = await params;

  return (
    <CustomerTableShell storeId={storeId} tableId={tableId}>
      {children}
    </CustomerTableShell>
  );
}
