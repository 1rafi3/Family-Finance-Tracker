import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import type { SavingsGoal } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SavingsDepositModalProps {
  isOpen: boolean
  onClose: () => void
  goal: SavingsGoal | null
  onDeposit: (data: { id: string; amount: number; currentSaved: number; targetAmount: number }) => Promise<void>
  isSubmitting: boolean
  currency?: string
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000]

export function SavingsDepositModal({
  isOpen,
  onClose,
  goal,
  onDeposit,
  isSubmitting,
  currency = 'BDT',
}: SavingsDepositModalProps) {
  const [depositAmount, setDepositAmount] = useState('')
  const [error, setError] = useState('')

  if (!goal) return null

  const targetAmount = parseFloat(goal.targetAmount) || 0
  const currentAmount = parseFloat(goal.currentAmount) || 0
  const addedNum = parseFloat(depositAmount) || 0
  const newTotal = currentAmount + addedNum
  const currentPercent = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0
  const newPercent = targetAmount > 0 ? Math.min(100, Math.round((newTotal / targetAmount) * 100)) : 0
  const willComplete = newTotal >= targetAmount

  const handleQuickAdd = (amt: number) => {
    setDepositAmount(String(amt))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (addedNum <= 0) {
      setError('Deposit amount must be greater than 0')
      return
    }

    await onDeposit({
      id: goal.id,
      amount: addedNum,
      currentSaved: currentAmount,
      targetAmount,
    })

    setDepositAmount('')
    setError('')
    onClose()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add Funds (টাকা জমা করুন)"
      description={goal.name}
    >
      <div className="space-y-4">
        {/* Current Standing Card */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Current Saved:</span>
            <span className="font-mono font-bold text-foreground">
              {currency} {currentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({currentPercent}%)
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Goal Target:</span>
            <span className="font-mono font-medium text-foreground">
              {currency} {targetAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          {/* Progress Mini Bar */}
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${currentPercent}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground">
              Deposit Amount ({currency}) <span className="text-destructive">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                {currency}
              </span>
              <Input
                type="number"
                step="0.01"
                min="1"
                autoFocus
                placeholder="5000"
                value={depositAmount}
                onChange={(e) => {
                  setDepositAmount(e.target.value)
                  setError('')
                }}
                className="pl-12 font-mono text-lg font-semibold"
              />
            </div>
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>

          {/* Quick Amount Chips */}
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Add (দ্রুত সিলেক্ট করুন):
            </span>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAdd(amt)}
                  className={cn(
                    'rounded-lg border border-border/80 py-1.5 text-xs font-mono font-semibold transition-all',
                    addedNum === amt
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'hover:border-primary hover:bg-primary/5 hover:text-foreground text-muted-foreground',
                  )}
                >
                  +৳{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Preview State */}
          {addedNum > 0 && (
            <div
              className={cn(
                'rounded-lg p-3 text-xs border transition-all animate-in fade-in',
                willComplete
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'border-border/80 bg-card text-foreground',
              )}
            >
              <div className="flex items-center justify-between font-medium">
                <span>New Balance after deposit:</span>
                <span className="font-mono font-bold text-sm">
                  {currency} {newTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({newPercent}%)
                </span>
              </div>
              {willComplete && (
                <div className="mt-1.5 flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="h-4 w-4" />
                  Awesome! This deposit will complete your savings goal! 🎉
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
              disabled={isSubmitting || addedNum <= 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Deposit (টাকা জমা করুন)'}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}
