export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* stat grid skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-gray-200 bg-white"
          />
        ))}
      </div>
      {/* list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="space-y-2">
              <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
