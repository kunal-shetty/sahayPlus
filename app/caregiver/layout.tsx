"use client";

import { CaregiverLayout } from "@/components/caregiver/caregiver-layout";
import { useRoleGuard } from "@/hooks/use-role-guard";

export default function CaregiverLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Every /caregiver/* page is caregiver-only; others are redirected home.
  const allowed = useRoleGuard("caregiver");
  return <CaregiverLayout>{allowed ? children : null}</CaregiverLayout>;
}
