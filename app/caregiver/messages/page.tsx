"use client";

import { useRouter } from "next/navigation";
import { Messages } from "@/components/caregiver/messages";

/** Caregiver ↔ care receiver message thread. */
export default function CaregiverMessagesPage() {
  const router = useRouter();
  return (
    <div className="h-full">
      <Messages onClose={() => router.push("/dashboard")} />
    </div>
  );
}
