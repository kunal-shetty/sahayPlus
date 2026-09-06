'use client'

/**
 * @file page.tsx
 * @description The Care Code page.
 * This page handles the connection between a caregiver and a care receiver.
 * - Caregivers use this page to enter a 6-character code to link with a receiver.
 * - Care receivers use this page to view and copy their unique care code to share.
 */

import { useState } from 'react'
import { motion } from 'motion/react'
import { Heart, Link2, ArrowRight, Loader2, Copy, Check } from 'lucide-react'
import { useSahay } from '@/lib/sahay-context'
import { useRouter } from 'next/navigation'

/**
 * CareCodePage component.
 * Dynamically renders either a code input (for caregivers) or a code display (for receivers).
 *
 * @returns {JSX.Element} The care code interface.
 */
export default function CareCodePage() {
    const { user, linkCareCode, logout } = useSahay()
    const router = useRouter()
    const [code, setCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)

    const isCaregiver = user?.role === 'caregiver'
    const careCode = user?.care_code

    /**
     * Validates and submits the 6-character care code to link the relationship.
     * After successful linking, redirects the user to their respective home page.
     */
    const handleLink = async () => {
        if (code.length !== 6) return
        setIsLoading(true)
        setError('')

        try {
            await linkCareCode(code)
            // Redirect based on user role after linking
            router.push(user?.role === 'caregiver' ? '/caregiver' : '/care-receiver')
        } catch (err: any) {
            setError(err.message || 'Invalid code. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Copies the user's unique care code to the clipboard.
     */
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
                        {/* Code input field: constrained to 6 uppercase alphanumeric characters */}
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
                        {/* Code display area for care receivers */}
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

                {/* Logout option to restart auth process */}
                <button
                    onClick={() => {
                        logout()
                        router.push('/login')
                    }}
                    className="w-full mt-6 text-center text-muted-foreground text-base py-2 hover:text-foreground transition-colors"
                >
                    Sign out
                </button>
            </div>
        </main>
    )
}
