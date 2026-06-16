import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="flex min-h-full">
      <aside className="hidden w-56 shrink-0 border-r border-border p-4 lg:block">
        <Skeleton className="mb-6 h-8 w-full" />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="mb-2 h-12 w-full rounded-lg" />
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border p-6">
          <Skeleton className="mb-4 h-8 w-48" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-lg" />
            ))}
          </div>
        </header>
        <main className="flex-1 p-6">
          <div className="grid gap-4 xl:grid-cols-12">
            <Skeleton className="h-80 rounded-lg xl:col-span-3" />
            <div className="flex flex-col gap-4 xl:col-span-9">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-64 rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
