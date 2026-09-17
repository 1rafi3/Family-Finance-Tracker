import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function WalletSkeleton() {
  return (
    <Card className="flex flex-col justify-between border-border">
      <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </CardHeader>
      <CardContent className="pt-2 pb-4 space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
      <div className="flex items-center justify-end gap-2 border-t border-border p-3">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </Card>
  )
}

export function WalletGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <WalletSkeleton />
      <WalletSkeleton />
      <WalletSkeleton />
    </div>
  )
}
