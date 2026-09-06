'use client'

/**
 * @file bottom-nav.tsx
 * @description The Caregiver Bottom Navigation component for Sahay+.
 * This component provides a persistent navigation bar at the bottom of the
 * caregiver's viewport, allowing for quick switching between the home dashboard,
 * analytics, care tools, and messages. It includes an unread message counter
 * and uses shared layout animations for the active tab indicator.
 */

import { motion } from 'motion/react'
import { Home, BarChart3, Heart, MessageCircle } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

/**
 * Type definition for the caregiver navigation tabs.
 */
export type CaregiverTab = 'home' | 'activity' | 'care' | 'messages'

/**
 * Props for the CaregiverBottomNav component.
 * @interface BottomNavProps
 * @property {number} [unreadMessages=0] - The number of unread messages to display in the badge.
 */
interface BottomNavProps {
    unreadMessages?: number
}

/**
 * Configuration for the navigation tabs.
 * Each tab defines its internal ID, a display label, an icon, and a routing path.
 */
const tabs: { id: CaregiverTab; label: string; icon: any; path: string }[] = [
    { id: 'home', label: 'Home', icon: Home, path: '/caregiver' },
    { id: 'activity', label: 'Activity', icon: BarChart3, path: '/caregiver/analytics' },
    { id: 'care', label: 'Care', icon: Heart, path: '/caregiver' }, // Stays on home, maybe scrolls
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/caregiver/messages' },
]

/**
 * CaregiverBottomNav component.
 * Renders a mobile-optimized navigation bar with active state tracking and
 * an unread message indicator.
 *
 * @param {BottomNavProps} props - Component props.
 * @returns {JSX.Element} The caregiver bottom navigation bar.
 */
export function CaregiverBottomNav({ unreadMessages = 0 }: BottomNavProps) {
    const router = useRouter()
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 safe-bottom">
            <div className="flex h-16 items-center justify-around px-4 max-w-md mx-auto">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.path
                    const Icon = tab.icon

                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => router.push(tab.path)}
                            className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[48px]
                                 transition-colors touch-manipulation
                                 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground/70'}`}
                            aria-label={tab.label}
                            whileTap={{ scale: 0.9 }}
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -2 : 0 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                >
                                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                                </motion.div>

                                {tab.id === 'messages' && unreadMessages > 0 && (
                                    <motion.span
                                        className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500 }}
                                    >
                                        {unreadMessages > 9 ? '9+' : unreadMessages}
                                    </motion.span>
                                )}
                            </div>
                            <motion.span
                                className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}
                                animate={{ opacity: isActive ? 1 : 0.7 }}
                            >
                                {tab.label}
                            </motion.span>

                            {isActive && (
                                <motion.div
                                    className="absolute -bottom-0.5 w-6 h-[3px] rounded-full bg-primary"
                                    layoutId="activeTabBar"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    )
                })}
            </div>
        </nav>
    )
}
