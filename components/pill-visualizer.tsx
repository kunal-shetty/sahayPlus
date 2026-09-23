"use client";

/**
 * @file pill-visualizer.tsx
 * @description High-contrast, realistic pill visualizer tailored for elderly care receivers.
 * Renders the exact color, shape, and 3D pill appearance chosen by the caregiver,
 * along with a clear readable text badge (e.g. "Yellow • Oval Tablet").
 */

import React from "react";
import { type MedicationColor, type MedicationShape } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PillVisualizerProps {
  color?: MedicationColor;
  shape?: MedicationShape;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  className?: string;
}

const COLOR_MAP: Record<
  MedicationColor,
  {
    bg: string;
    border: string;
    shadow: string;
    text: string;
    badgeBg: string;
    badgeBorder: string;
    dotEmoji: string;
    label: string;
  }
> = {
  white: {
    bg: "from-slate-50 via-white to-slate-200",
    border: "border-slate-300 dark:border-slate-600",
    shadow: "shadow-slate-400/30",
    text: "text-slate-800 dark:text-slate-100",
    badgeBg: "bg-slate-100 dark:bg-slate-800",
    badgeBorder: "border-slate-300 dark:border-slate-700",
    dotEmoji: "⚪",
    label: "White",
  },
  blue: {
    bg: "from-sky-300 via-sky-400 to-blue-500",
    border: "border-blue-400 dark:border-blue-600",
    shadow: "shadow-blue-500/40",
    text: "text-blue-900 dark:text-blue-200",
    badgeBg: "bg-blue-50 dark:bg-blue-950/50",
    badgeBorder: "border-blue-200 dark:border-blue-800",
    dotEmoji: "🔵",
    label: "Blue",
  },
  pink: {
    bg: "from-pink-300 via-pink-400 to-rose-500",
    border: "border-pink-400 dark:border-pink-600",
    shadow: "shadow-pink-500/40",
    text: "text-pink-900 dark:text-pink-200",
    badgeBg: "bg-pink-50 dark:bg-pink-950/50",
    badgeBorder: "border-pink-200 dark:border-pink-800",
    dotEmoji: "🌸",
    label: "Pink",
  },
  yellow: {
    bg: "from-amber-200 via-yellow-300 to-amber-400",
    border: "border-amber-400 dark:border-amber-500",
    shadow: "shadow-amber-400/50",
    text: "text-amber-900 dark:text-amber-200",
    badgeBg: "bg-amber-50 dark:bg-amber-950/50",
    badgeBorder: "border-amber-200 dark:border-amber-800",
    dotEmoji: "🟡",
    label: "Yellow",
  },
  orange: {
    bg: "from-amber-400 via-orange-400 to-orange-500",
    border: "border-orange-400 dark:border-orange-600",
    shadow: "shadow-orange-500/40",
    text: "text-orange-900 dark:text-orange-200",
    badgeBg: "bg-orange-50 dark:bg-orange-950/50",
    badgeBorder: "border-orange-200 dark:border-orange-800",
    dotEmoji: "🟠",
    label: "Orange",
  },
  green: {
    bg: "from-emerald-300 via-emerald-400 to-green-500",
    border: "border-emerald-400 dark:border-emerald-600",
    shadow: "shadow-emerald-500/40",
    text: "text-emerald-900 dark:text-emerald-200",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/50",
    badgeBorder: "border-emerald-200 dark:border-emerald-800",
    dotEmoji: "🟢",
    label: "Green",
  },
  red: {
    bg: "from-rose-400 via-red-500 to-rose-600",
    border: "border-rose-500 dark:border-rose-700",
    shadow: "shadow-rose-600/40",
    text: "text-rose-950 dark:text-rose-200",
    badgeBg: "bg-rose-50 dark:bg-rose-950/50",
    badgeBorder: "border-rose-200 dark:border-rose-800",
    dotEmoji: "🔴",
    label: "Red",
  },
};

const SHAPE_LABELS: Record<MedicationShape, string> = {
  round: "Round Tablet",
  oval: "Oval Tablet",
  capsule: "Capsule",
  rectangle: "Oblong Tab",
};

