import { Skeleton } from "@/components/ui/skeleton";

export default function IdolDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Back link */}
      <Skeleton className="mb-4 h-4 w-36" />

      {/* Idol header */}
      <div className="mb-6 flex items-start gap-6">
        <Skeleton className="h-28 w-28 flex-shrink-0 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-8 w-36 rounded-md" />
        </div>
      </div>

      <Skeleton className="mb-6 h-px w-full" />

      {/* News placeholder */}
      <Skeleton className="mb-4 h-5 w-52" />
      <Skeleton className="h-24 w-full rounded-lg" />

      <Skeleton className="my-6 h-px w-full" />

      {/* Other members */}
      <Skeleton className="mb-4 h-5 w-40" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
