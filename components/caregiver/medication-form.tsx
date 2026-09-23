"use client";

/**
 * @file medication-form.tsx
 * @description The Medication Form component for Caregivers.
 * This component provides a comprehensive interface for adding new medications
 * or editing existing ones. It includes fields for dosage, time of day,
 * specific timing, notes, and refill awareness.
 *
 * The form is designed with large, accessible inputs and clear actions to
 * minimize cognitive load for caregivers who may be adding medications in
 * stressful or hurried situations.
 */

import { useState } from "react";
import { useSahay } from "@/lib/sahay-context";
import {
  type TimeOfDay,
  type Medication,
  type MedicationColor,
  type MedicationShape,
  type FoodInstruction,
  timeOfDayLabels,
} from "@/lib/types";
import {
  ArrowLeft,
  Check,
  Trash2,
  Sun,
  Cloud,
  Moon,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  Utensils,
  Coffee,
  Clock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getLocalMedMeta } from "@/lib/medication-meta";

/**
 * Props for the MedicationForm component.
 *
 * @interface MedicationFormProps
 * @property {Medication | null} [medication] - The medication object to edit. If omitted, the form is in "add" mode.
 * @property {() => void} onClose - Callback function to close the form and return to the previous view.
 */
interface MedicationFormProps {
  medication?: Medication | null;
  onClose: () => void;
}

/**
 * MedicationForm component.
 * Provides a full-screen form for managing medications with dosage, schedules,
 * visual pill identification (photo & color tags), food instructions, and refill tracking.
 *
 * @param {MedicationFormProps} props - Component props.
 * @returns {JSX.Element} The medication entry/edit interface.
 */