export function PillVisualizer({
  color = "yellow",
  shape = "oval",
  size = "lg",
  showLabel = true,
  className,
}: PillVisualizerProps) {
  const c = COLOR_MAP[color] || COLOR_MAP.white;
  const shapeLabel = SHAPE_LABELS[shape] || "Tablet";

  // Size dimensions for container and pill (tuned for elderly visibility)
  const sizeConfig = {
    sm: { container: "w-16 h-16", pillRound: "w-9 h-9", pillOval: "w-11 h-7", pillCap: "w-12 h-6", pillRect: "w-11 h-6", text: "text-xs" },
    md: { container: "w-24 h-24", pillRound: "w-14 h-14", pillOval: "w-18 h-10", pillCap: "w-20 h-9", pillRect: "w-18 h-9", text: "text-sm" },
    lg: { container: "w-36 h-36", pillRound: "w-20 h-20", pillOval: "w-26 h-14", pillCap: "w-28 h-12", pillRect: "w-26 h-13", text: "text-base" },
    xl: { container: "w-52 h-52 sm:w-60 sm:h-60", pillRound: "w-32 h-32 sm:w-36 sm:h-36", pillOval: "w-40 h-24 sm:w-48 sm:h-28", pillCap: "w-44 h-20 sm:w-50 sm:h-22", pillRect: "w-40 h-22 sm:w-46 sm:h-24", text: "text-base sm:text-lg" },
  }[size];

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {/* Pill 3D Illustration Container */}
      <div
        className={cn(
          "rounded-3xl flex items-center justify-center relative p-3 bg-muted/30 border-2 border-border/80 shadow-md",
          sizeConfig.container
        )}
      >
        {/* Soft background glow matching color */}
        <div
          className={cn(
            "absolute inset-3 rounded-full opacity-35 blur-xl -z-10 bg-gradient-to-br",
            c.bg
          )}
        />

        {/* Shape: Round */}
        {shape === "round" && (
          <div
            className={cn(
              "rounded-full bg-gradient-to-br border-2 shadow-lg relative flex items-center justify-center overflow-hidden transition-all",
              c.bg,
              c.border,
              c.shadow,
              sizeConfig.pillRound
            )}
          >
            {/* Top Gloss Reflection */}
            <div className="absolute top-1 left-2 right-2 h-1/3 bg-white/40 rounded-full blur-[1px]" />
            {/* Center Debossed Score Line */}
            <div className="w-full h-[2px] bg-black/15 shadow-[0_1px_1px_rgba(255,255,255,0.4)]" />
          </div>
        )}

        {/* Shape: Oval */}
        {shape === "oval" && (
          <div
            className={cn(
              "rounded-full bg-gradient-to-br border-2 shadow-lg relative flex items-center justify-center overflow-hidden transition-all",
              c.bg,
              c.border,
              c.shadow,
              sizeConfig.pillOval
            )}
          >
            {/* Top Gloss Reflection */}
            <div className="absolute top-1 left-3 right-3 h-1/3 bg-white/45 rounded-full blur-[1px]" />
            {/* Center Debossed Score Line */}
            <div className="w-[2px] h-full bg-black/15 shadow-[1px_0_1px_rgba(255,255,255,0.4)]" />
          </div>
        )}

        {/* Shape: Capsule */}
        {shape === "capsule" && (
          <div
            className={cn(
              "rounded-full bg-gradient-to-br border-2 shadow-lg relative flex items-center justify-between overflow-hidden transition-all",
              c.bg,
              c.border,
              c.shadow,
              sizeConfig.pillCap
            )}
          >
            {/* Top Gloss Reflection */}
            <div className="absolute top-1 left-3 right-3 h-2/5 bg-white/40 rounded-full blur-[1px]" />
            {/* Two-tone Cap Seam */}
            <div className="w-1/2 h-full bg-black/10 border-r-2 border-white/50" />
            <div className="w-1/2 h-full bg-white/10" />
          </div>
        )}

        {/* Shape: Rectangle / Oblong Tab */}
        {shape === "rectangle" && (
          <div
            className={cn(
              "rounded-xl bg-gradient-to-br border-2 shadow-lg relative flex items-center justify-center overflow-hidden transition-all",
              c.bg,
              c.border,
              c.shadow,
              sizeConfig.pillRect
            )}
          >
            {/* Top Gloss Reflection */}
            <div className="absolute top-1 left-2 right-2 h-1/3 bg-white/40 rounded-lg blur-[1px]" />
            {/* Center Debossed Score Line */}
            <div className="w-[2px] h-full bg-black/15 shadow-[1px_0_1px_rgba(255,255,255,0.4)]" />
          </div>
        )}
      </div>

      {/* Pill Visual Label Tag */}
      {showLabel && (
        <div
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border font-bold shadow-xs",
            c.badgeBg,
            c.badgeBorder,
            c.text,
            sizeConfig.text
          )}
        >
          <span>{c.dotEmoji}</span>
          <span>{c.label} • {shapeLabel}</span>
        </div>
      )}
    </div>
  );
}

/**
 * PillBadge component for compact inline visual display (color dot + color name + shape name).
 */
export function PillBadge({
  color = "yellow",
  shape = "oval",
  className,
  size = "md",
}: {
  color?: MedicationColor;
  shape?: MedicationShape;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const c = COLOR_MAP[color] || COLOR_MAP.white;
  const shapeLabel = SHAPE_LABELS[shape] || "Tablet";
  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs font-semibold",
    md: "px-3.5 py-1 text-sm sm:text-base font-bold",
    lg: "px-4 py-1.5 text-base sm:text-lg font-extrabold",
  }[size];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border shadow-xs tracking-tight",
        c.badgeBg,
        c.badgeBorder,
        c.text,
        sizeClasses,
        className
      )}
    >
      <span>{c.dotEmoji}</span>
      <span>{c.label} • {shapeLabel}</span>
    </div>
  );
}
