"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSahay } from "@/lib/sahay-context";

type Role = "caregiver" | "care_receiver";

/**
 * Keeps a page to the role it was built for.
 * Sends logged-out users to /login, unlinked users to /care-code, and users
 * with the other role to their own home.
 *
 * @returns true once the current user is allowed to see the page.
 */
export function useRoleGuard(role: Role): boolean {
  const { user, isLoading } = useSahay();
  const router = useRouter();

  const allowed =
    !isLoading && !!user && user.role === role && !!user.care_relationship_id;

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
    } else if (!user.care_relationship_id) {
      router.replace("/care-code");
    } else if (user.role !== role) {
      router.replace(user.role === "caregiver" ? "/dashboard" : "/care-receiver");
    }
  }, [isLoading, user, role, router]);

  return allowed;
}
