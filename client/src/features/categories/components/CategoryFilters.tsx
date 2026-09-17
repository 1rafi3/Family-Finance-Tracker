import { Search, Plus, Filter } from 'lucide-react'
import type { CategoryType } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface CategoryFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  selectedType: CategoryType | 'ALL'
  onTypeChange: (type: CategoryType | 'ALL') => void
  showArchived: boolean
  onShowArchivedChange: (show: boolean) => void
  onAddSuperCategory: () => void
  onAddSubCategory: () => void
}

export function CategoryFilters({
  search,
  onSearchChange,
  selectedType,
  onTypeChange,
  showArchived,
  onShowArchivedChange,
  onAddSuperCategory,
  onAddSubCategory,
}: CategoryFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search categories or subcategories..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 border-border/60"
        />
      </div>

      {/* Tabs & Status */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type selector pill */}
        <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5">
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onTypeChange(type)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-all duration-150',
                selectedType === type
                  ? 'bg-background text-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {type === 'ALL' ? 'All Types' : type === 'INCOME' ? 'Income' : 'Expense'}
            </button>
          ))}
        </div>

        {/* Status Toggle */}
        <button
          type="button"
          onClick={() => onShowArchivedChange(!showArchived)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150',
            showArchived
              ? 'border-primary/50 bg-primary/10 text-primary'
              : 'border-border/60 text-muted-foreground hover:bg-muted/60',
          )}
        >
          <Filter className="h-3 w-3" />
          <span>{showArchived ? 'Showing Archived' : 'Active Only'}</span>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onAddSuperCategory} className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            <span>New Main Category</span>
          </Button>

          <Button size="sm" onClick={onAddSubCategory} className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            <span>New Subcategory</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
