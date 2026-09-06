/**
 * @file route.ts
 * @description API routes for wellness tracking.
 * Provides endpoints to log daily wellness levels and retrieve the wellness history.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/wellness
 * Retrieves wellness entry history.
 *
 * @param {NextRequest} req - The incoming request.
 * @param {string} [req.query.care_relationship_id] - Filter by relationship ID.
 * @param {string} [req.query.user_id] - Filter by user ID.
 * @returns {Promise<NextResponse>} JSON response containing a list of wellness entries.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const careRelationshipId = searchParams.get("care_relationship_id");
        const userId = searchParams.get("user_id");

        let query = supabase.from("wellness_entries").select("*");

        if (careRelationshipId) {
            query = query.eq("care_relationship_id", careRelationshipId);
        }
        if (userId) {
            query = query.eq("user_id", userId);
        }

        const { data, error } = await query.order("date", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ entries: data }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch wellness entries" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/wellness
 * Logs a new wellness entry and creates a corresponding timeline event.
 *
 * @param {NextRequest} req - The incoming request containing `care_relationship_id`, `user_id`, and `level` in the body.
 * @returns {Promise<NextResponse>} JSON response confirming the entry was logged.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { care_relationship_id, user_id, level, note } = body;

        if (!care_relationship_id || !user_id || !level) {
            return NextResponse.json(
                { error: "Missing required fields: care_relationship_id, user_id, level" },
                { status: 400 }
            );
        }

        const validLevels = ["great", "okay", "not_great"];
        if (!validLevels.includes(level)) {
            return NextResponse.json(
                { error: `Invalid level. Must be one of: ${validLevels.join(", ")}` },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("wellness_entries")
            .insert({
                care_relationship_id,
                user_id,
                date: new Date().toISOString().split("T")[0],
                level,
                note: note || null,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Automatically add a corresponding event to the timeline
        await supabase.from("timeline_events").insert({
            care_relationship_id,
            type: "wellness_logged",
            note: `Feeling ${level}${note ? `: ${note}` : ""}`,
            actor_id: user_id,
            actor_type: "care_receiver",
        });

        return NextResponse.json(
            { message: "Wellness entry logged", entry: data },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to log wellness entry" },
            { status: 500 }
        );
    }
}
