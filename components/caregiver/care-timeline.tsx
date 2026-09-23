"use client";

/**
 * @file care-timeline.tsx
 * @description The Care Timeline component for Caregivers.
 * Instead of a rigid checklist of "missed" tasks, this component presents
 * medication and wellness activities as a "Care Story." It focuses on a
 * chronological narrative where past events gently fade in opacity,
 * emphasizing the current state of care over past failures.
 */

import { useState, useMemo } from "react";
import { useSahay } from "@/lib/sahay-context";
import { type TimelineEvent } from "@/lib/types";
import {
  Check,
  AlertCircle,
  RefreshCw,
  Plus,
  Minus,
  FileText,
  Phone,
  Moon,
  ArrowLeft,
  ShieldAlert,
  Heart,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CareTimeline component.
 * Renders a vertical timeline of all recorded care events, grouped by date
 * and sorted by timestamp, with search and category filtering (Medicines, Alerts, Notes).
 *
 * @param { { onClose: () => void } } props - Component props.
 * @returns {JSX.Element} The chronological care story interface.
 */
export function CareTimeline({ onClose }: { onClose: () => void }) {
  const { data } = useSahay();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "medicines" | "alerts" | "notes">("all");

  /** Filter timeline events by selected category and search keyword. */
  const filteredTimeline = useMemo(() => {
    return (data.timeline || []).filter((event) => {
      // 1. Filter by Category
      if (selectedFilter === "medicines") {
        const medTypes = [
          "medication_taken",
          "medication_skipped",
          "dose_changed",
          "medication_added",
          "medication_removed",
          "refill_noted",
        ];
        if (!medTypes.includes(event.type)) return false;
      } else if (selectedFilter === "alerts") {
        const alertTypes = [
          "help_requested",
          "safety_check_triggered",
          "safety_check_escalated",
          "medication_skipped",
        ];
        if (!alertTypes.includes(event.type)) return false;
      } else if (selectedFilter === "notes") {
        const noteTypes = [
          "note_added",
          "check_in",
          "safety_check_dismissed",
        ];
        if (!noteTypes.includes(event.type) && !event.note) return false;
      }

      // 2. Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const medMatch = event.medicationName?.toLowerCase().includes(q);
        const noteMatch = event.note?.toLowerCase().includes(q);
        const typeMatch = event.type.replace(/_/g, " ").toLowerCase().includes(q);
        if (!medMatch && !noteMatch && !typeMatch) return false;
      }

      return true;
    });
  }, [data.timeline, selectedFilter, searchQuery]);

  /** Grouping events by date (YYYY-MM-DD) for structural rendering. */
  const groupedEvents: Record<string, TimelineEvent[]> = {};

  for (const event of filteredTimeline) {
    const date = new Date(event.timestamp).toISOString().split("T")[0];
    if (!groupedEvents[date]) {
      groupedEvents[date] = [];
    }
    groupedEvents[date].push(event);
  }

  /** Sort dates in descending order (most recent first). */
  const sortedDays = Object.keys(groupedEvents).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  /**
   * Calculates opacity for a given date to create a "fading past" effect.
   * More recent dates are opaque, while older dates gradually fade.
   *
   * @param {string} date - The date string (YYYY-MM-DD).
   * @returns {number} Opacity value between 0.4 and 1.0.
   */
  const getOpacity = (date: string) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffDays = Math.floor(
      (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) return 1;
    if (diffDays <= 2) return 0.9;
    if (diffDays <= 5) return 0.7;
    if (diffDays <= 10) return 0.5;
    return 0.4;
  };

  /**
   * Maps an event type to its corresponding visual icon.
   *
   * @param {TimelineEvent['type']} type - The event type slug.
   * @returns {typeof Check | typeof AlertCircle | ...} The Lucide icon component.
   */
  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "medication_taken":
        return Check;
      case "medication_skipped":
        return AlertCircle;
      case "dose_changed":
        return RefreshCw;
      case "medication_added":
        return Plus;
      case "medication_removed":
        return Minus;
      case "refill_noted":
        return RefreshCw;
      case "note_added":
        return FileText;
      case "check_in":
        return Phone;
      case "day_closed":
        return Moon;
      case "safety_check_triggered":
      case "safety_check_dismissed":
      case "safety_check_escalated":
        return ShieldAlert;
      case "help_requested":
        return Heart;
      default:
        return Check;
    }
  };

  /**
   * Generates a human-readable summary for a specific timeline event.
   *
   * @param {TimelineEvent} event - The timeline event object.
   * @returns {string} A descriptive message of the activity.
   */
  const getEventMessage = (event: TimelineEvent): string => {
    switch (event.type) {
      case "medication_taken":
        return `${event.medicationName || "Medication"} taken`;
      case "medication_skipped":
        return `${event.medicationName || "Medication"} noted as skipped`;
      case "dose_changed":
        return `${event.medicationName || "Medication"} dosage adjusted`;
      case "medication_added":
        return `${event.medicationName || "Medication"} added to routine`;
      case "medication_removed":
        return `${event.medicationName || "Medication"} removed from routine`;
      case "refill_noted":
        return `Refill noted for ${event.medicationName || "medication"}`;
      case "note_added":
        return event.note || "Note added";
      case "check_in":
        return "Check-in completed";
      case "day_closed":
        return event.note || "Day's routine completed";
      case "safety_check_triggered":
        return "Safety check started";
      case "safety_check_dismissed":
        return "Confirmed they are okay";
      case "safety_check_escalated":
        return "Safety check escalated - no response";
      case "help_requested":
        return event.note || "Care receiver requested help";
      default:
        return "Activity recorded";
    }
  };

  /**
   * Formats a date string into a friendly relative label (Today, Yesterday, etc.).
   *
   * @param {string} dateStr - The ISO date string.
   * @returns {string} The formatted date label.
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  /**
   * Formats a timestamp into a concise time string (e.g., "10:30 AM").
   *
   * @param {string} timestamp - The ISO timestamp string.
   * @returns {string} The formatted time.
   */
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-6 pb-4 border-b border-border space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center
                     hover:bg-secondary/80 transition-colors touch-manipulation
                     focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Care Story
            </h1>
            <p className="text-muted-foreground text-sm">
              A gentle record of your care journey
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities, medicine, notes..."
            className="w-full pl-11 pr-10 py-2.5 bg-secondary/60 border border-border rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(
            [
              { id: "all", label: "All" },
              { id: "medicines", label: "Medicines" },
              { id: "alerts", label: "Alerts" },
              { id: "notes", label: "Notes" },
            ] as const
          ).map((tab) => {
            const active = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0",
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-6">
        {sortedDays.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-medium text-foreground">
              {searchQuery || selectedFilter !== "all"
                ? "No matching activities found"
                : "Your care story will appear here"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || selectedFilter !== "all"
                ? "Try clearing your search query or selecting a different filter."
                : "Activities are recorded as they happen"}
            </p>
            {(searchQuery || selectedFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFilter("all");
                }}
                className="mt-4 px-4 py-2 bg-secondary text-foreground text-xs font-bold rounded-xl hover:bg-secondary/80 transition-all"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDays.map((day) => {
              const events = groupedEvents[day];
              const opacity = getOpacity(day);

              return (
                <section
                  key={day}
                  style={{ opacity }}
                  className="transition-opacity duration-300"
                >
                  {/* Day header */}
                  <h2 className="text-lg font-medium text-foreground mb-4 sticky top-0 bg-background py-2">
                    {formatDate(day)}
                  </h2>

                  {/* Events for this day */}
                  <div className="space-y-3 pl-4 border-l-2 border-border">
                    {events
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime(),
                      )
                      .map((event) => {
                        const Icon = getEventIcon(event.type);
                        const isPositive = [
                          "medication_taken",
                          "day_closed",
                          "check_in",
                        ].includes(event.type);

                        return (
                          <div
                            key={event.id}
                            className="flex items-start gap-3 pl-4 -ml-[9px]"
                          >
                            {/* Event dot/icon */}
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                        ${isPositive ? "bg-sahay-success/20" : "bg-sahay-pending/20"}`}
                            >
                              <Icon
                                className={`w-4 h-4 ${isPositive ? "text-sahay-success" : "text-sahay-pending"}`}
                              />
                            </div>

                            {/* Event content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground">
                                {getEventMessage(event)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-muted-foreground">
                                  {formatTime(event.timestamp)}
                                </span>
                                {event.actor &&
                                  event.actor !== "careReceiver" && (
                                    <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">
                                      {event.actor === "pharmacist"
                                        ? "Pharmacist"
                                        : "Caregiver"}
                                    </span>
                                  )}
                              </div>
                              {event.note && event.type !== "day_closed" && (
                                <p className="text-sm text-muted-foreground mt-2 p-2 bg-secondary/50 rounded-lg">
                                  {event.note}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
