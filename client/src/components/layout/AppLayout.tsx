import { useState } from 'react'
import { Outlet } from 'react-router'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Sheet } from '@/components/ui/sheet'

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background print:h-auto print:w-auto print:overflow-visible print:bg-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex print:hidden">
        <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      </div>

      {/* Mobile Drawer Navigation */}
      <div className="print:hidden">
        <Sheet isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} title="Navigation">
          <Sidebar
            isCollapsed={false}
            onToggleCollapse={() => {}}
            onMobileNavigate={() => setIsMobileOpen(false)}
          />
        </Sheet>
      </div>

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col overflow-hidden print:h-auto print:overflow-visible">
        <div className="print:hidden">
          <Header onOpenMobileMenu={() => setIsMobileOpen(true)} />
        </div>
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6 lg:p-8 print:p-0 print:bg-white print:overflow-visible">
          <div className="mx-auto max-w-[1400px] print:max-w-none print:w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
