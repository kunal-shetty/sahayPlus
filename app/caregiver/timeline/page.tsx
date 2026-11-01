"use client";

import { CareTimeline } from "@/components/caregiver/care-timeline";
import { useRouter } from "next/navigation";

/**
 * Care Timeline Page (Module 12: Shared Care Story Timeline)
 * Provides a chronological narrative of all care events, filterable by Medicines, Alerts, and Notes.
 */
export default function CareTimelinePage() {
  const router = useRouter();

  return <CareTimeline onClose={() => router.back()} />;
}

