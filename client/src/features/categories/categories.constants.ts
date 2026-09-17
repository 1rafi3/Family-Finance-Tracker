import {
  Utensils,
  ShoppingBag,
  Car,
  Fuel,
  Home,
  Briefcase,
  Gift,
  Stethoscope,
  GraduationCap,
  Plane,
  TrendingUp,
  Receipt,
  Tv,
  Wallet,
  Building,
  Heart,
  Wrench,
  Coffee,
  PiggyBank,
  DollarSign,
  Zap,
} from 'lucide-react'
import type { ElementType } from 'react'

export interface CategoryIconOption {
  name: string
  label: string
  icon: ElementType
}

export const FINANCE_ICONS: CategoryIconOption[] = [
  { name: 'utensils', label: 'Food & Dining', icon: Utensils },
  { name: 'shopping-bag', label: 'Shopping', icon: ShoppingBag },
  { name: 'car', label: 'Vehicle & Transport', icon: Car },
  { name: 'fuel', label: 'Fuel', icon: Fuel },
  { name: 'home', label: 'Housing & Rent', icon: Home },
  { name: 'briefcase', label: 'Salary & Income', icon: Briefcase },
  { name: 'gift', label: 'Gifts & Rewards', icon: Gift },
  { name: 'stethoscope', label: 'Medical & Healthcare', icon: Stethoscope },
  { name: 'graduation-cap', label: 'Education', icon: GraduationCap },
  { name: 'plane', label: 'Travel', icon: Plane },
  { name: 'trending-up', label: 'Investment', icon: TrendingUp },
  { name: 'receipt', label: 'Bills & Utilities', icon: Receipt },
  { name: 'tv', label: 'Entertainment', icon: Tv },
  { name: 'wallet', label: 'Cash & Wallet', icon: Wallet },
  { name: 'building', label: 'Business', icon: Building },
  { name: 'heart', label: 'Personal Care', icon: Heart },
  { name: 'wrench', label: 'Maintenance', icon: Wrench },
  { name: 'coffee', label: 'Cafes & Snacks', icon: Coffee },
  { name: 'piggy-bank', label: 'Savings', icon: PiggyBank },
  { name: 'dollar-sign', label: 'Finance', icon: DollarSign },
  { name: 'zap', label: 'Electricity & Gas', icon: Zap },
]

export const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald / Green
  '#ef4444', // Red
  '#f59e0b', // Amber / Yellow
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#64748b', // Slate
  '#14b8a6', // Teal
]

export function getCategoryIcon(name?: string): ElementType {
  const match = FINANCE_ICONS.find((item) => item.name === name)
  return match ? match.icon : Wallet
}
