"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Plus, Bookmark, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const navItems = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/upload", icon: Plus, label: "Upload", isCenter: true },
  { href: "/bookmarks", icon: Bookmark, label: "Saved" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in-up py-2">
      {/* Glass background */}
      <div className="absolute inset-0 bg-card border-t border-border/50" />

      {/* Safe area spacer */}
      <div className="relative flex items-end justify-around px-2 pt-2 pb-2 safe-bottom">
        {navItems.map((item, index) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          if (item.isCenter) {
            return (
              <Link key={item.href} href={item.href} className="relative flex flex-col items-center -mt-6">
                {/* Glow effect */}
                <div className="absolute inset-0 top-1 bg-primary/30 rounded-full blur-xl scale-75" />
                {/* Button */}
                <div
                  className={cn(
                    "relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary shadow-lg shadow-primary/30 press-effect transition-all duration-300",
                    isActive && "scale-110 shadow-primary/50",
                  )}
                >
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-[10px] mt-1.5 font-medium text-muted-foreground">{item.label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Active indicator pill */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary animate-scale-in" />
              )}

              {/* Icon with fill effect */}
              <div className="relative">
                <Icon
                  className={cn("h-6 w-6 transition-all duration-300", isActive && "scale-110")}
                  fill={isActive ? "currentColor" : "none"}
                  fillOpacity={isActive ? 0.15 : 0}
                />
                {/* Bounce animation on active */}
                {isActive && (
                  <div className="absolute inset-0 animate-ping">
                    <Icon className="h-6 w-6 text-primary/30" />
                  </div>
                )}
              </div>

              <span
                className={cn("text-[10px] mt-1 font-medium transition-all duration-300", isActive && "font-semibold")}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
