import { FINANCE_ICONS } from '../categories.constants'
import { cn } from '@/lib/utils'

interface CategoryIconPickerProps {
  value?: string
  onChange: (iconName: string) => void
}

export function CategoryIconPicker({ value, onChange }: CategoryIconPickerProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Select Icon
      </label>
      <div className="grid grid-cols-7 gap-1.5 p-2 rounded-lg border border-border/70 bg-background max-h-40 overflow-y-auto">
        {FINANCE_ICONS.map((item) => {
          const Icon = item.icon
          const isSelected = value === item.name
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onChange(item.name)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-150',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary'
                  : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              title={item.label}
              aria-label={item.label}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
