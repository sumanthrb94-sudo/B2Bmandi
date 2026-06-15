export default function Loading() {
  return (
    <div className="px-4 py-4">
      {/* search skeleton */}
      <div className="mb-3 h-10 w-full animate-pulse rounded-xl bg-gray-200" />
      {/* chip skeletons */}
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-gray-200" />
        ))}
      </div>
      {/* product grid skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
          >
            <div className="aspect-square animate-pulse bg-gray-200" />
            <div className="space-y-2 p-2.5">
              <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
