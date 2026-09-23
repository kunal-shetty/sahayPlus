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
                { status: 400 },
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
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch timeline" },
            { status: 500 },
        );
    }
}

/**
 * POST /api/timeline
 * Creates a new timeline event stored directly in the database.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { care_relationship_id, type, note, actor_type, actor_id, medication_id } = body;

        if (!care_relationship_id || !type) {
            return NextResponse.json(
                { error: "Missing required fields: care_relationship_id, type" },
                { status: 400 },
            );
        }

        const { data, error } = await supabase
            .from("timeline_events")
            .insert({
                care_relationship_id,
                type,
                note: note || null,
                actor_type: actor_type || "care_receiver",
                actor_id: actor_id || null,
                medication_id: medication_id || null,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ event: data }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create timeline event" },
            { status: 500 },
        );
    }
}

/**
 * PATCH /api/timeline
 * Updates an existing timeline event (e.g. marking a help request as resolved).
 */
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, care_relationship_id, note } = body;

        const resolvedNote = note || "resolved";
        const isUuid = Boolean(
            id &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        );

        let query = supabase.from("timeline_events").update({ note: resolvedNote });

        if (isUuid) {
            query = query.eq("id", id);
        } else if (care_relationship_id) {
            // Fallback: resolve active unresolved help_requested event for this relationship
            query = query
                .eq("care_relationship_id", care_relationship_id)
                .eq("type", "help_requested")
                .not("note", "ilike", "%resolved%");
        } else {
            return NextResponse.json(
                { error: "Must provide a valid UUID id or care_relationship_id" },
                { status: 400 },
            );
        }

        const { data, error } = await query.select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ event: data?.[0] || null }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update timeline event" },
            { status: 500 },
        );
    }
}
