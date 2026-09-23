"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItemProps {
  label: string;
  icon: React.ElementType;
  path: string;
  active: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}

function NavItem({
  label,
  icon: Icon,
  path,
  active,
  onClick,
  isCollapsed,
}: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center rounded-xl transition-all duration-200 group w-full text-left",
        isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3",
        active
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <Icon
        className={cn(
          "w-5 h-5 transition-transform duration-200",
          active ? "scale-110" : "group-hover:scale-110",
        )}
      />
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
  );
}

export function CaregiverLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const mainRef = React.useRef<HTMLElement>(null);

  // Monitor breakpoint (lg = 1024px) for desktop vs mobile drawer behavior
  React.useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop(e.matches);
      if (e.matches) {
        setIsMobileMenuOpen(false);
      }
    };
    setIsDesktop(mql.matches);
    try {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    } catch {
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    }
  }, []);

  // Scroll content to top whenever navigating to a new route
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [pathname]);

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Analytics", icon: BarChart3, path: "/caregiver/analytics" },
    { label: "Care Notes", icon: FileText, path: "/caregiver/notes" },
    { label: "Wellness", icon: Smile, path: "/caregiver/wellness" },
    { label: "History", icon: Calendar, path: "/caregiver/history" },
    { label: "Doctor Prep", icon: Stethoscope, path: "/caregiver/doctor-prep" },
    { label: "Pharmacist", icon: Pill, path: "/caregiver/pharmacist" },
    { label: "Roles & Status", icon: Users, path: "/caregiver/roles" },
  ];

  const handleNavClick = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground font-sans overflow-hidden">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
        aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar - Fixed on desktop / Off-canvas drawer on mobile */}
      <motion.aside
        initial={false}
        animate={{
          width: isDesktop ? (isCollapsed ? 80 : 260) : 260,
          x: isDesktop ? 0 : isMobileMenuOpen ? 0 : -280,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className={cn(
          "z-40 h-full bg-card border-r border-border flex flex-col shrink-0 select-none",
          "fixed inset-y-0 left-0 lg:static lg:h-full",
          !isDesktop && !isMobileMenuOpen && "pointer-events-none",
        )}
      >
        {/* Logo / Header */}
        <div
          className={cn(
            "p-6 flex items-center gap-3 shrink-0",
            isCollapsed && "justify-center px-0",
          )}
        >
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          {(!isCollapsed || !isDesktop) && (
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
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide py-2">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              active={pathname === item.path}
              onClick={() => handleNavClick(item.path)}
              isCollapsed={isDesktop && isCollapsed}
            />
          ))}
        </nav>

        {/* Footer / Collapse Toggle (desktop only) */}
        <div className="p-4 border-t border-border shrink-0 hidden lg:block">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all group"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 mx-auto" />
            ) : (
              <div className="flex items-center gap-3">
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium text-sm">Collapse Menu</span>
              </div>
            )}
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content Area - Independently scrollable */}
      <main ref={mainRef} className="flex-1 h-full min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
