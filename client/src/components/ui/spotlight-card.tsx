import React, { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string
  children: React.ReactNode
}

/**
 * Premium Spotlight Card Component (Aceternity / Vercel style).
 * Tracks cursor mouse coordinates on hover to cast a smooth radial glow
 * behind the card content, giving an ultra-modern depth effect.
 */
export function SpotlightCard({
  className,
  spotlightColor = 'rgba(59, 130, 246, 0.08)',
  children,
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return

    const div = divRef.current
    const rect = div.getBoundingClientRect()

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleFocus = () => {
    setIsFocused(true)
    setOpacity(1)
  }

  const handleBlur = () => {
    setIsFocused(false)
    setOpacity(0)
  }

  const handleMouseEnter = () => {
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/60 bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md',
        className,
      )}
      {...props}
    >
      {/* Spotlight Glow Layer */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
        aria-hidden="true"
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
