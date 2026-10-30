import * as React from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
}

export function Dialog({ isOpen, onClose, children, title, description, className }: DialogProps) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
      aria-describedby={description ? 'dialog-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`relative z-50 w-[calc(100vw-1.5rem)] max-w-lg my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col rounded-xl border border-border bg-card shadow-2xl ${
          className ?? ''
        }`}
      >
        {/* Top-right close button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 z-10 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {(title || description) && (
          <div className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-border shrink-0 pr-12">
            {title && (
              <h2 id="dialog-title" className="text-base sm:text-lg font-semibold text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p id="dialog-description" className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

