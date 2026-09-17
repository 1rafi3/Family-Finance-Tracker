import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {label}
          </label>
        ) : null}
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-9 w-full rounded-lg border border-border/70 bg-background px-3 py-2',
            'text-sm text-foreground placeholder:text-muted-foreground/60',
            'ring-offset-background',
            'transition-all duration-150 ease-in-out',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary/50',
            'hover:border-border',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/40',
            error && 'border-destructive focus-visible:ring-destructive focus-visible:border-destructive',
            className,
          )}
          ref={ref}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-xs font-medium text-destructive flex items-center gap-1">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input }
