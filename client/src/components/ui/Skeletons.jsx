export function LoadingSkeleton({ className = '', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-surface-200 dark:bg-surface-700 rounded-lg ${className}`}
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4" />
        <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 bg-surface-200 dark:bg-surface-700 rounded-full" />
          <div className="h-6 w-20 bg-surface-200 dark:bg-surface-700 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4 p-4">
          <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded flex-1" />
          <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-24" />
          <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-20" />
          <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-24 mb-3" />
            <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 h-72 animate-pulse">
          <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-32 mb-4" />
          <div className="h-full bg-surface-200 dark:bg-surface-700 rounded" />
        </div>
        <div className="card p-6 h-72 animate-pulse">
          <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-32 mb-4" />
          <div className="h-full bg-surface-200 dark:bg-surface-700 rounded" />
        </div>
      </div>
    </div>
  );
}
