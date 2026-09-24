"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSahay } from "@/lib/sahay-context";
import {
  type CareRoleStatus,
  type TimeOfDay,
  timeOfDayLabels,
} from "@/lib/types";
import {
  User,
  Calendar,
  Sun,
  Cloud,
  Moon,
  ArrowLeft,
  Check,
  ArrowLeftRight,
  Mail,
  Copy,
  Share2,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Fluid Care Roles Page
 * Allow caregiving responsibility to shift, be shared, or be handed over
 * Reflects real family dynamics and prevents burnout
 */
export default function RolesPage() {
  const {
    data,
    user,
    updateCaregiverStatus,
    setCareReceiverIndependence,
    startHandover,
    endHandover,
  } = useSahay();
  const router = useRouter();
  const [awayDays, setAwayDays] = useState(1);
  const [showHandoverSetup, setShowHandoverSetup] = useState(false);
  const [handoverName, setHandoverName] = useState("");
  const [handoverEmail, setHandoverEmail] = useState("");
  const [handoverDays, setHandoverDays] = useState("3");
  const [copiedCode, setCopiedCode] = useState(false);

  const currentStatus = data.caregiver?.roleStatus || "active";
  const independentTimes = data.careReceiver?.independentTimes || [];

  const handleStatusChange = (status: CareRoleStatus) => {
    if (status === "away") {
      const awayUntil = new Date();
      awayUntil.setDate(awayUntil.getDate() + awayDays);
      updateCaregiverStatus(status, awayUntil.toISOString());
    } else {
      updateCaregiverStatus(status, undefined);
    }
  };

  const toggleIndependentTime = (time: TimeOfDay) => {
    if (independentTimes.includes(time)) {
      setCareReceiverIndependence(independentTimes.filter((t) => t !== time));
    } else {
      setCareReceiverIndependence([...independentTimes, time]);
    }
  };

  const timeIcons: Record<TimeOfDay, any> = {
    morning: Sun,
    afternoon: Cloud,
    evening: Moon,
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-6 pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center
                     hover:bg-secondary/80 transition-colors touch-manipulation
                     focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Care Roles
            </h1>
            <p className="text-muted-foreground">
              Adjust how care responsibilities are shared
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Caregiver Status */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">Your Status</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleStatusChange("active")}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all touch-manipulation
                       focus:outline-none focus:ring-2 focus:ring-ring
                       ${currentStatus === "active" ? "border-sahay-sage bg-sahay-sage-light" : "border-border bg-card hover:border-sahay-sage/50"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Actively caring
                  </p>
                  <p className="text-muted-foreground">
                    You&apos;re managing care as usual
                  </p>
                </div>
                {currentStatus === "active" && (
                  <Check className="w-5 h-5 text-sahay-sage" />
                )}
              </div>
            </button>

            <div
              className={`w-full p-4 rounded-xl border-2 transition-all
                       ${currentStatus === "away" ? "border-sahay-pending bg-sahay-pending/10" : "border-border bg-card"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Temporarily away
                  </p>
                  <p className="text-muted-foreground">
                    Check-in suggestions will pause
                  </p>
                </div>
                {currentStatus === "away" && (
                  <Check className="w-5 h-5 text-sahay-pending" />
                )}
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <input
                    type="range"
                    min={1}
                    max={14}
                    value={awayDays}
                    onChange={(e) => setAwayDays(Number(e.target.value))}
                    className="w-full accent-sahay-sage"
                  />
                </div>
                <span className="text-muted-foreground min-w-[60px]">
                  {awayDays} day{awayDays > 1 ? "s" : ""}
                </span>
              </div>

              <button
                onClick={() => handleStatusChange("away")}
                className="mt-3 w-full py-3 px-4 bg-secondary text-foreground font-medium
                         rounded-xl transition-all touch-manipulation
                         hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Mark as away for {awayDays} day{awayDays > 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </section>
 
        {/* Temporary Care Handover */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">Temporary Care Handover</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Delegate care responsibilities to a trusted family member or secondary caregiver for a set period. Access restores automatically when the period ends.
          </p>

          {data.caregiver?.handover?.isActive ? (
            <div className="p-5 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="font-bold text-amber-700 dark:text-amber-300 text-sm uppercase tracking-wider">
                    Handover Active
                  </span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold">
                  {data.caregiver.handover.endDate
                    ? `Until ${new Date(data.caregiver.handover.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                    : "Active"}
                </span>
              </div>

              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mb-2">
                Access restores to you automatically when this time expires.
              </p>

              <p className="text-base font-semibold text-foreground mb-1">
                Transferred to: {data.caregiver.handover.targetName}
              </p>
              {data.caregiver.handover.secondaryEmail && (
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {data.caregiver.handover.secondaryEmail}
                </p>
              )}

              {/* Secondary Caregiver Access Claim Code */}
              <div className="p-3 bg-card border border-border rounded-xl flex items-center justify-between mb-4 mt-2">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Caregiver Claim / Invite Code</p>
                  <p className="font-mono text-lg font-bold tracking-widest text-primary">
                    {data.caregiver.handover.inviteCode || data.careReceiver?.careCode || user?.care_code || "T9TSXM"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const code = data.caregiver?.handover?.inviteCode || data.careReceiver?.careCode || user?.care_code || "T9TSXM";
                      navigator.clipboard.writeText(code);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-secondary text-foreground text-xs font-semibold rounded-lg hover:bg-secondary/80 flex items-center gap-1 transition-all"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? "Copied" : "Copy"}
                  </button>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Hi ${data.caregiver.handover.targetName}! Here is your temporary Sahay+ caregiver access code: ${
                        data.caregiver.handover.inviteCode || data.careReceiver?.careCode || user?.care_code || "T9TSXM"
                      } to monitor ${data.careReceiver?.name || "care"}. Enter it at /care-code`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg transition-colors"
                    title="Share code via WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <button
                onClick={endHandover}
                className="w-full py-2.5 px-4 bg-background border border-border hover:bg-secondary text-foreground font-semibold text-sm rounded-xl transition-all"
              >
                Resume Full Care (End Handover)
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => setShowHandoverSetup(!showHandoverSetup)}
                className="w-full p-4 rounded-xl border-2 border-dashed border-border bg-card hover:border-sahay-blue/50 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sahay-blue/10 flex items-center justify-center">
                    <ArrowLeftRight className="w-5 h-5 text-sahay-blue" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">Initiate Temporary Handover</p>
                    <p className="text-xs text-muted-foreground">Assign secondary caregiver with access code</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${showHandoverSetup ? "rotate-90" : ""}`} />
              </button>

              <AnimatePresence>
                {showHandoverSetup && (
                  <motion.div
                    className="bg-card border-2 border-border rounded-2xl p-5 overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <h4 className="text-base font-bold mb-4">Handover Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Trusted Person&apos;s Name
                        </label>
                        <input
                          type="text"
                          value={handoverName}
                          onChange={(e) => setHandoverName(e.target.value)}
                          placeholder="e.g., Sister, Sibling, Friend"
                          className="w-full p-3 bg-secondary rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-sahay-blue"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Secondary Caregiver Email <span className="text-xs font-normal opacity-70">(optional)</span>
                        </label>
                        <input
                          type="email"
                          value={handoverEmail}
                          onChange={(e) => setHandoverEmail(e.target.value)}
                          placeholder="e.g., sister@example.com"
                          className="w-full p-3 bg-secondary rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-sahay-blue"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Handover Duration
                        </label>
                        <select
                          value={handoverDays}
                          onChange={(e) => setHandoverDays(e.target.value)}
                          className="w-full p-3 bg-secondary rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-sahay-blue"
                        >
                          <option value="3">3 days</option>
                          <option value="5">5 days</option>
                          <option value="7">1 week</option>
                          <option value="14">2 weeks</option>
                        </select>
                      </div>

                      <div className="p-3 bg-secondary/50 border border-border rounded-xl">
                        <p className="text-xs text-muted-foreground mb-1">
                          Access Code for them to enter on <code className="font-semibold text-primary">/care-code</code>:
                        </p>
                        <p className="font-mono text-lg font-bold tracking-widest text-primary">
                          {data.careReceiver?.careCode || user?.care_code || "T9TSXM"}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          const date = new Date();
                          date.setDate(date.getDate() + parseInt(handoverDays));
                          const inviteCode = data.careReceiver?.careCode || user?.care_code || "T9TSXM";
                          startHandover(handoverName, date.toISOString(), handoverEmail || undefined, inviteCode);
                          setShowHandoverSetup(false);
                        }}
                        disabled={!handoverName}
                        className="w-full py-3.5 bg-sahay-blue text-white font-bold rounded-xl disabled:opacity-50 active:scale-[0.97] transition-all"
                      >
                        Confirm Handover &amp; Share Code
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Care Receiver Independence */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">
              {data.careReceiver?.name || "Care Receiver"}&apos;s Independence
            </h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Select times when they manage medications on their own
          </p>

          <div className="space-y-3">
            {(Object.keys(timeOfDayLabels) as TimeOfDay[]).map((time) => {
              const Icon = timeIcons[time];
              const isIndependent = independentTimes.includes(time);

              return (
                <button
                  key={time}
                  onClick={() => toggleIndependentTime(time)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all touch-manipulation
                           focus:outline-none focus:ring-2 focus:ring-ring
                           ${isIndependent ? "border-sahay-blue bg-sahay-blue-light" : "border-border bg-card hover:border-sahay-blue/50"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 ${isIndependent ? "text-sahay-blue" : "text-muted-foreground"}`}
                      />
                      <div>
                        <p className="text-lg font-medium text-foreground">
                          {timeOfDayLabels[time]}
                        </p>
                        <p className="text-muted-foreground">
                          {isIndependent
                            ? "Managing independently"
                            : "May need support"}
                        </p>
                      </div>
                    </div>
                    {isIndependent && (
                      <Check className="w-5 h-5 text-sahay-blue" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
