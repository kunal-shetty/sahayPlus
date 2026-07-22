'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Heart, Mail, User, ArrowRight, Users, Loader2 } from 'lucide-react'
import { useSahay } from '@/lib/sahay-context'

/**
 * Email Login Screen
 * Step 1: Enter email
 * Step 2 (new users): Enter name + select role
 */
export function EmailLogin() {
    const { login } = useSahay()
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [role, setRole] = useState<'caregiver' | 'care_receiver' | null>(null)
    const [step, setStep] = useState<'email' | 'details'>('email')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleEmailSubmit = async () => {
        if (!email.trim()) return
        setIsLoading(true)
        setError('')

        try {
            // Try logging in with just email
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            })
            const data = await res.json()

            if (res.ok && !data.is_new) {
                // Existing user — log them in directly
                login(data.user, data.care_relationship)
            } else if (res.status === 400 && data.error?.includes('Name and role')) {
                // New user — need more info
                setStep('details')
            } else {
                setError(data.error || 'Something went wrong')
            }
        } catch {
            setError('Could not connect to server')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSignup = async () => {
        if (!name.trim() || !role) return
        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), name: name.trim(), role }),
            })
            const data = await res.json()

            if (res.ok) {
                login(data.user, data.care_relationship)
            } else {
                setError(data.error || 'Something went wrong')
            }
        } catch {
            setError('Could not connect to server')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background safe-top safe-bottom">
            {/* Logo */}
            <motion.div
                className="text-center mb-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                >
                    <Heart className="w-10 h-10 text-primary" strokeWidth={1.5} />
                </motion.div>

                <motion.h1
                    className="text-3xl font-semibold text-foreground mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Welcome to Sahay+
                </motion.h1>
                <motion.p
                    className="text-lg text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {step === 'email' ? 'Sign in to continue' : 'Tell us about yourself'}
                </motion.p>
            </motion.div>

            <div className="w-full max-w-md">
                {step === 'email' ? (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        {/* Email input */}
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                                placeholder="Enter your email"
                                className="w-full pl-12 pr-4 py-4 text-lg bg-card border-2 border-border rounded-2xl
                         focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                         transition-all placeholder:text-muted-foreground/60"
                                autoFocus
                                autoComplete="email"
                            />
                        </div>

                        {/* Continue button */}
                        <motion.button
                            onClick={handleEmailSubmit}
                            disabled={!email.trim() || isLoading}
                            className="w-full py-4 px-6 bg-primary text-primary-foreground text-lg font-semibold
                       rounded-2xl flex items-center justify-center gap-2 shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all touch-manipulation
                       focus:outline-none focus:ring-2 focus:ring-primary/50"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        {/* Name input */}
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className="w-full pl-12 pr-4 py-4 text-lg bg-card border-2 border-border rounded-2xl
                         focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                         transition-all placeholder:text-muted-foreground/60"
                                autoFocus
                            />
                        </div>

                        {/* Role selection */}
                        <p className="text-center text-muted-foreground text-base pt-2">
                            How will you use Sahay+?
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <motion.button
                                onClick={() => setRole('caregiver')}
                                className={`p-5 rounded-2xl border-2 text-left transition-all touch-manipulation
                          ${role === 'caregiver'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border bg-card hover:border-primary/50'}`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Users className={`w-7 h-7 mb-2 ${role === 'caregiver' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <p className="text-base font-semibold text-foreground">Caregiver</p>
                                <p className="text-sm text-muted-foreground mt-1">I care for someone</p>
                            </motion.button>

                            <motion.button
                                onClick={() => setRole('care_receiver')}
                                className={`p-5 rounded-2xl border-2 text-left transition-all touch-manipulation
                          ${role === 'care_receiver'
                                        ? 'border-sahay-blue bg-sahay-blue/5'
                                        : 'border-border bg-card hover:border-sahay-blue/50'}`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Heart className={`w-7 h-7 mb-2 ${role === 'care_receiver' ? 'text-sahay-blue' : 'text-muted-foreground'}`} />
                                <p className="text-base font-semibold text-foreground">Care Receiver</p>
                                <p className="text-sm text-muted-foreground mt-1">I manage my care</p>
                            </motion.button>
                        </div>

                        {/* Create account button */}
                        <motion.button
                            onClick={handleSignup}
                            disabled={!name.trim() || !role || isLoading}
                            className="w-full py-4 px-6 bg-primary text-primary-foreground text-lg font-semibold
                       rounded-2xl flex items-center justify-center gap-2 shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all touch-manipulation
                       focus:outline-none focus:ring-2 focus:ring-primary/50"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Get Started
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>

                        {/* Back link */}
                        <button
                            onClick={() => setStep('email')}
                            className="w-full text-center text-muted-foreground text-base py-2 hover:text-foreground transition-colors"
                        >
                            ← Use a different email
                        </button>
                    </motion.div>
                )}

                {/* Error message */}
                {error && (
                    <motion.p
                        className="mt-4 text-center text-destructive text-base font-medium"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {error}
                    </motion.p>
                )}
            </div>

            <motion.p
                className="mt-12 text-sm text-muted-foreground text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                Everyday care, made a little easier.
            </motion.p>
        </main>
    )
}
