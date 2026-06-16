import { Skeleton } from "@/components/ui/skeleton";

export default function KitchenLoading() {
  return (
    <main className="flex min-h-full flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-lg" />
        ))}
      </div>

      <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-lg border border-border p-3"
          >
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        ))}
      </div>
    </main>
  );
}
