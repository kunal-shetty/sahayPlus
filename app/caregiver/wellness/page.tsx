"use client";

import { useState } from "react";
import { useSahay } from "@/lib/sahay-context";
import {
  Smile,
  Meh,
  Frown,
  MessageCircle,
  Heart,
  Calendar,
  Info,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
  X,
  Edit3,
} from "lucide-react";
import type { WellnessLevel, WellnessEntry } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const wellnessConfig: Record<
  string,
  {
    icon: typeof Smile;
    label: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  great: {
    icon: Smile,
    label: "Feeling great",
    description: "Good energy & positive spirits",
    color: "text-sahay-success",
    bgColor: "bg-sahay-success/10",
    borderColor: "border-sahay-success/30",
  },
  okay: {
    icon: Meh,
    label: "Doing okay",
    description: "Managing alright, standard day",
    color: "text-sahay-pending",
    bgColor: "bg-sahay-pending/10",
    borderColor: "border-sahay-pending/30",
  },
  notGreat: {
    icon: Frown,
    label: "Not feeling great",
    description: "Low energy, pain or discomfort",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
  },
  not_great: {
    icon: Frown,
    label: "Not feeling great",
    description: "Low energy, pain or discomfort",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
  },
};

function getWellnessCfg(level?: string) {
  return wellnessConfig[level || "okay"] || wellnessConfig.okay;
}

