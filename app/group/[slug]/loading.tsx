import { Skeleton } from "@/components/ui/skeleton";

export default function GroupDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Back link */}
      <Skeleton className="mb-4 h-4 w-28" />

      {/* Group header */}
      <div className="mb-6 flex items-start gap-6">
        <Skeleton className="h-24 w-24 flex-shrink-0 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-80" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
      </div>

      <Skeleton className="mb-6 h-px w-full" />

      {/* Members grid */}
      <Skeleton className="mb-4 h-5 w-36" />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
