import { Skeleton } from "@/components/ui/skeleton";

export default function RankingsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="mb-4 h-6 w-32" />
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="mb-4 h-6 w-32" />
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
