import { Edit2, Archive, Tag } from 'lucide-react'
import type { CategoryType } from '@family-finance/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getCategoryIcon } from '../categories.constants'

export interface CategoryCardProps {
  id: string
  name: string
  type: CategoryType
  icon?: string
  color?: string
  description?: string
  parentName?: string
  isSubCategory?: boolean
  isArchived?: boolean
  isSystem?: boolean
  onEdit: () => void
  onArchive: () => void
}

export function CategoryCard({
  name,
  type,
  icon,
  color = '#64748b',
  description,
  parentName,
  isSubCategory = false,
  isArchived = false,
  isSystem = false,
  onEdit,
  onArchive,
}: CategoryCardProps) {
  const Icon = getCategoryIcon(icon)

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md border-border/70">
      {/* Accent top border strip */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      <CardContent className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Icon Container */}
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
            style={{ backgroundColor: `${color}18`, color }}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Details */}
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold tracking-tight text-foreground truncate" title={name}>
                {name}
              </h4>
              {isSubCategory ? (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                  <Tag className="h-2.5 w-2.5 mr-1" />
                  Sub
                </Badge>
              ) : null}
            </div>

            {parentName ? (
              <p className="text-[11px] font-medium text-muted-foreground truncate">
                Parent: <span className="text-foreground/80">{parentName}</span>
              </p>
            ) : null}

            {description ? (
              <p className="text-xs text-muted-foreground/80 line-clamp-1" title={description}>
                {description}
              </p>
            ) : null}

            <div className="flex items-center gap-1.5 pt-1">
              <Badge
                variant={type === 'INCOME' ? 'success' : 'destructive'}
                className="text-[10px] py-0 px-1.5 uppercase font-medium"
              >
                {type}
              </Badge>
              {isArchived ? (
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                  Archived
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-success border-success/30">
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onEdit}
            title="Edit Category"
            aria-label="Edit Category"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>

          {!isSystem && !isArchived ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onArchive}
              title="Archive Category"
              aria-label="Archive Category"
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