export function MedicationForm({ medication, onClose }: MedicationFormProps) {
  const {
    addMedication,
    updateMedication,
    removeMedication,
    updateRefillStatus,
  } = useSahay();
  const isEditing = !!medication;
  const localMeta = medication ? getLocalMedMeta(medication.id, medication.name) : null;

  const [name, setName] = useState(medication?.name || "");
  const [dosage, setDosage] = useState(medication?.dosage || "");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(
    medication?.timeOfDay || "morning",
  );
  const [notes, setNotes] = useState(medication?.notes || "");
  const [simpleExplanation, setSimpleExplanation] = useState(
    medication?.simpleExplanation || localMeta?.simpleExplanation || ""
  );
  const [time, setTime] = useState(medication?.time || "");
  const [refillDaysLeft, setRefillDaysLeft] = useState<number | undefined>(
    medication?.refillDaysLeft,
  );
  const [color, setColor] = useState<MedicationColor>(
    medication?.color || localMeta?.color || "yellow",
  );
  const [shape, setShape] = useState<MedicationShape>(
    medication?.shape || localMeta?.shape || "oval",
  );
  const [imageUrl, setImageUrl] = useState<string>(
    medication?.imageUrl || localMeta?.imageUrl || "",
  );
  const [foodInstruction, setFoodInstruction] = useState<FoodInstruction>(
    medication?.foodInstruction || localMeta?.foodInstruction || "after_meal",
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /**
   * Resizes and compresses uploaded photos via HTML5 canvas
   * so they fit into storage and API payloads effortlessly (~25KB).
   */
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.75);
          setImageUrl(compressed);
        } else {
          setImageUrl(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  /**
   * Validates and persists the medication data.
   * If in edit mode, updates the existing medication; otherwise, adds a new one.
   * Also updates the refill status if a refill value is provided.
   */
  const handleSubmit = () => {
    if (!name.trim() || !dosage.trim()) return;

    if (isEditing && medication) {
      updateMedication(medication.id, {
        name: name.trim(),
        dosage: dosage.trim(),
        timeOfDay,
        time: time || undefined,
        notes: notes.trim() || undefined,
        simpleExplanation: simpleExplanation.trim() || undefined,
        refillDaysLeft,
        color,
        shape,
        imageUrl: imageUrl || undefined,
        foodInstruction,
      });
      if (refillDaysLeft !== undefined) {
        updateRefillStatus(medication.id, refillDaysLeft);
      }
    } else {
      addMedication({
        name: name.trim(),
        dosage: dosage.trim(),
        timeOfDay,
        time: time || undefined,
        notes: notes.trim() || undefined,
        simpleExplanation: simpleExplanation.trim() || undefined,
        refillDaysLeft,
        color,
        shape,
        imageUrl: imageUrl || undefined,
        foodInstruction,
      });
    }
    onClose();
  };

  /**
   * Removes the current medication from the system and closes the form.
   */
  const handleDelete = () => {
    if (medication) {
      removeMedication(medication.id);
      onClose();
    }
  };

  /** Mapping of time of day slugs to their corresponding Lucide icons. */
  const timeIcons: Record<TimeOfDay, typeof Sun> = {
    morning: Sun,
    afternoon: Cloud,
    evening: Moon,
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b border-border">
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center
                   hover:bg-secondary/80 transition-colors touch-manipulation
                   focus:outline-none focus:ring-2 focus:ring-sahay-sage"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">
          {isEditing ? "Edit medication" : "Add medication"}
        </h1>
      </header>

      {/* Form content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          {/* Medication name */}
          <div>
            <label
              htmlFor="medName"
              className="block text-lg font-medium text-foreground mb-2"
            >
              Medication name
            </label>
            <input
              id="medName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Aspirin"
              className="w-full px-4 py-4 text-lg bg-input border-2 border-border rounded-xl
                       focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                       placeholder:text-muted-foreground/60"
              autoComplete="off"
            />
          </div>

          {/* Dosage */}
          <div>
            <label
              htmlFor="medDosage"
              className="block text-lg font-medium text-foreground mb-2"
            >
              Dosage
            </label>
            <input
              id="medDosage"
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 1 tablet"
              className="w-full px-4 py-4 text-lg bg-input border-2 border-border rounded-xl
                       focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                       placeholder:text-muted-foreground/60"
              autoComplete="off"
            />
          </div>

          {/* Time of day */}
          <div>
            <label className="block text-lg font-medium text-foreground mb-3">
              When should it be taken?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(timeOfDayLabels) as TimeOfDay[]).map((time) => {
                const Icon = timeIcons[time];
                const isSelected = timeOfDay === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setTimeOfDay(time)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                              touch-manipulation focus:outline-none focus:ring-2 focus:ring-sahay-sage
                              ${
                                isSelected
                                  ? "border-sahay-sage bg-sahay-sage-light"
                                  : "border-border bg-card hover:border-sahay-sage/50"
                              }`}
                    aria-pressed={isSelected}
                  >
                    <Icon
                      className={`w-6 h-6 ${isSelected ? "text-sahay-sage" : "text-muted-foreground"}`}
                      strokeWidth={1.5}
                    />
                    <span
                      className={`text-base font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {timeOfDayLabels[time]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specific Time (optional) */}
          <div>
            <label
              htmlFor="medTime"
              className="block text-lg font-medium text-foreground mb-2"
            >
              Exact time{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <input
              id="medTime"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-4 text-lg bg-input border-2 border-border rounded-xl
                       focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                       placeholder:text-muted-foreground/60"
            />
            <p className="text-muted-foreground text-sm mt-2">
              Helps us send more precise reminders
            </p>
          </div>

          {/* Medicine Description & Instructions for Senior */}
          <div>
            <label
              htmlFor="medExplanation"
              className="block text-lg font-medium text-foreground mb-2"
            >
              Medicine Description / Instructions for Senior
            </label>
            <textarea
              id="medExplanation"
              rows={2}
              value={simpleExplanation}
              onChange={(e) => setSimpleExplanation(e.target.value)}
              placeholder="e.g., Take 1 tablet with a full glass of water after breakfast"
              className="w-full px-4 py-3 text-lg bg-input border-2 border-border rounded-xl
                       focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                       placeholder:text-muted-foreground/60 resize-none"
            />
            <p className="text-muted-foreground text-sm mt-1.5">
              Shown in large text directly on the senior&apos;s screen and during intake reminders
            </p>
          </div>

          {/* Caregiver Notes (optional) */}
          <div>
            <label
              htmlFor="medNotes"
              className="block text-lg font-medium text-foreground mb-2"
            >
              Caregiver Notes{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <input
              id="medNotes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Doctor advised checking blood sugar"
              className="w-full px-4 py-4 text-lg bg-input border-2 border-border rounded-xl
                       focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                       placeholder:text-muted-foreground/60"
              autoComplete="off"
            />
          </div>

          {/* Meal / Food Instruction */}
          <div>
            <label className="block text-lg font-medium text-foreground mb-2">
              Food & Meal Timing
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "before_meal" as FoodInstruction, label: "Before Meal", desc: "Empty stomach", icon: Coffee },
                { id: "with_meal" as FoodInstruction, label: "With Meal", desc: "With food", icon: Utensils },
                { id: "after_meal" as FoodInstruction, label: "After Meal", desc: "After eating", icon: Utensils },
                { id: "anytime" as FoodInstruction, label: "Anytime", desc: "No restriction", icon: Clock },
              ].map((item) => {
                const isSelected = foodInstruction === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFoodInstruction(item.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all",
                      isSelected
                        ? "border-sahay-sage bg-sahay-sage/10 text-sahay-sage-dark font-semibold shadow-sm"
                        : "border-border bg-card hover:border-sahay-sage/40 text-muted-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-[11px] opacity-75">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Pill Identification: Color & Shape */}
          <div className="bg-muted/40 p-4 rounded-2xl border border-border/80 space-y-4">
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                Pill Visual Color Tag
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { id: "white" as MedicationColor, label: "White", bg: "bg-white", ring: "ring-slate-300" },
                  { id: "blue" as MedicationColor, label: "Blue", bg: "bg-blue-400", ring: "ring-blue-500" },
                  { id: "pink" as MedicationColor, label: "Pink", bg: "bg-pink-400", ring: "ring-pink-500" },
                  { id: "yellow" as MedicationColor, label: "Yellow", bg: "bg-amber-300", ring: "ring-amber-400" },
                  { id: "orange" as MedicationColor, label: "Orange", bg: "bg-orange-400", ring: "ring-orange-500" },
                  { id: "green" as MedicationColor, label: "Green", bg: "bg-emerald-400", ring: "ring-emerald-500" },
                  { id: "red" as MedicationColor, label: "Red", bg: "bg-rose-500", ring: "ring-rose-600" },
                ].map((c) => {
                  const isSelected = color === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id)}
                      className={cn(
                        "w-9 h-9 rounded-full border border-black/10 flex items-center justify-center transition-all",
                        c.bg,
                        isSelected ? "scale-110 shadow-md ring-2 ring-offset-2 ring-sahay-sage" : "opacity-80 hover:opacity-100"
                      )}
                      title={c.label}
                      aria-label={`Pill color ${c.label}`}
                    >
                      {isSelected && (
                        <Check className={cn("w-4 h-4", c.id === "white" || c.id === "yellow" ? "text-slate-800" : "text-white")} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pill Shape */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Pill Shape
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "round" as MedicationShape, label: "Round", shapeClass: "w-5 h-5 rounded-full" },
                  { id: "oval" as MedicationShape, label: "Oval", shapeClass: "w-6 h-4 rounded-full" },
                  { id: "capsule" as MedicationShape, label: "Capsule", shapeClass: "w-7 h-3 rounded-full" },
                  { id: "rectangle" as MedicationShape, label: "Tab", shapeClass: "w-6 h-3.5 rounded-sm" },
                ].map((s) => {
                  const isSelected = shape === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setShape(s.id)}
                      className={cn(
                        "flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border transition-all",
                        isSelected
                          ? "border-sahay-sage bg-sahay-sage/10 text-sahay-sage-dark font-medium"
                          : "border-border bg-card text-muted-foreground hover:border-sahay-sage/40"
                      )}
                    >
                      <div className={cn("border border-foreground/30 bg-muted mb-1.5", s.shapeClass)} />
                      <span className="text-xs">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pill Photo Upload */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Pill Photo (Helps Senior Recognize)
              </label>
              {imageUrl ? (
                <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Pill preview"
                    className="w-16 h-16 rounded-lg object-cover border border-border shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">Photo attached</p>
                    <p className="text-xs text-muted-foreground">Will appear on senior intake cards</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                    title="Remove photo"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border hover:border-sahay-sage rounded-xl cursor-pointer bg-card/60 transition-colors">
                  <Camera className="w-5 h-5 text-sahay-sage" />
                  <span className="text-sm font-medium text-foreground">Upload or Snap Pill Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Refill awareness (optional) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
              <label
                htmlFor="medRefill"
                className="text-lg font-medium text-foreground"
              >
                Refill awareness{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
            </div>
            <p className="text-muted-foreground text-sm mb-3">
              No need to count pills - just a gentle awareness of when refill
              might be needed
            </p>
            <div className="flex items-center gap-3">
              <input
                id="medRefill"
                type="number"
                min={0}
                max={90}
                value={refillDaysLeft ?? ""}
                onChange={(e) =>
                  setRefillDaysLeft(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                placeholder="Days left"
                className="w-32 px-4 py-3 text-lg bg-input border-2 border-border rounded-xl
                         focus:outline-none focus:border-sahay-sage focus:ring-2 focus:ring-sahay-sage/20
                         placeholder:text-muted-foreground/60"
              />
              <span className="text-muted-foreground">
                days of supply remaining
              </span>
            </div>
            {refillDaysLeft !== undefined && refillDaysLeft <= 7 && (
              <p className="mt-2 text-sahay-pending text-sm">
                This medication may need a refill soon
              </p>
            )}
          </div>

          {/* Delete button (only when editing) */}
          {isEditing && !showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 px-4 text-destructive text-lg font-medium
                       rounded-xl border-2 border-destructive/30 bg-destructive/5
                       hover:bg-destructive/10 transition-colors touch-manipulation
                       focus:outline-none focus:ring-2 focus:ring-destructive"
            >
              Remove this medication
            </button>
          )}

          {/* Delete confirmation */}
          {isEditing && showDeleteConfirm && (
            <div className="p-4 bg-destructive/10 rounded-xl border-2 border-destructive/30">
              <p className="text-foreground mb-4">
                Are you sure you want to remove {medication?.name}?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 px-4 bg-secondary text-foreground font-medium
                           rounded-xl transition-colors touch-manipulation
                           focus:outline-none focus:ring-2 focus:ring-sahay-sage"
                >
                  Keep it
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 py-3 px-4 bg-destructive text-destructive-foreground font-medium
                           rounded-xl flex items-center justify-center gap-2 transition-colors touch-manipulation
                           focus:outline-none focus:ring-2 focus:ring-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with save button */}
      <footer className="p-6 border-t border-border bg-card">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !dosage.trim()}
            className="w-full py-4 px-6 bg-primary text-primary-foreground text-lg font-semibold
                     rounded-xl flex items-center justify-center gap-2 transition-all
                     hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                     touch-manipulation focus:outline-none focus:ring-2 focus:ring-sahay-sage focus:ring-offset-2"
          >
            <Check className="w-5 h-5" />
            {isEditing ? "Save changes" : "Add medication"}
          </button>
        </div>
      </footer>
    </main>
  );
}
