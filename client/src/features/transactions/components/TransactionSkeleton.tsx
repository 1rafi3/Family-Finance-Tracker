import { Skeleton } from '@/components/ui/skeleton'

export function TransactionSkeletonRow() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  )
}

export function TransactionSkeletonList() {
  return (
    <div className="rounded-lg border border-border bg-card divide-y divide-border">
      <TransactionSkeletonRow />
      <TransactionSkeletonRow />
      <TransactionSkeletonRow />
      <TransactionSkeletonRow />
      <TransactionSkeletonRow />
    </div>
  )
}
