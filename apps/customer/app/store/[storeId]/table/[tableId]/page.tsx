import { TableOrdering } from "@/components/table-ordering";
import { getMenu, getStore } from "@/lib/api";
import { notFound } from "next/navigation";

type TablePageProps = {
  params: Promise<{
    storeId: string;
    tableId: string;
  }>;
};

export default async function TablePage({ params }: TablePageProps) {
  const { storeId, tableId } = await params;

  let store;
  let menu;

  try {
    [store, menu] = await Promise.all([
      getStore(storeId),
      getMenu(storeId),
    ]);
  } catch {
    notFound();
  }

  return (
    <main className="flex min-h-full flex-1 flex-col bg-background">
      <TableOrdering store={store} menu={menu} tableId={tableId} />
    </main>
  );
}
