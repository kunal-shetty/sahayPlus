"use client";

/**
 * @file page.tsx
 * @description /caregiver used to be a separate mobile-only home screen that
 * duplicated /dashboard. The dashboard is responsive, so it is now the single
 * caregiver home; this route just forwards there for old links and bookmarks.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CaregiverHomeRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return null;
}
