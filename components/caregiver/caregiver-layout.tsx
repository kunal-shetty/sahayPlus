'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Smile,
  Calendar,
  Stethoscope,
  Pill,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItemProps {
  label: string
  icon: React.ElementType
  path: string
  active: boolean
  onClick: () => void
  isCollapsed: boolean
}

function NavItem({ label, icon: Icon, path, active, onClick, isCollapsed }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center rounded-xl transition-all duration-200 group w-full text-left",
        isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3",
        active
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      <Icon className={cn(
        "w-5 h-5 transition-transform duration-200",
        active ? "scale-110" : "group-hover:scale-110"
      )} />
      {!isCollapsed && (
        <>
          <span className="font-medium text-sm">{label}</span>
          {active && (
            <motion.div
              layoutId="nav-active-indicator"
              className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground"
            />
          )}
        </>
      )}
    </button>
  )
}

export function CaregiverLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Analytics', icon: BarChart3, path: '/caregiver/analytics' },
    { label: 'Care Notes', icon: FileText, path: '/caregiver/notes' },
    { label: 'Wellness', icon: Smile, path: '/caregiver/wellness' },
    { label: 'History', icon: Calendar, path: '/caregiver/history' },
    { label: 'Doctor Prep', icon: Stethoscope, path: '/caregiver/doctor-prep' },
    { label: 'Pharmacist', icon: Pill, path: '/caregiver/pharmacist' },
    { label: 'Roles & Status', icon: Users, path: '/caregiver/roles' },
  ]

  const handleNavClick = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? '80px' : '260px',
          translateX: isMobileMenuOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -260 : 0)
        }}
        className={cn(
          "relative z-40 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out",
          "fixed lg:static"
        )}
      >
        {/* Logo / Header */}
        <div className={cn(
          "p-6 flex items-center gap-3 mb-6",
          isCollapsed && "justify-center px-0"
        )}>
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tight"
            >
              Sahay<span className="text-primary">+</span>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              active={pathname === item.path}
              onClick={() => handleNavClick(item.path)}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Footer / Collapse Toggle */}
        <div className="p-4 border-t border-border space-y-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all group"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <div className="flex items-center gap-3">
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium text-sm">Collapse Menu</span>
            </div>}
          </button>
        </div>
      </motion.aside>

      {/* Overlay for mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {children}
      </main>
    </div>
  )
}