export default function WellnessPage() {
  const { data, getWellnessTrend, getTodayWellness, logWellness, sendMessage } =
    useSahay();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<WellnessLevel>("great");
  const [noteText, setNoteText] = useState("");
  const [historyFilter, setHistoryFilter] = useState<"all" | WellnessLevel>(
    "all",
  );
  const [distributionScope, setDistributionScope] = useState<"week" | "all">(
    "week",
  );
  const [reminderSent, setReminderSent] = useState(false);

  const todayWellness = getTodayWellness();
  const allEntries = getWellnessTrend();
  const careReceiverName = data.careReceiver?.name || "Care Receiver";

  // Compute 7-day calendar window (past 6 days + today)
  const todayDateObj = new Date();
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(todayDateObj.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const isToday = i === 6;
    const weekday = isToday
      ? "Today"
      : d.toLocaleDateString("en", { weekday: "short" });
    const dayMonth = d.toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    });

    const entry = allEntries.find((e) => e.date === dateStr);
    return {
      date: dateStr,
      weekday,
      dayMonth,
      isToday,
      entry,
    };
  });

  // Filter entries that actually occurred within the last 7 calendar days
  const sevenDaysAgoDate = new Date();
  sevenDaysAgoDate.setDate(todayDateObj.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgoDate.toISOString().split("T")[0];

  const weekEntries = allEntries.filter((e) => {
    const entryDate = e.date || (e.timestamp ? e.timestamp.split("T")[0] : "");
    return entryDate >= sevenDaysAgoStr;
  });

  const activeScopeEntries =
    distributionScope === "week" ? weekEntries : allEntries;

  const wellnessCounts = activeScopeEntries.reduce(
    (acc, entry) => {
      const normLevel =
        entry.level === ("not_great" as any) ? "notGreat" : entry.level;
      acc[normLevel] = (acc[normLevel] || 0) + 1;
      return acc;
    },
    {} as Record<WellnessLevel, number>,
  );

  const dominantMood = Object.entries(wellnessCounts).sort(
    ([, a], [, b]) => (b as number) - (a as number),
  )[0]?.[0] as WellnessLevel | undefined;

  // Filtered detailed history list
  const filteredHistory = allEntries.filter((e) => {
    if (historyFilter === "all") return true;
    const norm =
      e.level === ("not_great" as any) ? "notGreat" : e.level;
    return norm === historyFilter;
  });

  // Handle open check-in modal
  const handleOpenModal = () => {
    if (todayWellness) {
      const norm =
        todayWellness.level === ("not_great" as any)
          ? "notGreat"
          : (todayWellness.level as WellnessLevel);
      setSelectedLevel(norm);
      setNoteText(todayWellness.note || "");
    } else {
      setSelectedLevel("great");
      setNoteText("");
    }
    setIsModalOpen(true);
  };

  // Handle submit check-in
  const handleSaveCheckIn = () => {
    logWellness(selectedLevel, noteText.trim() || undefined);
    setIsModalOpen(false);
  };

  // Handle sending gentle reminder
  const handleSendReminder = () => {
    sendMessage(
      `Hi ${careReceiverName}! Just gently checking in to see how you are feeling today.`,
      true,
    );
    setReminderSent(true);
    setTimeout(() => setReminderSent(false), 5000);
  };

  return (
    <main className="min-h-screen bg-background p-6">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Wellness Tracking</h1>
            <p className="text-muted-foreground text-sm">
              Monitoring the emotional and physical well-being of{" "}
              <span className="font-semibold text-foreground">
                {careReceiverName}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-md shadow-primary/20 active:scale-95 touch-manipulation"
        >
          {todayWellness ? (
            <>
              <Edit3 className="w-4 h-4" />
              Update Today&apos;s Check-in
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Record Wellness Check-in
            </>
          )}
        </button>
      </header>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Today's Wellness Snapshot */}
        <section
          className={cn(
            "rounded-3xl p-6 sm:p-8 shadow-sm border-2 transition-all",
            todayWellness
              ? `${getWellnessCfg(todayWellness.level).bgColor} border-transparent`
              : "bg-card border-border border-dashed",
          )}
        >
          {todayWellness ? (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  <div
                    className={cn(
                      "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-inner",
                      getWellnessCfg(todayWellness.level).bgColor,
                    )}
                  >
                    {(() => {
                      const Icon = getWellnessCfg(todayWellness.level).icon;
                      return (
                        <Icon
                          className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12",
                            getWellnessCfg(todayWellness.level).color,
                          )}
                        />
                      );
                    })()}
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-7 h-7 bg-card rounded-full shadow-sm flex items-center justify-center border border-border"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-sahay-success animate-pulse" />
                  </motion.div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Today&apos;s Status
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-sahay-success/15 text-sahay-success font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Logged
                    </span>
                    {todayWellness.timestamp && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(todayWellness.timestamp).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    )}
                  </div>

                  <h2
                    className={cn(
                      "text-2xl sm:text-3xl font-bold mb-2",
                      getWellnessCfg(todayWellness.level).color,
                    )}
                  >
                    {getWellnessCfg(todayWellness.level).label}
                  </h2>

                  {todayWellness.note ? (
                    <p className="text-base sm:text-lg text-foreground/90 italic bg-background/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/50 max-w-xl">
                      &quot;{todayWellness.note}&quot;
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No additional notes provided for today
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                <button
                  onClick={handleOpenModal}
                  className="px-4 py-2 rounded-xl bg-background border border-border font-medium text-xs hover:bg-secondary transition-all shadow-sm"
                >
                  Edit Note
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Info className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                No wellness check-in recorded for today
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                Check-ins are usually logged by {careReceiverName}, or you can
                record one now if you spoke with them.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleOpenModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Record Check-in
                </button>

                <button
                  onClick={handleSendReminder}
                  disabled={reminderSent}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all shadow-sm active:scale-95",
                    reminderSent
                      ? "bg-sahay-success/15 border-sahay-success/30 text-sahay-success"
                      : "bg-background border-border text-foreground hover:bg-secondary",
                  )}
                >
                  {reminderSent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Reminder Sent!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Friendly Reminder
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 7-Day Day-by-Day Strip */}
        <section className="bg-card border-2 border-border rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Past 7 Days Overview
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Daily check-in continuity for {careReceiverName}
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
              {weekEntries.length} of 7 days logged
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-4">
            {past7Days.map((day) => {
              const cfg = day.entry
                ? getWellnessCfg(day.entry.level)
                : undefined;
              const Icon = cfg?.icon;

              return (
                <div
                  key={day.date}
                  className={cn(
                    "flex flex-col items-center p-2.5 sm:p-4 rounded-2xl border text-center transition-all",
                    day.isToday && "ring-2 ring-primary/40",
                    day.entry
                      ? `${cfg?.bgColor} ${cfg?.borderColor}`
                      : "bg-background/50 border-border/70",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-semibold mb-1",
                      day.isToday ? "text-primary font-bold" : "text-muted-foreground",
                    )}
                  >
                    {day.weekday}
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground mb-3">
                    {day.dayMonth}
                  </span>

                  {day.entry ? (
                    <div
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm",
                        cfg?.bgColor,
                      )}
                      title={`${cfg?.label}${day.entry.note ? `: ${day.entry.note}` : ""}`}
                    >
                      {Icon && (
                        <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", cfg?.color)} />
                      )}
                    </div>
                  ) : day.isToday ? (
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center text-primary text-[10px] font-bold"
                      title="Due today"
                    >
                      Due
                    </div>
                  ) : (
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground text-xs font-semibold"
                      title="No check-in"
                    >
                      —
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 2-Column Section: Summary & Recent History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary Card */}
          <section className="lg:col-span-1 bg-card border-2 border-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">Mood Trends</h3>
                </div>

                {/* Scope Switcher */}
                <div className="flex items-center bg-secondary p-0.5 rounded-lg text-[11px] font-semibold">
                  <button
                    onClick={() => setDistributionScope("week")}
                    className={cn(
                      "px-2.5 py-1 rounded-md transition-all",
                      distributionScope === "week"
                        ? "bg-background text-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setDistributionScope("all")}
                    className={cn(
                      "px-2.5 py-1 rounded-md transition-all",
                      distributionScope === "all"
                        ? "bg-background text-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    All Time
                  </button>
                </div>
              </div>

              {dominantMood ? (
                <div className="space-y-6">
                  <div className="p-4 bg-secondary/30 rounded-2xl border border-border/40">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
                      {distributionScope === "week"
                        ? "Dominant Mood (Past 7 Days)"
                        : "Overall Dominant Mood"}
                    </p>
                    <p
                      className={cn(
                        "text-xl font-bold",
                        getWellnessCfg(dominantMood).color,
                      )}
                    >
                      {getWellnessCfg(dominantMood).label}
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Mood Distribution
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {activeScopeEntries.length} total check-in
                        {activeScopeEntries.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {(["great", "okay", "notGreat"] as WellnessLevel[]).map(
                      (level) => {
                        const config = getWellnessCfg(level);
                        const Icon = config.icon;
                        const count = wellnessCounts[level] || 0;
                        const percent =
                          activeScopeEntries.length > 0
                            ? Math.round(
                                (count / activeScopeEntries.length) * 100,
                              )
                            : 0;

                        return (
                          <div key={level} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-2 font-medium">
                                <Icon className={cn("w-3.5 h-3.5", config.color)} />
                                {config.label}
                              </span>
                              <span className="font-semibold text-muted-foreground">
                                {count}{" "}
                                <span className="text-[10px] font-normal">
                                  ({percent}%)
                                </span>
                              </span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 0.5 }}
                                className={cn(
                                  "h-full rounded-full",
                                  level === "great"
                                    ? "bg-sahay-success"
                                    : level === "okay"
                                      ? "bg-sahay-pending"
                                      : "bg-destructive",
                                )}
                              />
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground italic">
                    {distributionScope === "week"
                      ? "No check-ins logged in the past 7 days."
                      : "No check-ins recorded yet."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* History Grid */}
          <section className="lg:col-span-2 bg-card border-2 border-border rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-xl font-bold">Detailed Check-ins</h3>
                  <p className="text-xs text-muted-foreground">
                    Historical logs and personal notes ({filteredHistory.length}
                    )
                  </p>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { key: "all", label: "All" },
                    { key: "great", label: "Great" },
                    { key: "okay", label: "Okay" },
                    { key: "notGreat", label: "Not Great" },
                  ] as { key: "all" | WellnessLevel; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setHistoryFilter(tab.key)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                      historyFilter === tab.key
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredHistory.map((entry) => {
                const config = getWellnessCfg(entry.level);
                const Icon = config.icon;
                const entryDate = new Date(entry.timestamp || entry.date);

                return (
                  <motion.div
                    key={entry.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 bg-background border border-border rounded-2xl flex gap-4 transition-all"
                  >
                    <div
                      className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center shrink-0",
                        config.bgColor,
                      )}
                    >
                      <Icon className={cn("w-5 h-5", config.color)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <p className="font-bold text-foreground text-sm">
                          {config.label}
                        </p>
                        <p className="text-xs text-muted-foreground shrink-0">
                          {entryDate.toLocaleDateString("en", {
                            month: "short",
                            day: "numeric",
                            year:
                              entryDate.getFullYear() !==
                              todayDateObj.getFullYear()
                                ? "numeric"
                                : undefined,
                          })}
                        </p>
                      </div>

                      {entry.note ? (
                        <p className="text-xs sm:text-sm text-foreground/80 italic leading-relaxed line-clamp-3">
                          &quot;{entry.note}&quot;
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No additional notes
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {filteredHistory.length === 0 && (
                <div className="col-span-1 md:col-span-2 py-12 text-center bg-secondary/20 rounded-2xl border border-border/50">
                  <p className="text-muted-foreground text-sm">
                    No check-ins match the selected filter.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Record/Update Wellness Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-card border-2 border-border rounded-3xl p-6 sm:p-8 shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold">
                    {todayWellness ? "Update Check-in" : "Record Check-in"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Log today&apos;s wellness for {careReceiverName}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Level Selector */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {(
                  [
                    { level: "great", label: "Great" },
                    { level: "okay", label: "Okay" },
                    { level: "notGreat", label: "Not Great" },
                  ] as { level: WellnessLevel; label: string }[]
                ).map((item) => {
                  const cfg = getWellnessCfg(item.level);
                  const Icon = cfg.icon;
                  const isSelected = selectedLevel === item.level;

                  return (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setSelectedLevel(item.level)}
                      className={cn(
                        "p-4 rounded-2xl border-2 flex flex-col items-center text-center transition-all cursor-pointer",
                        isSelected
                          ? `${cfg.bgColor} ${cfg.borderColor} ring-2 ring-primary/40`
                          : "bg-background border-border hover:bg-secondary/40",
                      )}
                    >
                      <Icon className={cn("w-7 h-7 mb-2", cfg.color)} />
                      <span className="font-bold text-xs sm:text-sm">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Note input */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Optional Notes or Observations
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="e.g. Spoke over the phone, active and happy after lunch."
                  rows={3}
                  className="w-full rounded-xl bg-background border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCheckIn}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 shadow-sm"
                >
                  Save Check-in
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
