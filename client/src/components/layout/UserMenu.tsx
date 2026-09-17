import { LogOut, Shield, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserRole } from '@family-finance/shared'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/useAuth'

export function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const fullName = `${user.firstName} ${user.lastName}`
  const isAdmin = user.role === UserRole.ADMIN

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all duration-150 hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar name={fullName} size="sm" />
        <div className="hidden md:block text-left">
          <p className="text-xs font-semibold leading-none text-foreground">{user.firstName}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-none">{user.role}</p>
        </div>
        <ChevronDown
          className={`hidden md:block h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-60 rounded-xl border border-border/60 bg-popover p-1.5 text-popover-foreground shadow-xl shadow-black/10 z-50"
          >
            {/* User info header */}
            <div className="px-3 py-2.5 mb-1">
              <div className="flex items-center gap-3">
                <Avatar name={fullName} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">{fullName}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5" title={user.email}>
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-[10px]">
                  {isAdmin ? <Shield className="h-2.5 w-2.5 mr-1" /> : null}
                  {user.role}
                </Badge>
              </div>
            </div>

            <div className="h-px bg-border/60 mx-1 mb-1" />

            {/* Sign out */}
            <button
              onClick={() => {
                setIsOpen(false)
                void logout()
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/8 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sign out</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
