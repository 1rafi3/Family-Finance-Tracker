import { useState, useEffect } from 'react'
import { PERSON_RELATIONSHIPS } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { PRESET_COLORS } from '@/features/categories/categories.constants'
import { cn } from '@/lib/utils'
import type { PersonWithStats } from '../people.api'

export interface PersonFormData {
  id?: string
  name: string
  relationship: string
  color: string
  notes?: string
}

export interface PersonFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PersonFormData) => Promise<void>
  initialData?: PersonWithStats | null
  isSubmitting?: boolean
}

export function PersonFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}: PersonFormDialogProps) {
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('Child')
  const [color, setColor] = useState('#3b82f6')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setRelationship(initialData.relationship)
      setColor(initialData.color || '#3b82f6')
      setNotes(initialData.notes || '')
    } else {
      setName('')
      setRelationship('Child')
      setColor('#3b82f6')
      setNotes('')
    }
    setError('')
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Person name is required')
      return
    }

    try {
      setError('')
      await onSubmit({
        id: initialData?.id,
        name: name.trim(),
        relationship,
        color,
        notes: notes.trim() || undefined,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save person profile')
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Person Profile' : 'Add Person / Dependent'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {error ? (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive">
            {error}
          </div>
        ) : null}

        {/* Name Field */}
        <Input
          label="Person / Dependent Name"
          placeholder="e.g. Aarav, Father, Sarah"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Relationship Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Relationship / Role
          </label>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {PERSON_RELATIONSHIPS.map((rel) => (
              <option key={rel} value={rel}>
                {rel}
              </option>
            ))}
          </select>
        </div>

        {/* Color Accent Picker */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Avatar Accent Color
          </label>
          <div className="flex flex-wrap gap-2 p-2 rounded-lg border border-border/70 bg-background">
            {PRESET_COLORS.map((c) => {
              const isSelected = color === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-7 w-7 rounded-full transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                    isSelected ? 'scale-110 ring-2 ring-primary ring-offset-2' : 'hover:scale-105 opacity-85 hover:opacity-100',
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Notes / Purpose (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Schooling, Monthly medicine, Pocket allowance"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialData ? 'Save Changes' : 'Create Profile'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
