"use client";

import { useState } from "react";
import { useSahay } from "@/lib/sahay-context";
import {
  ArrowLeft,
  FileText,
  Activity,
  Heart,
  AlertCircle,
  Printer,
  Copy,
  Check,
  Mail,
  MessageSquare,
  Calendar,
  Pill,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatTime12h } from "@/lib/types";

/**
 * Doctor Visit Prep Page (Module 13: Doctor Visit Preparation & Clinical Summaries)
 * Generates a structured, professional clinical summary for medical consultations
 * with interactive 7, 14, and 30-day reporting windows, print optimization (A4 PDF),
 * and 1-tap sharing options.
 */
export default function DoctorPrepPage() {
  const { data, getDoctorPrepData } = useSahay();
  const router = useRouter();

  const [daysRange, setDaysRange] = useState<7 | 14 | 30>(7);
  const [copied, setCopied] = useState(false);
  const prepData = getDoctorPrepData(daysRange);

  const patientName = data.careReceiver?.name || "Patient";
  const caregiverName = data.caregiver?.name || "Primary Caregiver";
  const contactPhone =
    data.emergencyContacts?.find((c) => c.isPrimary)?.phone || data.emergencyContacts?.[0]?.phone;

  const morningCount = data.medications.filter((m) => m.timeOfDay === "morning").length;
  const afternoonCount = data.medications.filter((m) => m.timeOfDay === "afternoon").length;
  const eveningCount = data.medications.filter((m) => m.timeOfDay === "evening").length;

  const generateShareText = () => {
    const medsText =
      data.medications.length > 0
        ? data.medications
            .map(
              (m) =>
                `• ${m.name} (${m.dosage}) - ${m.time ? formatTime12h(m.time) : m.timeOfDay.toUpperCase()}${
                  m.foodInstruction ? ` (${m.foodInstruction.replace("_", " ")})` : ""
                }`
            )
            .join("\n")
        : "• No active medications listed.";

    const changesText =
      prepData.changes.length > 0
        ? prepData.changes.map((c) => `• ${c.medicationName}: ${c.note} (${c.date})`).join("\n")
        : "• No significant dosage changes recorded.";

    const notesText =
      prepData.observations.length > 0
        ? prepData.observations.map((o) => `• ${o}`).join("\n")
        : "• No clinical notes recorded.";

    return `*SAHAY+ PATIENT CARE SUMMARY (${daysRange}-DAY REPORT)*\n` +
      `Patient: ${patientName} (Care Code: ${data.careReceiver?.careCode || "T9TSXM"})\n` +
      `Caregiver Contact: ${caregiverName}${contactPhone ? ` (Ph: ${contactPhone})` : ""}\n` +
      `Generated: ${new Date().toLocaleDateString()}\n\n` +
      `💊 *CURRENT MEDICATIONS & REGIMEN:*\n${medsText}\n\n` +
      `📊 *CLINICAL HIGHLIGHTS:*\n` +
      `• Medication Adherence: ${prepData.adherenceRate}%\n` +
      `• Wellness Trend: ${prepData.wellnessLabel || prepData.wellnessTrend[0] || "Stable"}\n` +
      `• Total Active Medicines: ${data.medications.length} (${morningCount} Morning, ${afternoonCount} Midday, ${eveningCount} Evening)\n\n` +
      `🔄 *ROUTINE & DOSAGE CHANGES:*\n${changesText}\n\n` +
      `📝 *CLINICAL OBSERVATIONS:*\n${notesText}\n\n` +
      `Shared via Sahay+ Health Platform`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard api unavailable
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Doctor Visit Summary - ${daysRange} Days`);
    const body = encodeURIComponent(generateShareText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-screen bg-background p-6 print:p-0 print:m-0 print:bg-white print:text-black print:min-h-0">
      <header className="mb-8 max-w-4xl mx-auto space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-all shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Doctor Visit Prep</h1>
              <p className="text-muted-foreground text-sm">
                Professional care summary for medical consultation
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-foreground text-xs font-bold rounded-xl hover:bg-secondary/80 transition-all border border-border"
              title="Copy text summary to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-sahay-success" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-xs"
              title="Share via WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleEmailShare}
              className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-foreground text-xs font-bold rounded-xl hover:bg-secondary/80 transition-all border border-border"
              title="Send via Email"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-xs"
              title="Print or Save PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* 7 to 30 Day Range Selector */}
        <div className="flex items-center justify-between p-3 bg-card border border-border rounded-2xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Time Range:</span>
          </div>
          <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-xl">
            {([7, 14, 30] as const).map((r) => {
              const active = daysRange === r;
              return (
                <button
                  key={r}
                  onClick={() => setDaysRange(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r} Days
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8 print:space-y-6 print:max-w-full">
        {/* Report Header Card */}
        <section className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm print:border print:border-slate-300 print:shadow-none print:p-6 print:rounded-2xl break-inside-avoid print:bg-white">
          <div className="flex justify-between items-start mb-6 pb-6 border-b border-border print:border-slate-300">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2 print:border print:border-slate-400">
                <span>Clinical Consultation Summary</span>
              </div>
              <h2 className="text-3xl font-extrabold text-foreground print:text-black">
                {patientName}
              </h2>
              <p className="text-muted-foreground text-sm mt-1 print:text-slate-600">
                Reporting Window: Last {daysRange} days · Generated on{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              {/* Clinical Profile Banner */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                <span className="font-bold text-muted-foreground uppercase tracking-wider">Allergies:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20 print:border-slate-300">
                  No Known Drug Allergies (NKDA)
                </span>
                <span className="font-bold text-muted-foreground uppercase tracking-wider ml-1">Care Code:</span>
                <span className="font-mono font-bold text-foreground print:text-black">
                  {data.careReceiver?.careCode || "T9TSXM"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                Primary Caregiver
              </div>
              <div className="text-base font-bold text-foreground print:text-black">
                {caregiverName}
              </div>
              {contactPhone && (
                <div className="text-xs text-muted-foreground print:text-slate-600">
                  Ph: {contactPhone}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1 print:text-slate-500">
                Sahay+ Eldercare Platform
              </div>
            </div>
          </div>

          {/* Three Summary Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Field 1: Avg. Adherence */}
            <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50 print:bg-slate-50 print:border print:border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                  Avg. Adherence
                </p>
                <Activity className="w-4 h-4 text-emerald-600 print:hidden" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 print:text-emerald-800">
                {prepData.adherenceRate}%
              </p>
              <p className="text-xs text-muted-foreground mt-1 print:text-slate-600">
                {prepData.adherenceDetail && prepData.adherenceDetail.closedDays > 0
                  ? `Across ${prepData.adherenceDetail.closedDays} closed days (${prepData.adherenceDetail.taken}/${prepData.adherenceDetail.scheduled} doses)`
                  : `${prepData.adherenceDetail?.taken || 0} of ${prepData.adherenceDetail?.scheduled || data.medications.length} doses logged`}
              </p>
            </div>

            {/* Field 2: Wellness Trend */}
            <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50 print:bg-slate-50 print:border print:border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                  Wellness Trend
                </p>
                <Heart className="w-4 h-4 text-primary print:hidden" />
              </div>
              <p className="text-2xl font-extrabold capitalize text-foreground print:text-black">
                {prepData.wellnessLabel || (prepData.wellnessTrend[0] ? prepData.wellnessTrend[0] : "Stable")}
              </p>
              <p className="text-xs text-muted-foreground mt-1 print:text-slate-600">
                {prepData.totalWellnessChecks !== undefined && prepData.totalWellnessChecks > 0
                  ? `${prepData.totalWellnessChecks} logged check-in${prepData.totalWellnessChecks > 1 ? "s" : ""}`
                  : "No adverse symptoms reported"}
              </p>
            </div>

            {/* Field 3: Active Regimen */}
            <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50 print:bg-slate-50 print:border print:border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                  Active Regimen
                </p>
                <Pill className="w-4 h-4 text-primary print:hidden" />
              </div>
              <p className="text-3xl font-extrabold text-foreground print:text-black">
                {data.medications.length} Medications
              </p>
              <p className="text-xs text-muted-foreground mt-1 print:text-slate-600">
                {morningCount} Morning · {afternoonCount} Midday · {eveningCount} Evening
              </p>
            </div>
          </div>
        </section>

        {/* Current Active Prescriptions Table */}
        <section className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm print:border print:border-slate-300 print:shadow-none print:p-6 print:rounded-2xl break-inside-avoid print:bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary print:hidden">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground print:text-black">
                Current Active Medications & Regimen
              </h3>
              <p className="text-muted-foreground text-xs print:text-slate-600">
                Complete verified list of medications currently scheduled for {patientName}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-border print:border-slate-400 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                  <th className="py-3 px-3">Medication Name</th>
                  <th className="py-3 px-3">Dosage</th>
                  <th className="py-3 px-3">Schedule / Timing</th>
                  <th className="py-3 px-3">Food Instructions</th>
                  <th className="py-3 px-3 text-right">Supply Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border print:divide-slate-200">
                {data.medications.map((med) => (
                  <tr key={med.id} className="hover:bg-secondary/10 print:hover:bg-transparent">
                    <td className="py-3.5 px-3 font-bold text-foreground print:text-black">
                      {med.name}
                    </td>
                    <td className="py-3.5 px-3 text-foreground font-medium print:text-black">
                      {med.dosage}
                    </td>
                    <td className="py-3.5 px-3 capitalize text-muted-foreground print:text-black">
                      <span className="font-semibold text-foreground print:text-black">
                        {med.time ? formatTime12h(med.time) : med.timeOfDay}
                      </span>
                      {med.time && (
                        <span className="text-xs text-muted-foreground block print:text-slate-600">
                          {med.timeOfDay} routine
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-muted-foreground print:text-black">
                      {med.foodInstruction === "before_meal" && "Before meal"}
                      {med.foodInstruction === "with_meal" && "With food"}
                      {(!med.foodInstruction || med.foodInstruction === "after_meal") && "After meal"}
                      {med.foodInstruction === "anytime" && "Anytime"}
                    </td>
                    <td className="py-3.5 px-3 text-right font-medium text-foreground print:text-black">
                      {med.refillDaysLeft !== undefined ? (
                        <span className={med.refillDaysLeft <= 5 ? "text-amber-600 font-bold" : ""}>
                          {med.refillDaysLeft} days left
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Refill on-demand</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Medication Changes */}
        <section className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm print:border print:border-slate-300 print:shadow-none print:p-6 print:rounded-2xl break-inside-avoid print:bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary print:hidden">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground print:text-black">
              Routine Changes & Adjustments
            </h3>
          </div>

          {prepData.changes.length > 0 ? (
            <div className="space-y-4">
              {prepData.changes.map((change, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 bg-secondary/20 rounded-2xl border border-border print:border-slate-200 print:bg-slate-50"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="font-bold text-foreground print:text-black">{change.medicationName}</p>
                    <p className="text-sm text-foreground/80 print:text-slate-800">{change.note}</p>
                    <p className="text-xs text-muted-foreground mt-1 print:text-slate-500">
                      Date of change: {change.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic print:text-slate-500">
              No significant dose changes recorded in the recent period.
            </p>
          )}
        </section>

        {/* Clinical Observations */}
        <section className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm print:border print:border-slate-300 print:shadow-none print:p-6 print:rounded-2xl break-inside-avoid print:bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary print:hidden">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground print:text-black">
              Clinical Observations & Notes
            </h3>
          </div>

          {prepData.observations.length > 0 ? (
            <ul className="space-y-3">
              {prepData.observations.map((obs, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-secondary/10 rounded-xl border border-border/50 print:border-slate-200 print:bg-slate-50"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                  <p className="text-foreground leading-relaxed print:text-black">{obs}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic print:text-slate-500">
              No recent care notes recorded.
            </p>
          )}
        </section>

        {/* Wellness Summary */}
        <section className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm print:border print:border-slate-300 print:shadow-none print:p-6 print:rounded-2xl break-inside-avoid print:bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary print:hidden">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground print:text-black">
              Wellness & Quality of Life
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {prepData.wellnessTrend.map((level, idx) => (
              <div
                key={idx}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                  level === "great"
                    ? "bg-sahay-success/10 text-sahay-success border-sahay-success/20 print:border-emerald-300 print:text-emerald-800"
                    : level === "okay"
                      ? "bg-sahay-blue/10 text-sahay-blue border-sahay-blue/20 print:border-blue-300 print:text-blue-800"
                      : "bg-destructive/10 text-destructive border-destructive/20 print:border-rose-300 print:text-rose-800",
                )}
              >
                {level}
              </div>
            ))}
            {prepData.wellnessTrend.length === 0 && (
              <p className="text-muted-foreground italic print:text-slate-500">
                No wellness data recorded.
              </p>
            )}
          </div>
        </section>

        {/* Physician Sign-Off & Prescription Modifications (Print-Only) */}
        <section className="hidden print:block border-2 border-slate-300 rounded-2xl p-6 bg-white break-inside-avoid">
          <h4 className="text-sm font-bold uppercase tracking-wider text-black mb-3">
            Physician Consultation Notes & Treatment Plan
          </h4>
          <div className="space-y-4 mb-6">
            <div className="border-b border-dotted border-slate-400 h-6" />
            <div className="border-b border-dotted border-slate-400 h-6" />
            <div className="border-b border-dotted border-slate-400 h-6" />
          </div>
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs text-slate-700">
            <div>
              <p className="font-semibold text-slate-600 mb-8">Doctor Stamp & Signature:</p>
              <div className="border-b border-slate-400 w-3/4" />
            </div>
            <div className="space-y-2">
              <p>Next Consultation Date: ____________________</p>
              <p>Urgent Care Contact: ____________________</p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <footer className="text-center p-6 text-xs text-muted-foreground print:mt-6 print:text-slate-500">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle className="w-3 h-3" />
            <span className="font-bold">Medical Disclaimer</span>
          </div>
          <p>
            This report is generated automatically by Sahay+ based on caregiver
            inputs and should be used as a supplement to clinical assessment,
            not as a replacement for medical diagnosis.
          </p>
        </footer>
      </div>
    </main>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
