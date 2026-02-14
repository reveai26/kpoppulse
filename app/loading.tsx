import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_260px]">
        {/* Left sidebar skeleton */}
        <aside className="hidden lg:block">
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </aside>

        {/* Center content skeleton */}
        <section className="space-y-4">
          <Skeleton className="h-6 w-48" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </section>

        {/* Right sidebar skeleton */}
        <aside className="hidden lg:block">
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </aside>
      </div>
    </div>
  );
}
