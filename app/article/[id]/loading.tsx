import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Back link */}
      <Skeleton className="mb-4 h-4 w-28" />

      {/* Title */}
      <Skeleton className="mb-2 h-8 w-full" />
      <Skeleton className="mb-3 h-8 w-3/4" />

      {/* Meta */}
      <div className="flex gap-3 mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Tags */}
      <div className="flex gap-1.5 mb-4">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      <Skeleton className="mb-6 h-px w-full" />

      {/* Image */}
      <Skeleton className="mb-6 h-64 w-full rounded-lg" />

      {/* Summary */}
      <Skeleton className="mb-6 h-24 w-full rounded-lg" />

      {/* Content lines */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
