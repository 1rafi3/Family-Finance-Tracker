import { PRESET_COLORS } from '../categories.constants'
import { cn } from '@/lib/utils'

interface CategoryColorPickerProps {
  value?: string
  onChange: (color: string) => void
}

export function CategoryColorPicker({ value, onChange }: CategoryColorPickerProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Select Color Accent
      </label>
      <div className="flex flex-wrap gap-2 p-2 rounded-lg border border-border/70 bg-background">
        {PRESET_COLORS.map((color) => {
          const isSelected = value === color
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={cn(
                'h-7 w-7 rounded-full transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                isSelected ? 'scale-110 ring-2 ring-primary ring-offset-2' : 'hover:scale-105 opacity-85 hover:opacity-100',
              )}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          )
        })}
      </div>
    </div>
  )
}
