import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

interface NumberTickerProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
  direction?: 'up' | 'down'
  delay?: number // seconds
}

/**
 * Modern Animated Counter / Number Ticker component.
 * Uses Framer Motion Spring physics to animate numbers smoothly
 * from 0 to the target value (or from old value to new value).
 * Seen across modern fintech products like Revolut, Stripe, and Linear.
 */
export function NumberTicker({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  className,
  delay = 0,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 25,
    stiffness: 140,
  })
  const isInView = useInView(ref, { once: true, margin: '0px' })

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(value)
      }, delay * 1000)
      return () => clearTimeout(timer)
    }
  }, [motionValue, isInView, delay, value])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}${suffix}`
      }
    })
    return () => unsubscribe()
  }, [springValue, decimals, prefix, suffix])

  return (
    <span
      ref={ref}
      className={cn('inline-block tabular-nums tracking-tight', className)}
    >
      {prefix}
      {value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}
