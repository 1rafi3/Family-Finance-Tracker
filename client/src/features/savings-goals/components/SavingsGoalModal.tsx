import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import type { SavingsGoal, SavingsGoalCreateInput, SavingsGoalUpdateInput } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface SavingsGoalModalProps {
  isOpen: boolean
  onClose: () => void
  goalToEdit: SavingsGoal | null
  onSubmit: (data: SavingsGoalCreateInput | SavingsGoalUpdateInput) => Promise<void>
  isSubmitting: boolean
  currency?: string
}

const BANGLADESHI_PRESETS = [
  { label: '🚨 Emergency Fund', bengali: 'জরুরি ফান্ড', target: '100000', note: '৬ মাসের জরুরি ফ্যামিলি খরচ' },
  { label: '🌙 Eid Shopping & Gifts', bengali: 'ঈদের শপিং', target: '30000', note: 'ঈদুল ফিতর ও পরিবারের নতুন পোশাক' },
  { label: '🏖️ Cox\'s Bazar / Sajek Tour', bengali: 'ফ্যামিলি ট্যুর', target: '25000', note: 'পারিবারিক অবকাশ ভ্রমণ' },
  { label: '🕋 Hajj & Umrah Fund', bengali: 'হজ্জ ও ওমরাহ', target: '200000', note: 'পবিত্র হজ্জ ও ওমরাহ পালনের সঞ্চয়' },
  { label: '💻 New Laptop / Gadget', bengali: 'নতুন ল্যাপটপ', target: '75000', note: 'কাজের জন্য নতুন কম্পিউটার/ফোন' },
  { label: '💍 Gold / Jewelry', bengali: 'স্বর্ণালঙ্কার', target: '120000', note: 'ভবিষ্যতের জন্য স্বর্ণ ক্রয়' },
  { label: '📈 Bank DPS / Savings Scheme', bengali: 'ডিপিএস সঞ্চয়', target: '60000', note: 'বার্ষিক ডিপিএস জমার টার্গেট' },
]

export function SavingsGoalModal({
  isOpen,
  onClose,
  goalToEdit,
  onSubmit,
  isSubmitting,
  currency = 'BDT',
}: SavingsGoalModalProps) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('0')
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ACTIVE')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = Boolean(goalToEdit)

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name)
      setTargetAmount(goalToEdit.targetAmount)
      setCurrentAmount(goalToEdit.currentAmount)
      setDeadline(goalToEdit.deadline ? goalToEdit.deadline.slice(0, 10) : '')
      setNotes(goalToEdit.notes ?? '')
      setStatus(goalToEdit.status)
    } else {
      setName('')
      setTargetAmount('')
      setCurrentAmount('0')
      setDeadline('')
      setNotes('')
      setStatus('ACTIVE')
    }
    setErrors({})
  }, [goalToEdit, isOpen])

  const handleApplyPreset = (preset: (typeof BANGLADESHI_PRESETS)[0]) => {
    setName(preset.label)
    setTargetAmount(preset.target)
    if (!notes) {
      setNotes(preset.note)
    }
    setErrors((prev) => ({ ...prev, name: '', targetAmount: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Please enter a goal name'
    const targetVal = parseFloat(targetAmount)
    if (isNaN(targetVal) || targetVal <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0'
    }
    const currentVal = parseFloat(currentAmount)
    if (isNaN(currentVal) || currentVal < 0) {
      newErrors.currentAmount = 'Saved amount cannot be negative'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload: SavingsGoalCreateInput | SavingsGoalUpdateInput = {
      name: name.trim(),
      targetAmount: targetVal.toFixed(2),
      currentAmount: currentVal.toFixed(2),
      currency,
      deadline: deadline ? `${deadline}T00:00:00.000Z` : undefined,
      notes: notes.trim() || undefined,
      status: currentVal >= targetVal ? 'COMPLETED' : status,
    }

    await onSubmit(payload)
    onClose()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Savings Goal' : 'Create New Savings Goal (সঞ্চয় লক্ষ্য)'}
      description="Set a target to build emergency reserves or fund your dream purchases"
    >
      <div className="space-y-4">
        {/* Bangladeshi Presets Bar (only shown on create) */}
        {!isEditing && (
          <div className="space-y-1.5 rounded-lg border border-border/70 bg-muted/30 p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5 text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Popular Goals (জনপ্রিয় লক্ষ্য):
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {BANGLADESHI_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="rounded-full border border-border/80 bg-card px-2.5 py-1 text-[11px] font-medium text-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Name */}
          <div>
            <label className="text-xs font-semibold text-foreground">
              Goal Name (লক্ষ্যের নাম) <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Emergency Fund or কক্সবাজার ট্যুর"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
              }}
              className="mt-1.5"
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Amount Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Amount */}
            <div>
              <label className="text-xs font-semibold text-foreground">
                Target Amount ({currency}) <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  {currency}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="50000"
                  value={targetAmount}
                  onChange={(e) => {
                    setTargetAmount(e.target.value)
                    if (errors.targetAmount) setErrors((prev) => ({ ...prev, targetAmount: '' }))
                  }}
                  className="pl-12 font-mono"
                />
              </div>
              {errors.targetAmount && (
                <p className="mt-1 text-xs text-destructive">{errors.targetAmount}</p>
              )}
            </div>

            {/* Current Saved Amount */}
            <div>
              <label className="text-xs font-semibold text-foreground">
                Already Saved ({currency})
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  {currency}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={currentAmount}
                  onChange={(e) => {
                    setCurrentAmount(e.target.value)
                    if (errors.currentAmount) setErrors((prev) => ({ ...prev, currentAmount: '' }))
                  }}
                  className="pl-12 font-mono"
                />
              </div>
              {errors.currentAmount && (
                <p className="mt-1 text-xs text-destructive">{errors.currentAmount}</p>
              )}
            </div>
          </div>

          {/* Target Deadline */}
          <div>
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Target Completion Date (টার্গেট তারিখ)</span>
              <span className="text-[11px] font-normal text-muted-foreground">Optional</span>
            </label>
            <div className="relative mt-1.5">
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Lifecycle Status (if editing) */}
          {isEditing && (
            <div>
              <label className="text-xs font-semibold text-foreground">Status (অবস্থা)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'COMPLETED' | 'CANCELLED')}
                className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="ACTIVE">Active (সক্রিয়)</option>
                <option value="COMPLETED">Completed (সম্পন্ন 🎉)</option>
                <option value="CANCELLED">Cancelled (বাতিল)</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Notes / Purpose (মন্তব্য বা পরিকল্পনা)</span>
              <span className="text-[11px] font-normal text-muted-foreground">Optional</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Depositing BDT 5,000 every month from salary"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Goal (লক্ষ্য তৈরি করুন)'}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}
