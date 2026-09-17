export function CategorySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-28 rounded-xl border border-border/60 bg-card p-4 space-y-3 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted/60" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-2/3 rounded bg-muted/60" />
              <div className="h-3 w-1/3 rounded bg-muted/40" />
            </div>
          </div>
          <div className="h-4 w-1/2 rounded bg-muted/40" />
        </div>
      ))}
    </div>
  )
}
