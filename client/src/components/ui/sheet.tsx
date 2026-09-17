import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  side?: 'left' | 'right'
  title?: string
  className?: string
}

export function Sheet({ isOpen, onClose, children, side = 'left', title, className }: SheetProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        className={cn(
          'fixed z-50 flex h-full w-full max-w-md flex-col bg-card p-6 shadow-2xl transition duration-300 ease-in-out border-r',
          side === 'left' ? 'left-0' : 'right-0 border-l border-r-0',
          className,
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border">
          {title ? <h2 className="text-lg font-semibold text-foreground">{title}</h2> : <div />}
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pt-4">{children}</div>
      </div>
    </div>
  )
}
