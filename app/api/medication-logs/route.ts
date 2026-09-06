/**
 * @file route.ts
 * @description API route for retrieving medication logs.
 * This endpoint allows the caregiver's UI to synchronize and display the
 * "taken" status of medications recorded by the care receiver.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/medication-logs
 * Retrieves logs for medications within a care relationship for a specific date.
 *
 * @param {NextRequest} req - The incoming request containing `care_relationship_id`
 * and optionally `date` (YYYY-MM-DD) as query parameters.
 * @returns {Promise<NextResponse>} JSON response containing a list of medication logs.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const careRelationshipId = searchParams.get("care_relationship_id");
        const date = searchParams.get("date");

        if (!careRelationshipId) {
            return NextResponse.json(
                { error: "Missing required query param: care_relationship_id" },
                { status: 400 }
            );
        }

        // First, identify all medications associated with this care relationship
        const { data: meds, error: medsError } = await supabase
            .from("medications")
            .select("id")
            .eq("care_relationship_id", careRelationshipId);

        if (medsError) {
            return NextResponse.json({ error: medsError.message }, { status: 500 });
        }

        const medIds = (meds || []).map((m) => m.id);
        if (medIds.length === 0) {
            return NextResponse.json({ logs: [] }, { status: 200 });
        }

        // Fetch logs for these specific medications
        let query = supabase
            .from("medication_logs")
            .select("*")
            .in("medication_id", medIds)
            .order("created_at", { ascending: false });

        if (date) {
            query = query.eq("date", date);
        }

        const { data: logs, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ logs: logs || [] }, { status: 200 });
    } catch (error: any) {
        console.error("[/api/medication-logs] error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to fetch logs" },
            { status: 500 }
        );
    }
}
