"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Pill,
  Clock,
  Save,
  X,
  Plus,
  ChevronRight,
  Phone,
  MessageSquare,
  Check,
  Share2,
  ExternalLink,
  Copy,
} from "lucide-react";
import { useSahay } from "@/lib/sahay-context";
import { useRouter } from "next/navigation";
import { type Medication } from "@/lib/types";
import { CaregiverLayout } from "@/components/caregiver/caregiver-layout";

/**
 * Pharmacist Panel Page (Module 12: Neighborhood Chemist Refills)
 * Allows caregivers to manage local pharmacy contacts, record pharmacist medication notes,
 * and dispatch 1-tap WhatsApp refill orders pre-populated with exact medicine and patient details.
 */
export default function PharmacistPage() {
  const { data, updatePharmacist, addPharmacistNote } = useSahay();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(data.pharmacist?.name || "");
  const [phone, setPhone] = useState(data.pharmacist?.phone || "+91 98765 43210");
  const [saving, setSaving] = useState(false);
  const [copiedBatch, setCopiedBatch] = useState(false);

  const chemistName = data.pharmacist?.name || "Apollo Pharmacy";
  const caregiverName = data.caregiver?.name || "Caregiver";
  const seniorName = data.careReceiver?.name || "Senior";
  const chemistPhone = data.pharmacist?.phone || phone || "+91 98765 43210";

  // Build medication summary for refill
  const refillMeds = data.medications.length > 0
    ? data.medications.map((m) => `${m.name} (${m.dosage})`).join(", ")
    : "Daily prescribed medications";

  // Exact Module 12 pre-populated WhatsApp message template
  const refillMessage = `Namaste ${chemistName}, this is ${caregiverName} caring for ${seniorName}. Need refill for: ${refillMeds}. Please deliver when ready.`;

  const cleanPhone = chemistPhone.replace(/[^0-9]/g, "");

  const handleSave = () => {
    setSaving(true);
    updatePharmacist({
      name: name.trim() || undefined,
      phone: phone.trim() || undefined,
    } as any);
    setTimeout(() => {
      setSaving(false);
      setEditing(false);
    }, 300);
  };

  const handleSendWhatsApp = (customMsg?: string) => {
    const msg = customMsg || refillMessage;
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyMessage = (customMsg?: string) => {
    const msg = customMsg || refillMessage;
    navigator.clipboard?.writeText(msg);
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 3000);
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <header className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Pharmacist Panel</h1>
            <p className="text-muted-foreground text-sm">
              Manage pharmacy contact, medication notes, and dispatch 1-tap WhatsApp refills
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Pharmacist Identity & 1-Tap Refill Dispatch Card */}
        <section className="bg-card border-2 border-border rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-sahay-blue/15 flex items-center justify-center text-3xl shrink-0">
                💊
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Local Pharmacy
                </h2>
                <p className="text-sm font-semibold text-primary">
                  {data.pharmacist?.name || "Apollo Pharmacy - Mumbai"}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>{data.pharmacist?.phone || "+91 98765 43210"}</span>
                  {data.pharmacist?.lastRefillConfirm && (
                    <>
                      <span>•</span>
                      <span>
                        Last Refill: {new Date(data.pharmacist.lastRefillConfirm).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {editing ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-secondary p-3 rounded-2xl border border-border">
                <div className="space-y-1.5 flex-1">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Pharmacy Name"
                    className="bg-background px-3 py-1.5 text-sm rounded-lg border border-border outline-none w-full"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="WhatsApp Phone (e.g. +91 98765 43210)"
                    className="bg-background px-3 py-1.5 text-sm rounded-lg border border-border outline-none w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                    title="Save changes"
                  >
                    {saving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="p-2.5 bg-card text-foreground rounded-xl hover:bg-secondary transition-all border border-border"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setName(data.pharmacist?.name || "");
                    setPhone(data.pharmacist?.phone || "");
                    setEditing(true);
                  }}
                  className="px-4 py-2 bg-secondary text-foreground text-sm font-semibold rounded-xl hover:bg-secondary/80 transition-all border border-border/60"
                >
                  Edit Details
                </button>
              </div>
            )}
          </div>

          {/* 1-Tap Direct WhatsApp Refill Section */}
          <div className="mt-6 pt-2">
            <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                      Module 12: Chemist Direct Refill
                    </span>
                    <span className="text-xs text-muted-foreground">Pre-Formatted WhatsApp Refill</span>
                  </div>
                  <p className="text-sm font-medium text-foreground italic bg-background/60 p-3 rounded-xl border border-emerald-500/20">
                    &ldquo;{refillMessage}&rdquo;
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => handleCopyMessage()}
                    className="px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-xs"
                    title="Copy message to clipboard"
                  >
                    {copiedBatch ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedBatch ? "Copied!" : "Copy Text"}</span>
                  </button>

                  <button
                    onClick={() => handleSendWhatsApp()}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 touch-manipulation"
                    title="Send refill request directly to chemist via WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>1-Tap WhatsApp Refill</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Medication Notes & Individual Refill Table */}
        <section className="bg-card border-2 border-border rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Medication Notes</h3>
              <p className="text-sm text-muted-foreground">
                Pharmacist guidance and single-item 1-tap re-order buttons
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1 bg-secondary rounded-full text-muted-foreground w-fit">
              {data.medications.length} Medications Tracked
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Medication</th>
                  <th className="px-6 py-4">Current Note</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.medications.length > 0 ? (
                  data.medications.map((med) => (
                    <MedPharmacistRow
                      key={med.id}
                      med={med}
                      chemistName={chemistName}
                      caregiverName={caregiverName}
                      seniorName={seniorName}
                      cleanPhone={cleanPhone}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-12 text-center text-muted-foreground italic"
                    >
                      No medications tracked yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

interface MedRowProps {
  med: Medication;
  chemistName: string;
  caregiverName: string;
  seniorName: string;
  cleanPhone: string;
}

function MedPharmacistRow({ med, chemistName, caregiverName, seniorName, cleanPhone }: MedRowProps) {
  const { addPharmacistNote } = useSahay();
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const singleRefillMsg = `Namaste ${chemistName}, this is ${caregiverName} caring for ${seniorName}. Need refill for: ${med.name} (${med.dosage}, 1 month supply). Please deliver when ready.`;

  const handleSingleWhatsApp = () => {
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(singleRefillMsg)}`
      : `https://wa.me/?text=${encodeURIComponent(singleRefillMsg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSave = () => {
    if (!note.trim()) return;
    setSaving(true);
    addPharmacistNote(med.id, note.trim());
    setTimeout(() => {
      setSaving(false);
      setNote("");
      setIsEditing(false);
    }, 300);
  };

  return (
    <tr className="hover:bg-secondary/30 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full ${med.taken ? "bg-sahay-success" : "bg-sahay-pending"}`}
          />
          <div>
            <span className="font-semibold text-foreground text-sm">{med.name}</span>
            <p className="text-xs text-muted-foreground">{med.dosage}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter pharmacist note..."
              className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary w-full"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
              title="Save note"
            >
              {saving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-all"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "text-sm",
                med.pharmacistNote ? "text-foreground" : "text-muted-foreground italic",
              )}
            >
              {med.pharmacistNote || "No note recorded"}
            </p>
            {med.pharmacistNote && <div className="w-1.5 h-1.5 rounded-full bg-sahay-blue shrink-0" />}
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleSingleWhatsApp}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            title={`Order refill for ${med.name} via WhatsApp`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Refill</span>
          </button>

          <button
            onClick={() => {
              setNote(med.pharmacistNote || "");
              setIsEditing(true);
            }}
            className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold text-primary hover:bg-secondary transition-all"
          >
            {isEditing ? "Cancel" : "Note"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
