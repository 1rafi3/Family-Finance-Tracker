import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import type { Loan, LoanCreateInput, LoanDirection, LoanStatus, LoanUpdateInput } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface LoanModalProps {
  isOpen: boolean
  onClose: () => void
  loanToEdit: Loan | null
  onSubmit: (data: LoanCreateInput | LoanUpdateInput) => Promise<void>
  isSubmitting: boolean
  currency?: string
}

export function LoanModal({
  isOpen,
  onClose,
  loanToEdit,
  onSubmit,
  isSubmitting,
  currency = 'BDT',
}: LoanModalProps) {
  const [direction, setDirection] = useState<LoanDirection>('LENT')
  const [counterpartyName, setCounterpartyName] = useState('')
  const [principal, setPrincipal] = useState('')
  const [remainingBalance, setRemainingBalance] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [termMonths, setTermMonths] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<LoanStatus>('ACTIVE')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = Boolean(loanToEdit)

  useEffect(() => {
    if (loanToEdit) {
      setDirection(loanToEdit.direction)
      setCounterpartyName(loanToEdit.counterpartyName)
      setPrincipal(loanToEdit.principal)
      setRemainingBalance(loanToEdit.remainingBalance)
      setDueDate(loanToEdit.dueDate ? loanToEdit.dueDate.slice(0, 10) : '')
      setInterestRate(loanToEdit.interestRate != null ? String(loanToEdit.interestRate) : '')
      setTermMonths(loanToEdit.termMonths != null ? String(loanToEdit.termMonths) : '')
      setNotes(loanToEdit.notes ?? '')
      setStatus(loanToEdit.status)
    } else {
      setDirection('LENT')
      setCounterpartyName('')
      setPrincipal('')
      setRemainingBalance('')
      setDueDate('')
      setInterestRate('')
      setTermMonths('')
      setNotes('')
      setStatus('ACTIVE')
    }
    setErrors({})
  }, [loanToEdit, isOpen])

  const handlePrincipalChange = (val: string) => {
    setPrincipal(val)
    if (!isEditing || !remainingBalance) {
      setRemainingBalance(val)
    }
    if (errors.principal) setErrors((prev) => ({ ...prev, principal: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!counterpartyName.trim()) newErrors.counterpartyName = 'Please enter counterparty name'
    const princVal = parseFloat(principal)
    if (isNaN(princVal) || princVal <= 0) {
      newErrors.principal = 'Principal amount must be greater than 0'
    }

    const remVal = remainingBalance.trim() ? parseFloat(remainingBalance) : princVal
    if (isNaN(remVal) || remVal < 0) {
      newErrors.remainingBalance = 'Remaining balance cannot be negative'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload: LoanCreateInput | LoanUpdateInput = {
      direction,
      counterpartyName: counterpartyName.trim(),
      principal: princVal.toFixed(2),
      remainingBalance: remVal.toFixed(2),
      currency,
      dueDate: dueDate ? `${dueDate}T00:00:00.000Z` : undefined,
      interestRate: interestRate.trim() ? parseFloat(interestRate) : undefined,
      termMonths: termMonths.trim() ? parseInt(termMonths, 10) : undefined,
      notes: notes.trim() || undefined,
      status: remVal <= 0 ? 'PAID' : status,
    }

    await onSubmit(payload)
    onClose()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Debt Record' : 'Record Loan or Debt (ধার ও ঋণ)'}
      description="Track personal loans lent to relatives or borrowed liabilities"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Direction Selector Tabs */}
        <div>
          <label className="text-xs font-semibold text-foreground">
            Loan Type (লেনদেনের ধরন) <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            <button
              type="button"
              onClick={() => setDirection('LENT')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all',
                direction === 'LENT'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'border-border/80 bg-card text-muted-foreground hover:bg-muted/40',
              )}
            >
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              <div className="text-left">
                <div>I Lent Money</div>
                <div className="text-[10px] font-normal opacity-80">আমি ধার দিয়েছি (পাওনা)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDirection('BORROWED')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all',
                direction === 'BORROWED'
                  ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 shadow-xs'
                  : 'border-border/80 bg-card text-muted-foreground hover:bg-muted/40',
              )}
            >
              <ArrowDownLeft className="h-4 w-4 text-rose-600" />
              <div className="text-left">
                <div>I Borrowed Money</div>
                <div className="text-[10px] font-normal opacity-80">আমি ধার নিয়েছি (দেনা)</div>
              </div>
            </button>
          </div>
        </div>

        {/* Counterparty Name */}
        <div>
          <label className="text-xs font-semibold text-foreground">
            {direction === 'LENT' ? 'Who did you lend to? (গ্রহীতার নাম)' : 'Who did you borrow from? (প্রদাতার নাম)'}{' '}
            <span className="text-destructive">*</span>
          </label>
          <Input
            type="text"
            placeholder="e.g. Tanvir Bhai, Cousin Rahim, or City Bank"
            value={counterpartyName}
            onChange={(e) => {
              setCounterpartyName(e.target.value)
              if (errors.counterpartyName) setErrors((prev) => ({ ...prev, counterpartyName: '' }))
            }}
            className="mt-1.5"
          />
          {errors.counterpartyName && (
            <p className="mt-1 text-xs text-destructive">{errors.counterpartyName}</p>
          )}
        </div>

        {/* Amounts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Principal Amount */}
          <div>
            <label className="text-xs font-semibold text-foreground">
              Principal Amount ({currency}) <span className="text-destructive">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                {currency}
              </span>
              <Input
                type="number"
                step="0.01"
                min="1"
                placeholder="25000"
                value={principal}
                onChange={(e) => handlePrincipalChange(e.target.value)}
                className="pl-12 font-mono"
              />
            </div>
            {errors.principal && <p className="mt-1 text-xs text-destructive">{errors.principal}</p>}
          </div>

          {/* Remaining Balance */}
          <div>
            <label className="text-xs font-semibold text-foreground">
              Current Remaining Balance ({currency})
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                {currency}
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="25000"
                value={remainingBalance}
                onChange={(e) => setRemainingBalance(e.target.value)}
                className="pl-12 font-mono"
              />
            </div>
            {errors.remainingBalance && (
              <p className="mt-1 text-xs text-destructive">{errors.remainingBalance}</p>
            )}
          </div>
        </div>

        {/* Due Date & Term */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Repayment Due Date (পরিশোধের শেষ তারিখ)</span>
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Interest Rate % (সুদের হার)</span>
              <span className="text-[11px] font-normal text-muted-foreground">0% for friendly</span>
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="0"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="mt-1.5 font-mono"
            />
          </div>
        </div>

        {/* Lifecycle Status (if editing) */}
        {isEditing && (
          <div>
            <label className="text-xs font-semibold text-foreground">Status (অবস্থা)</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LoanStatus)}
              className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ACTIVE">Active (চলমান)</option>
              <option value="PAID">Paid / Fully Settled (সম্পূর্ণ পরিশোধ 🎉)</option>
              <option value="OVERDUE">Overdue (মেয়াদোত্তীর্ণ)</option>
              <option value="CANCELLED">Cancelled (বাতিল)</option>
            </select>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>Notes / Reason (মন্তব্য বা বিবরণ)</span>
            <span className="text-[11px] font-normal text-muted-foreground">Optional</span>
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Lent for business emergency, will repay in 2 installments"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1.5 flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Record Loan (সংরক্ষণ করুন)'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
