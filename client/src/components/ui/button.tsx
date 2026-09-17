import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium',
    'transition-all duration-150 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md',
        outline:
          'border border-border/80 bg-background text-foreground shadow-sm hover:bg-accent hover:border-border hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/70',
        ghost:
          'hover:bg-primary/8 hover:text-foreground text-muted-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success:
          'bg-success text-success-foreground shadow-sm hover:bg-success/90 hover:shadow-md',
      },
      size: {
        default: 'h-9 px-4 py-2 text-sm',
        sm: 'h-7 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-lg px-6 text-sm font-semibold',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
