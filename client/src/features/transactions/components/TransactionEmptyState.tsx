import { ArrowLeftRight, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export interface TransactionEmptyStateProps {
  onCreateTransaction?: () => void
  isFiltered?: boolean
  onResetFilters?: () => void
}

export function TransactionEmptyState({
  onCreateTransaction,
  isFiltered,
  onResetFilters,
}: TransactionEmptyStateProps) {
  return (
    <Card className="border-dashed border-2 border-border bg-card/50 p-8 text-center">
      <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ArrowLeftRight className="h-8 w-8" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-lg font-semibold text-foreground">
            {isFiltered ? 'No Matching Transactions' : 'No Transactions Recorded Yet'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isFiltered
              ? 'No transactions matched your filter criteria. Try clearing search or date filters.'
              : 'Start logging your household income, expenses, and transfers.'}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          {isFiltered && onResetFilters ? (
            <Button variant="outline" onClick={onResetFilters}>
              Reset Filters
            </Button>
          ) : null}

          {onCreateTransaction ? (
            <Button onClick={onCreateTransaction}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Add Transaction</span>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
