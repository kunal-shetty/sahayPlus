/**
 * @file route.ts
 * @description API routes for managing safety checks.
 * Provides endpoints to retrieve active safety checks based on relationship and trigger time.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/safety-checks
 * Retrieves a specific safety check that is currently pending a response.
 *
 * @param {NextRequest} req - The incoming request containing `care_relationship_id`
 * and `triggered_at` as query parameters.
 * @returns {Promise<NextResponse>} JSON response containing the safety check object or null.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const careRelationshipId = searchParams.get("care_relationship_id");
    const triggeredAt = searchParams.get("triggered_at");

    if (!careRelationshipId || !triggeredAt) {
      return NextResponse.json(
        { error: "Missing required query params: care_relationship_id, triggered_at" },
        { status: 400 }
      );
    }

    // Search for a safety check for this relationship that is pending
    // and matches the trigger time within a small window (1 minute).
    const { data, error } = await supabase
      .from("safety_checks")
      .select("*")
      .eq("care_relationship_id", careRelationshipId)
      .eq("status", "pending_check")
      .gte("triggered_at", new Date(new Date(triggeredAt).getTime() - 60000).toISOString())
      .lte("triggered_at", new Date(new Date(triggeredAt).getTime() + 60000).toISOString())
      .order("triggered_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ safety_check: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch safety check" },
      { status: 500 }
    );
  }
}
