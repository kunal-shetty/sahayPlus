'use client'

import { motion } from 'motion/react'
import { Home, BarChart3, Heart, MessageCircle } from 'lucide-react'

export type CaregiverTab = 'home' | 'activity' | 'care' | 'messages'

interface BottomNavProps {
    activeTab: CaregiverTab
    onTabChange: (tab: CaregiverTab) => void
    unreadMessages?: number
}

const tabs: { id: CaregiverTab; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'activity', label: 'Activity', icon: BarChart3 },
    { id: 'care', label: 'Care', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
]

export function CaregiverBottomNav({ activeTab, onTabChange, unreadMessages = 0 }: BottomNavProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 safe-bottom">
            <div className="flex h-16 items-center justify-around px-4 max-w-md mx-auto">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    const Icon = tab.icon

                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
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

                                {/* Unread badge for messages */}
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

                            {/* Active indicator bar */}
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
