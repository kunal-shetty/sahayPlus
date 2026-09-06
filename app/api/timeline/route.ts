/**
 * @file route.ts
 * @description API route for retrieving the shared activity timeline.
 * This provides a chronologically ordered list of events (meds taken, check-ins, etc.)
 * for a specific care relationship.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/timeline
 * Fetches a paginated list of timeline events for a given care relationship.
 *
 * @param {NextRequest} req - The incoming request.
 * @param {string} req.query.care_relationship_id - Required. The ID of the relationship.
 * @param {string} [req.query.limit="50"] - Maximum number of events to return.
 * @param {string} [req.query.offset="0"] - The starting offset for pagination.
 * @returns {Promise<NextResponse>} JSON response containing the events and pagination metadata.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const careRelationshipId = searchParams.get("care_relationship_id");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        if (!careRelationshipId) {
            return NextResponse.json(
                { error: "Missing required query param: care_relationship_id" },
                { status: 400 }
            );
        }

        const { data, error, count } = await supabase
            .from("timeline_events")
            .select("*", { count: "exact" })
            .eq("care_relationship_id", careRelationshipId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { events: data, limit, offset, total: count },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch timeline" },
            { status: 500 }
        );
    }
}
