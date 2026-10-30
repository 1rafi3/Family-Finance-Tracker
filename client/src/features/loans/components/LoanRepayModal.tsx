import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { Loan } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface LoanRepayModalProps {
  isOpen: boolean
  onClose: () => void
  loan: Loan | null
  onRepay: (data: { id: string; repaymentAmount: number; currentBalance: number }) => Promise<void>
  isSubmitting: boolean
  currency?: string
}

export function LoanRepayModal({
  isOpen,
  onClose,
  loan,
  onRepay,
  isSubmitting,
  currency = 'BDT',
}: LoanRepayModalProps) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  if (!loan) return null

  const principal = parseFloat(loan.principal) || 0
  const remaining = parseFloat(loan.remainingBalance) || 0
  const isLent = loan.direction === 'LENT'

  const enteredAmount = parseFloat(amount) || 0
  const newBalance = Math.max(0, remaining - enteredAmount)
  const isFullRepay = enteredAmount >= remaining && remaining > 0

  const handleQuickAdd = (amt: number) => {
    const safeAmount = Math.min(amt, remaining)
    setAmount(String(safeAmount))
    setError('')
  }

  const handleFullRepay = () => {
    setAmount(String(remaining))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enteredAmount <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }

    await onRepay({
      id: loan.id,
      repaymentAmount: enteredAmount,
      currentBalance: remaining,
    })

    setAmount('')
    setError('')
    onClose()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isLent ? 'Record Collection (টাকা গ্রহণ)' : 'Record Payment (টাকা পরিশোধ)'}
      description={`${loan.counterpartyName} (${isLent ? 'Lent to them' : 'Borrowed from them'})`}
    >
      <div className="space-y-4">
        {/* Current Standing Card */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Outstanding Balance:</span>
            <span
              className={cn(
                'font-mono font-bold',
                isLent ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
              )}
            >
              {currency} {remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Original Principal:</span>
            <span className="font-mono font-medium text-foreground">
              {currency} {principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground">
              {isLent ? 'Amount Collected (গৃহীত টাকা)' : 'Amount Paid (পরিশোধিত টাকা)'}{' '}
              <span className="text-destructive">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                {currency}
              </span>
              <Input
                type="number"
                step="0.01"
                min="1"
                max={remaining}
                autoFocus
                placeholder={String(remaining)}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setError('')
                }}
                className="pl-12 font-mono text-lg font-semibold"
              />
            </div>
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>

          {/* Quick Buttons */}
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Shortcuts:
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <button
                type="button"
                onClick={handleFullRepay}
                className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
              >
                Pay Full (BDT {remaining.toLocaleString()})
              </button>
              {[1000, 2000, 5000, 10000].filter((amt) => amt < remaining).map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAdd(amt)}
                  className="rounded-lg border border-border/80 bg-card px-2.5 py-1.5 text-xs font-mono text-muted-foreground transition-all hover:border-primary hover:text-foreground"
                >
                  ৳{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Preview State */}
          {enteredAmount > 0 && (
            <div
              className={cn(
                'rounded-lg p-3 text-xs border transition-all animate-in fade-in',
                isFullRepay
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'border-border/80 bg-card text-foreground',
              )}
            >
              <div className="flex items-center justify-between font-medium">
                <span>Remaining after payment:</span>
                <span className="font-mono font-bold text-sm">
                  {currency} {newBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              {isFullRepay && (
                <div className="mt-1.5 flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  This debt will be marked as Fully Settled! 🎉
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || enteredAmount <= 0}
              className={cn(
                'font-semibold px-4 text-white',
                isLent ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700',
              )}
            >
              {isSubmitting ? 'Recording...' : 'Confirm Payment (নিশ্চিত করুন)'}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}
