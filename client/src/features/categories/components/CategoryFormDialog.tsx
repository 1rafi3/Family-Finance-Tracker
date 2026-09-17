import { useState, useEffect } from 'react'
import type { CategoryType, SuperCategory } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { CategoryColorPicker } from './CategoryColorPicker'
import { CategoryIconPicker } from './CategoryIconPicker'

export interface CategoryFormData {
  id?: string
  isSubCategory: boolean
  superCategoryId?: string
  name: string
  type: CategoryType
  icon: string
  color: string
  description?: string
}

export interface CategoryFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CategoryFormData) => Promise<void>
  initialData?: Partial<CategoryFormData> | null
  superCategories: SuperCategory[]
  isSubmitting?: boolean
}

export function CategoryFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  superCategories,
  isSubmitting = false,
}: CategoryFormDialogProps) {
  const [isSubCategory, setIsSubCategory] = useState(false)
  const [superCategoryId, setSuperCategoryId] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<CategoryType>('EXPENSE')
  const [icon, setIcon] = useState('folder')
  const [color, setColor] = useState('#3b82f6')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setIsSubCategory(initialData.isSubCategory ?? false)
      setSuperCategoryId(initialData.superCategoryId ?? '')
      setName(initialData.name ?? '')
      setType(initialData.type ?? 'EXPENSE')
      setIcon(initialData.icon ?? 'folder')
      setColor(initialData.color ?? '#3b82f6')
      setDescription(initialData.description ?? '')
    } else {
      setIsSubCategory(false)
      setSuperCategoryId('')
      setName('')
      setType('EXPENSE')
      setIcon('folder')
      setColor('#3b82f6')
      setDescription('')
    }
    setError('')
  }, [initialData, isOpen])

  const filteredParents = superCategories.filter((cat) => cat.type === type && !cat.isArchived)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Category name is required')
      return
    }
    if (isSubCategory && !superCategoryId) {
      setError('Please select a parent main category for this subcategory')
      return
    }

    try {
      setError('')
      await onSubmit({
        id: initialData?.id,
        isSubCategory,
        superCategoryId: isSubCategory ? superCategoryId : undefined,
        name: name.trim(),
        type,
        icon,
        color,
        description: description.trim() || undefined,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save category')
    }
  }

  const dialogTitle = initialData?.id
    ? 'Edit Category'
    : isSubCategory
    ? 'New Subcategory'
    : 'New Main Category'

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={dialogTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive">
            {error}
          </div>
        ) : null}

        {/* Category Level Selector (Only when creating) */}
        {!initialData?.id ? (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSubCategory(false)
                  setIcon('folder')
                }}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  !isSubCategory
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border/70 text-muted-foreground hover:bg-muted'
                }`}
              >
                Main Category
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSubCategory(true)
                  setIcon('tag')
                }}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  isSubCategory
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border/70 text-muted-foreground hover:bg-muted'
                }`}
              >
                Subcategory
              </button>
            </div>
          </div>
        ) : null}

        {/* Type Selector (Income vs Expense) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Taxonomy Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                type === 'INCOME'
                  ? 'border-success bg-success/10 text-success font-semibold'
                  : 'border-border/70 text-muted-foreground hover:bg-muted'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                type === 'EXPENSE'
                  ? 'border-destructive bg-destructive/10 text-destructive font-semibold'
                  : 'border-border/70 text-muted-foreground hover:bg-muted'
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        {/* Parent Category (if Subcategory) */}
        {isSubCategory ? (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Parent Main Category
            </label>
            <select
              value={superCategoryId}
              onChange={(e) => setSuperCategoryId(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select a parent category...</option>
              {filteredParents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name} ({parent.type})
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* Category Name */}
        <Input
          label="Category Name"
          placeholder="e.g., Groceries, Salary, Utilities"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Icon Picker */}
        <CategoryIconPicker value={icon} onChange={setIcon} />

        {/* Color Accent */}
        <CategoryColorPicker value={color} onChange={setColor} />

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description (Optional)
          </label>
          <input
            type="text"
            placeholder="Short notes or purpose..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialData?.id ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
