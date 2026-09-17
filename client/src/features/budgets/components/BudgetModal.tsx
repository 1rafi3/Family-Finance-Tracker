import React, { useEffect, useState } from 'react'
import { FolderTree, User } from 'lucide-react'
import type { BudgetCreateInput, BudgetWithAnalytics } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useCategories } from '@/features/categories/useCategories'
import { usePeople } from '@/features/people/usePeople'

interface BudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: BudgetCreateInput) => Promise<void>
  budgetToEdit?: BudgetWithAnalytics | null
  activeYear: number
  activeMonth: number
  isSubmitting?: boolean
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function BudgetModal({
  isOpen,
  onClose,
  onSubmit,
  budgetToEdit,
  activeYear,
  activeMonth,
  isSubmitting = false,
}: BudgetModalProps) {
  const { people } = usePeople()
  const { superCategories, subCategories } = useCategories()

  // Form states
  const [targetType, setTargetType] = useState<'CATEGORY' | 'PERSON'>('CATEGORY')
  const [superCategoryId, setSuperCategoryId] = useState<string>('')
  const [subCategoryId, setSubCategoryId] = useState<string>('')
  const [personId, setPersonId] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [periodYear, setPeriodYear] = useState<number>(activeYear)
  const [periodMonth, setPeriodMonth] = useState<number>(activeMonth)
  const [error, setError] = useState<string | null>(null)

  // Expense super categories
  const expenseSuperCategories = superCategories.filter((c) => c.type === 'EXPENSE')

  // Filter subcategories based on selected supercategory
  const filteredSubCategories = subCategories.filter(
    (s) => !superCategoryId || s.superCategoryId === superCategoryId,
  )

  useEffect(() => {
    if (budgetToEdit) {
      setTargetType(budgetToEdit.targetType)
      setSuperCategoryId(budgetToEdit.superCategoryId || '')
      setSubCategoryId(budgetToEdit.subCategoryId || '')
      setPersonId(budgetToEdit.personId || '')
      setName(budgetToEdit.name || '')
      setAmount(budgetToEdit.amount)
      setPeriodYear(budgetToEdit.periodYear)
      setPeriodMonth(budgetToEdit.periodMonth || activeMonth)
    } else {
      setTargetType('CATEGORY')
      setSuperCategoryId(expenseSuperCategories[0]?.id || '')
      setSubCategoryId('')
      setPersonId(people[0]?.id || '')
      setName('')
      setAmount('')
      setPeriodYear(activeYear)
      setPeriodMonth(activeMonth)
    }
    setError(null)
  }, [budgetToEdit, isOpen, activeYear, activeMonth, superCategories.length, people.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid spending limit greater than 0.')
      return
    }

    if (targetType === 'CATEGORY' && !superCategoryId && !subCategoryId) {
      setError('Please select an expense category for this budget.')
      return
    }

    if (targetType === 'PERSON' && !personId) {
      setError('Please select a person / dependent for this allowance.')
      return
    }

    const payload: BudgetCreateInput = {
      targetType,
      amount: parsedAmount.toFixed(2),
      currency: 'BDT',
      period: 'MONTHLY' as any,
      periodYear,
      periodMonth,
      name: name.trim() || undefined,
      superCategoryId: targetType === 'CATEGORY' ? superCategoryId || undefined : undefined,
      subCategoryId: targetType === 'CATEGORY' ? subCategoryId || undefined : undefined,
      personId: targetType === 'PERSON' ? personId || undefined : undefined,
    }

    try {
      await onSubmit(payload)
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to save budget. Please try again.')
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={budgetToEdit ? 'Edit Budget Limit' : 'Create Budget or Allowance'}
      description="Establish monthly spending caps for categories or allowance targets for dependents."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20 font-medium">
            {error}
          </div>
        )}

        {/* Target Type Selector Tabs */}
        {!budgetToEdit && (
          <div className="flex rounded-lg bg-muted/60 p-1 border border-border/60">
            <button
              type="button"
              onClick={() => setTargetType('CATEGORY')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition-all ${
                targetType === 'CATEGORY'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FolderTree className="h-3.5 w-3.5" />
              <span>Expense Category</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetType('PERSON')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition-all ${
                targetType === 'PERSON'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Person Allowance</span>
            </button>
          </div>
        )}

        {/* Target Selection: Category */}
        {targetType === 'CATEGORY' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                SuperCategory (Required)
              </label>
              <Select
                value={superCategoryId}
                onChange={(e) => {
                  setSuperCategoryId(e.target.value)
                  setSubCategoryId('')
                }}
                className="w-full"
                required
              >
                <option value="" disabled>Select category...</option>
                {expenseSuperCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Specific SubCategory (Optional granular cap)
              </label>
              <Select
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                className="w-full"
              >
                <option value="">All subcategories in {expenseSuperCategories.find(c => c.id === superCategoryId)?.name || 'category'}</option>
                {filteredSubCategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {/* Target Selection: Person */}
        {targetType === 'PERSON' && (
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Beneficiary / Dependent (Required)
            </label>
            {people.length === 0 ? (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400">
                No active people found. Please add a dependent in the People module first.
              </div>
            ) : (
              <Select
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                className="w-full"
                required
              >
                <option value="" disabled>Select dependent / beneficiary...</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.relationship})
                  </option>
                ))}
              </Select>
            )}
          </div>
        )}

        {/* Spending Limit Amount */}
        <div>
          <label className="text-xs font-medium text-foreground block mb-1.5">
            Monthly Limit / Allowance (BDT)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
              BDT
            </span>
            <Input
              type="number"
              min="1"
              step="any"
              placeholder="e.g. 15000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-12 font-mono font-semibold"
              required
            />
          </div>
        </div>

        {/* Custom Label */}
        <div>
          <label className="text-xs font-medium text-foreground block mb-1.5">
            Custom Title / Notes (Optional)
          </label>
          <Input
            type="text"
            placeholder="e.g. School Books & Coaching Tuition"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Target Period (Month & Year) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">Month</label>
            <Select
              value={String(periodMonth)}
              onChange={(e) => setPeriodMonth(Number(e.target.value))}
              className="w-full"
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">Year</label>
            <Select
              value={String(periodYear)}
              onChange={(e) => setPeriodYear(Number(e.target.value))}
              className="w-full"
            >
              {[activeYear - 1, activeYear, activeYear + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : budgetToEdit ? 'Update Limit' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
