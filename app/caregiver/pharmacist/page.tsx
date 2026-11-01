"use client";

import { useState, useEffect } from "react";
import {
  Pill,
  ArrowLeft,
  Clock,
  Save,
  X,
  Phone,
  MessageSquare,
  Check,
  ExternalLink,
  Copy,
  MapPin,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Calendar,
} from "lucide-react";
import { useSahay } from "@/lib/sahay-context";
import { useRouter } from "next/navigation";
import { type Medication } from "@/lib/types";

/**
 * Pharmacist Panel Page (Module 12: Shared Care Timeline & Neighborhood Chemist Refills)
 * Allows caregivers to:
 * 1. Track medication supply days remaining and identify low-stock items.
 * 2. Dispatch structured, professional 1-tap WhatsApp refill orders including patient delivery address.
 * 3. Restock supplies (+30 Days) and log events directly into the Shared Care Story Timeline.
 * 4. Record pharmacist counseling notes and storage guidelines.
 */
export default function PharmacistPage() {
  const { data, updatePharmacist, addPharmacistNote, updateRefillStatus, addTimelineEvent } = useSahay();
  const router = useRouter();

  const [editingContact, setEditingContact] = useState(false);
  const [name, setName] = useState(data.pharmacist?.name || "");
  const [phone, setPhone] = useState(data.pharmacist?.phone || "+91 98765 43210");
  const [deliveryAddress, setDeliveryAddress] = useState(
    "Flat 402, Green Acres, Andheri East, Mumbai"
  );
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(deliveryAddress);
  const [saving, setSaving] = useState(false);
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [refillScope, setRefillScope] = useState<"low_stock" | "all">("low_stock");

  // Load persisted delivery address from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sahay_delivery_address");
      if (saved) {
        setDeliveryAddress(saved);
        setAddressInput(saved);
      }
    }
  }, []);

  const chemistName = data.pharmacist?.name || "Apollo Pharmacy";
  const caregiverName = data.caregiver?.name || "Primary Caregiver";
  const seniorName = data.careReceiver?.name || "Senior";
  const chemistPhone = data.pharmacist?.phone || phone || "+91 98765 43210";
  const caregiverPhone =
    data.emergencyContacts?.find((c) => c.isPrimary)?.phone ||
    data.emergencyContacts?.[0]?.phone ||
    "";

  // Segment medications by supply urgency
  const lowSupplyMeds = data.medications.filter(
    (m) => m.refillDaysLeft !== undefined && m.refillDaysLeft <= 7
  );
  const adequateSupplyMeds = data.medications.filter(
    (m) => m.refillDaysLeft !== undefined && m.refillDaysLeft > 7
  );

  // Target medications for the batch WhatsApp refill
  const targetMeds =
    refillScope === "low_stock" && lowSupplyMeds.length > 0
      ? lowSupplyMeds
      : data.medications;

  // Build clean, professional bulleted list for WhatsApp
  const formattedMedsList =
    targetMeds.length > 0
      ? targetMeds
          .map((m) => {
            const daysText =
              m.refillDaysLeft !== undefined ? ` [${m.refillDaysLeft} days supply left]` : "";
            return `• ${m.name} (${m.dosage}) — 1 Month Supply (30 tablets)${daysText}`;
          })
          .join("\n")
      : "• Daily prescribed maintenance medications";

  const phoneSuffix = caregiverPhone ? ` (Ph: ${caregiverPhone})` : "";
  const isUrgent = refillScope === "low_stock" && lowSupplyMeds.length > 0;

  // Real-world, actionable WhatsApp refill order template
  const refillMessage =
    `Namaste ${chemistName},\n` +
    `This is ${caregiverName} caring for ${seniorName}${phoneSuffix}.\n` +
    `📍 Delivery Address: ${deliveryAddress}\n\n` +
    `📦 *MEDICATION REFILL ORDER (${isUrgent ? "URGENT - LOW STOCK" : "REGULAR REFILL"}):*\n` +
    `${formattedMedsList}\n\n` +
    `Please confirm stock availability and share the total bill. Payment via UPI / Cash upon delivery. Thank you!`;

  const cleanPhone = chemistPhone.replace(/[^0-9]/g, "");

  const handleSaveContact = () => {
    setSaving(true);
    updatePharmacist({
      name: name.trim() || undefined,
      phone: phone.trim() || undefined,
    } as any);
    setTimeout(() => {
      setSaving(false);
      setEditingContact(false);
    }, 300);
  };

  const handleSaveAddress = () => {
    if (addressInput.trim()) {
      setDeliveryAddress(addressInput.trim());
      if (typeof window !== "undefined") {
        localStorage.setItem("sahay_delivery_address", addressInput.trim());
      }
    }
    setEditingAddress(false);
  };

  const handleSendWhatsApp = (customMsg?: string) => {
    const msg = customMsg || refillMessage;
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyMessage = async (customMsg?: string) => {
    const msg = customMsg || refillMessage;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(msg);
      }
    } catch {
      // Gracefully handle environments without clipboard permissions
    }
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 3000);
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-all shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Pharmacist Panel</h1>
            <p className="text-muted-foreground text-sm">
              Neighborhood chemist orders, supply countdowns, and care timeline synchronization
            </p>
          </div>
        </div>

        {/* Shortcut to Shared Care Story Timeline */}
        <button
          onClick={() => router.push("/caregiver/timeline")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold border border-border transition-all w-fit shadow-xs"
        >
          <Clock className="w-4 h-4 text-primary" />
          <span>View Care Timeline</span>
        </button>
      </header>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Pharmacist & Delivery Address Card */}
        <section className="bg-card border-2 border-border rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border">
            {/* Pharmacy Contact Info */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sahay-blue/15 flex items-center justify-center text-2xl shrink-0">
                🏪
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Local Pharmacy</h2>
                  {!editingContact && (
                    <button
                      onClick={() => {
                        setName(data.pharmacist?.name || "");
                        setPhone(data.pharmacist?.phone || "");
                        setEditingContact(true);
                      }}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {editingContact ? (
                  <div className="space-y-2 mt-2 bg-secondary/50 p-3 rounded-xl border border-border">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Chemist / Pharmacy Name"
                      className="bg-background px-3 py-1.5 text-xs rounded-lg border border-border outline-none w-full"
                    />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="WhatsApp Number (e.g. +91 98765 43210)"
                      className="bg-background px-3 py-1.5 text-xs rounded-lg border border-border outline-none w-full"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={handleSaveContact}
                        disabled={saving}
                        className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingContact(false)}
                        className="px-3 py-1 bg-secondary text-foreground text-xs rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-base font-bold text-primary mt-0.5">{chemistName}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span>{chemistPhone}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Delivery Address Details */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-2xl shrink-0">
                📍
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Delivery Address</h2>
                  {!editingAddress && (
                    <button
                      onClick={() => {
                        setAddressInput(deliveryAddress);
                        setEditingAddress(true);
                      }}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>

                {editingAddress ? (
                  <div className="space-y-2 mt-2 bg-secondary/50 p-3 rounded-xl border border-border">
                    <input
                      type="text"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="Enter Delivery Address & Landmark"
                      className="bg-background px-3 py-1.5 text-xs rounded-lg border border-border outline-none w-full"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={handleSaveAddress}
                        className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAddress(false)}
                        className="px-3 py-1 bg-secondary text-foreground text-xs rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{deliveryAddress}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Included automatically in WhatsApp refill orders
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 1-Tap Smart WhatsApp Refill Dispatcher */}
          <div className="mt-6">
            <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider">
                    Module 12: Chemist Direct Refill
                  </span>
                  {lowSupplyMeds.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {lowSupplyMeds.length} Low Stock
                    </span>
                  )}
                </div>

                {/* Filter Scope Toggle */}
                <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-emerald-500/30 text-xs font-bold">
                  <button
                    onClick={() => setRefillScope("low_stock")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      refillScope === "low_stock"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Low Supply Only ({lowSupplyMeds.length})
                  </button>
                  <button
                    onClick={() => setRefillScope("all")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      refillScope === "all"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Medications ({data.medications.length})
                  </button>
                </div>
              </div>

              {/* Message Live Preview */}
              <div className="bg-background/80 rounded-xl p-4 border border-emerald-500/20 text-xs font-mono whitespace-pre-wrap text-foreground/90 max-h-48 overflow-y-auto">
                {refillMessage}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleCopyMessage()}
                  className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-xs"
                >
                  {copiedBatch ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedBatch ? "Copied!" : "Copy Text"}</span>
                </button>

                <button
                  onClick={() => handleSendWhatsApp()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>1-Tap WhatsApp Refill</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Medication Supply & Notes Table */}
        <section className="bg-card border-2 border-border rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Medication Notes</h3>
              <p className="text-sm text-muted-foreground">
                Monitor pill counts, restock inventory (+30 Days), and add pharmacy guidance
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full">
                {adequateSupplyMeds.length} Stocked
              </span>
              <span className="px-3 py-1 bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-full">
                {lowSupplyMeds.length} Due Soon
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Medication</th>
                  <th className="px-6 py-4">Supply Remaining</th>
                  <th className="px-6 py-4">Pharmacist Guidance</th>
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
                      deliveryAddress={deliveryAddress}
                      onUpdateRefillDays={(days) => {
                        updateRefillStatus(med.id, days);
                        addTimelineEvent(
                          "refill_noted",
                          med.id,
                          `Refill confirmed (+30 days supply added) from ${chemistName}`
                        );
                      }}
                      onAddNote={(noteText) => addPharmacistNote(med.id, noteText)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
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
  deliveryAddress: string;
  onUpdateRefillDays: (days: number) => void;
  onAddNote: (note: string) => void;
}

function MedPharmacistRow({
  med,
  chemistName,
  caregiverName,
  seniorName,
  cleanPhone,
  deliveryAddress,
  onUpdateRefillDays,
  onAddNote,
}: MedRowProps) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteInput, setNoteInput] = useState(med.pharmacistNote || "");
  const [restockedRecently, setRestockedRecently] = useState(false);

  const daysLeft = med.refillDaysLeft;
  const isLow = daysLeft !== undefined && daysLeft <= 7;
  const isCritical = daysLeft !== undefined && daysLeft <= 3;

  const singleRefillMsg =
    `Namaste ${chemistName},\n` +
    `This is ${caregiverName} caring for ${seniorName}.\n` +
    `📍 Delivery Address: ${deliveryAddress}\n\n` +
    `📦 *REFILL REQUEST:*\n` +
    `• ${med.name} (${med.dosage}) — 1 Month Supply (30 tablets)${
      daysLeft !== undefined ? ` [${daysLeft} days supply left]` : ""
    }\n\n` +
    `Please deliver when ready. Payment via UPI/Cash on delivery. Thank you!`;

  const handleSingleWhatsApp = () => {
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(singleRefillMsg)}`
      : `https://wa.me/?text=${encodeURIComponent(singleRefillMsg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleRestock = () => {
    const newCount = (daysLeft || 0) + 30;
    onUpdateRefillDays(newCount);
    setRestockedRecently(true);
    setTimeout(() => setRestockedRecently(false), 3000);
  };

  const handleSaveNote = () => {
    if (!noteInput.trim()) return;
    onAddNote(noteInput.trim());
    setIsEditingNote(false);
  };

  return (
    <tr className="hover:bg-secondary/30 transition-colors">
      {/* Medication Details */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              med.taken ? "bg-sahay-success" : "bg-sahay-pending"
            }`}
          />
          <div>
            <span className="font-bold text-foreground text-sm">{med.name}</span>
            <p className="text-xs text-muted-foreground">
              {med.dosage} · {med.timeOfDay}
            </p>
          </div>
        </div>
      </td>

      {/* Supply Status */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {daysLeft !== undefined ? (
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
                isCritical
                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 animate-pulse"
                  : isLow
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              }`}
            >
              {isCritical ? "🚨" : isLow ? "⚠️" : "📦"}
              <span>{daysLeft} days supply</span>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic px-2 py-0.5 rounded-md bg-secondary/60">
              Refill on-demand
            </span>
          )}
        </div>
      </td>

      {/* Pharmacist Guidance Note */}
      <td className="px-6 py-4">
        {isEditingNote ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="e.g. Take with warm milk, keep refrigerated"
              className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary w-full"
              autoFocus
            />
            <button
              onClick={handleSaveNote}
              className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-xs font-bold"
              title="Save note"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsEditingNote(false)}
              className="p-1.5 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-all text-xs"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p
              className={`text-xs ${
                med.pharmacistNote ? "text-foreground font-medium" : "text-muted-foreground italic"
              }`}
            >
              {med.pharmacistNote || "No instructions recorded"}
            </p>
          </div>
        )}
      </td>

      {/* Row Actions */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {/* WhatsApp Refill */}
          <button
            onClick={handleSingleWhatsApp}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border border-emerald-500/20"
            title={`Send 1-tap WhatsApp refill for ${med.name}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Refill</span>
          </button>

          {/* +30 Days Restocked */}
          <button
            onClick={handleRestock}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border ${
              restockedRecently
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-secondary text-foreground hover:bg-secondary/80 border-border"
            }`}
            title="Add +30 days supply upon delivery"
          >
            {restockedRecently ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>+30d Added</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5 text-primary" />
                <span>+30d Supply</span>
              </>
            )}
          </button>

          {/* Edit Note */}
          <button
            onClick={() => {
              setNoteInput(med.pharmacistNote || "");
              setIsEditingNote(!isEditingNote);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            {isEditingNote ? "Close" : "Note"}
          </button>
        </div>
      </td>
    </tr>
  );
}
