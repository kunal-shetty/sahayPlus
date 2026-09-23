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
  Share2,
  Copy,
  Check,
  Mail,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CaregiverLayout } from "@/components/caregiver/caregiver-layout";
import { motion } from "motion/react";

/**
 * Doctor Visit Prep Page
 * Generates a professional, structured summary for the next medical appointment
 * with interactive 7 to 30 day reporting windows and 1-tap sharing options.
 */
export default function DoctorPrepPage() {
  const { getDoctorPrepData } = useSahay();
  const router = useRouter();

  const [daysRange, setDaysRange] = useState<7 | 14 | 30>(7);
  const [copied, setCopied] = useState(false);
  const prepData = getDoctorPrepData(daysRange);

  const generateShareText = () => {
    const changesText =
      prepData.changes.length > 0
        ? prepData.changes.map((c) => `• ${c.medicationName}: ${c.note} (${c.date})`).join("\n")
        : "• No significant dosage changes recorded.";

    const notesText =
      prepData.observations.length > 0
        ? prepData.observations.map((o) => `• ${o}`).join("\n")
        : "• No clinical notes recorded.";

    return `*SAHAY+ PATIENT CARE SUMMARY (${daysRange}-DAY REPORT)*\n` +
      `Generated: ${new Date().toLocaleDateString()}\n\n` +
      `📊 *CLINICAL HIGHLIGHTS:*\n` +
      `• Medication Adherence: ${prepData.adherenceRate}%\n` +
      `• Wellness Trend: ${prepData.wellnessTrend.join(", ") || "Stable"}\n\n` +
      `💊 *ROUTINE & DOSAGE CHANGES:*\n${changesText}\n\n` +
      `📝 *RECENT OBSERVATIONS:*\n${notesText}\n\n` +
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
    <main className="min-h-screen bg-background p-6">
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

      <div className="max-w-4xl mx-auto space-y-8 print:space-y-6">
        {/* Report Header */}
        <section className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm print:border-0 print:shadow-none print:p-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-primary">
                Patient Care Summary ({daysRange}-Day Overview)
              </h2>
              <p className="text-muted-foreground mt-1">
                Generated on{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                · Window: Last {daysRange} days
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground">
                Caregiver Report
              </div>
              <div className="text-lg font-bold">Sahay+ Health System</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border">
            <div className="p-4 bg-secondary/30 rounded-2xl">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                Avg. Adherence
              </p>
              <p className="text-2xl font-bold text-sahay-success">
                {prepData.adherenceRate}%
              </p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-2xl">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                Wellness Trend
              </p>
              <p className="text-2xl font-bold capitalize">
                {prepData.wellnessTrend[0] || "No data"}
              </p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-2xl">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                Recent Notes
              </p>
              <p className="text-2xl font-bold">
                {prepData.observations.length} entries
              </p>
            </div>
          </div>
        </section>

        {/* Medication Changes */}
        <section className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm print:border-0 print:shadow-none print:p-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Routine Changes & Adjustments</h3>
          </div>

          {prepData.changes.length > 0 ? (
            <div className="space-y-4">
              {prepData.changes.map((change, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 bg-secondary/20 rounded-2xl border border-border"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="font-bold">{change.medicationName}</p>
                    <p className="text-sm text-foreground/80">{change.note}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Date of change: {change.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">
              No significant dose changes recorded in the recent period.
            </p>
          )}
        </section>

        {/* Clinical Observations */}
        <section className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm print:border-0 print:shadow-none print:p-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Clinical Observations & Notes</h3>
          </div>

          {prepData.observations.length > 0 ? (
            <ul className="space-y-3">
              {prepData.observations.map((obs, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-secondary/10 rounded-xl border border-border/50"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                  <p className="text-foreground leading-relaxed">{obs}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic">
              No recent care notes recorded.
            </p>
          )}
        </section>

        {/* Wellness Summary */}
        <section className="bg-card border-2 border-border rounded-3xl p-8 shadow-sm print:border-0 print:shadow-none print:p-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Wellness & Quality of Life</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {prepData.wellnessTrend.map((level, idx) => (
              <div
                key={idx}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                  level === "great"
                    ? "bg-sahay-success/10 text-sahay-success border-sahay-success/20"
                    : level === "okay"
                      ? "bg-sahay-blue/10 text-sahay-blue border-sahay-blue/20"
                      : "bg-destructive/10 text-destructive border-destructive/20",
                )}
              >
                {level}
              </div>
            ))}
            {prepData.wellnessTrend.length === 0 && (
              <p className="text-muted-foreground italic">
                No wellness data recorded.
              </p>
            )}
          </div>
        </section>

        {/* Disclaimer */}
        <footer className="text-center p-6 text-xs text-muted-foreground print:mt-12">
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
