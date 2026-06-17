import { TableOrdering } from "@/components/table-ordering";
import { parseCustomerTab } from "@/lib/customer-tabs";
import {
  getMenu,
  getPopularProducts,
  getStore,
  getTable,
} from "@/lib/api/customer";
import { notFound } from "next/navigation";

type TablePageProps = {
  params: Promise<{
    storeId: string;
    tableId: string;
  }>;
  searchParams: Promise<{
    tab?: string;
  }>;
};

export default async function TablePage({ params, searchParams }: TablePageProps) {
  const { storeId, tableId } = await params;
  const { tab: tabParam } = await searchParams;

  let store;
  let menu;
  let popularProducts;
  let table;

  try {
    [store, menu, popularProducts, table] = await Promise.all([
      getStore(storeId),
      getMenu(storeId),
      getPopularProducts(storeId),
      getTable(storeId, tableId),
    ]);
  } catch {
    notFound();
  }

  return (
    <main>
      <TableOrdering
        store={store}
        menu={menu}
        popularProducts={popularProducts}
        tableId={tableId}
        tableName={table.name}
        tab={parseCustomerTab(tabParam)}
      />
    </main>
  );
}
