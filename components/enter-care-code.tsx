'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Heart, Link2, ArrowRight, Loader2, Copy, Check } from 'lucide-react'
import { useSahay } from '@/lib/sahay-context'

/**
 * Enter Care Code Screen
 * - Caregivers: enter a 6-char code to link to a care receiver
 * - Care receivers: shown their code to share
 */
export function EnterCareCode() {
    const { user, linkCareCode, logout } = useSahay()
    const [code, setCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)

    const isCaregiver = user?.role === 'caregiver'
    const careCode = user?.care_code

    const handleLink = async () => {
        if (code.length !== 6) return
        setIsLoading(true)
        setError('')

        try {
            await linkCareCode(code)
        } catch (err: any) {
            setError(err.message || 'Invalid code. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopy = async () => {
        if (careCode) {
            await navigator.clipboard.writeText(careCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background safe-top safe-bottom">
            <motion.div
                className="text-center mb-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <motion.div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sahay-blue/10 mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                >
                    <Link2 className="w-10 h-10 text-sahay-blue" strokeWidth={1.5} />
                </motion.div>

                <h1 className="text-3xl font-semibold text-foreground mb-2">
                    {isCaregiver ? 'Link to Care Receiver' : 'Your Care Code'}
                </h1>
                <p className="text-lg text-muted-foreground max-w-sm">
                    {isCaregiver
                        ? 'Enter the 6-character code shared by the person you care for.'
                        : 'Share this code with your caregiver so they can connect with you.'}
                </p>
            </motion.div>

            <div className="w-full max-w-md">
                {isCaregiver ? (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {/* Code input */}
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                            onKeyDown={(e) => e.key === 'Enter' && handleLink()}
                            placeholder="Enter 6-char code"
                            maxLength={6}
                            className="w-full py-5 px-6 text-center text-3xl font-mono font-bold tracking-[0.5em]
                       bg-card border-2 border-border rounded-2xl
                       focus:outline-none focus:border-sahay-blue focus:ring-2 focus:ring-sahay-blue/20
                       transition-all placeholder:text-muted-foreground/40 placeholder:tracking-normal placeholder:text-lg placeholder:font-sans"
                            autoFocus
                        />

                        <motion.button
                            onClick={handleLink}
                            disabled={code.length !== 6 || isLoading}
                            className="w-full py-4 px-6 bg-sahay-blue text-white text-lg font-semibold
                       rounded-2xl flex items-center justify-center gap-2 shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all touch-manipulation"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Link
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {/* Show the care code */}
                        <div className="bg-card border-2 border-sahay-blue/30 rounded-2xl p-8 text-center">
                            <p className="text-sm text-muted-foreground mb-3 uppercase tracking-widest font-medium">
                                Your Code
                            </p>
                            <p className="text-4xl font-mono font-bold tracking-[0.5em] text-foreground">
                                {careCode || '------'}
                            </p>
                        </div>

                        <motion.button
                            onClick={handleCopy}
                            className="w-full py-4 px-6 bg-card border-2 border-border text-foreground text-lg font-semibold
                       rounded-2xl flex items-center justify-center gap-2
                       hover:border-sahay-blue/50 transition-all touch-manipulation"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-5 h-5 text-sahay-success" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-5 h-5" />
                                    Copy Code
                                </>
                            )}
                        </motion.button>

                        <p className="text-center text-muted-foreground text-base">
                            Waiting for your caregiver to enter this code...
                        </p>
                    </motion.div>
                )}

                {error && (
                    <motion.p
                        className="mt-4 text-center text-destructive text-base font-medium"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {error}
                    </motion.p>
                )}

                {/* Logout */}
                <button
                    onClick={logout}
                    className="w-full mt-6 text-center text-muted-foreground text-base py-2 hover:text-foreground transition-colors"
                >
                    Sign out
                </button>
            </div>
        </main>
    )
}
