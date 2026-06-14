type TablePageProps = {
  params: Promise<{
    storeId: string;
    tableId: string;
  }>;
};

export default async function TablePage({ params }: TablePageProps) {
  const { storeId, tableId } = await params;

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-8">
      <header className="flex flex-col gap-1 border-b border-border pb-4">
        <p className="text-sm text-muted-foreground">Table ordering</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Store {storeId}
        </h1>
        <p className="text-muted-foreground">Table {tableId}</p>
      </header>
      <p className="text-muted-foreground">
        Menu and cart will load here. Cart persists in localStorage; orders
        associate with the table from the URL.
      </p>
    </main>
  );
}
