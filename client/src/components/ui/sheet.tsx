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
  hideHeader?: boolean
}

export function Sheet({
  isOpen,
  onClose,
  children,
  side = 'left',
  title,
  className,
  hideHeader = false,
}: SheetProps) {
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
          'fixed z-50 flex h-full w-[85vw] max-w-xs sm:max-w-md flex-col bg-card shadow-2xl transition duration-300 ease-in-out',
          side === 'left' ? 'left-0 border-r border-border' : 'right-0 border-l border-border',
          className,
        )}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            {title ? <h2 className="text-base sm:text-lg font-semibold text-foreground">{title}</h2> : <div />}
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground opacity-70 hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

