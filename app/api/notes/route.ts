import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/notes — List contextual notes
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const careRelationshipId = searchParams.get("care_relationship_id");

        let query = supabase.from("contextual_notes").select("*");

        if (careRelationshipId) {
            query = query.eq("care_relationship_id", careRelationshipId);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ notes: data }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch notes" },
            { status: 500 }
        );
    }
}

// POST /api/notes — Add a contextual note
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            care_relationship_id,
            text,
            linked_type,
            linked_medication_id,
            linked_date,
            created_by,
        } = body;

        if (!care_relationship_id || !text || !linked_type || !created_by) {
            return NextResponse.json(
                {
                    error: "Missing required fields: care_relationship_id, text, linked_type, created_by",
                },
                { status: 400 }
            );
        }

        const validLinkedTypes = ["medication", "day"];
        if (!validLinkedTypes.includes(linked_type)) {
            return NextResponse.json(
                { error: `Invalid linked_type. Must be one of: ${validLinkedTypes.join(", ")}` },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("contextual_notes")
            .insert({
                care_relationship_id,
                text,
                linked_type,
                linked_medication_id: linked_medication_id || null,
                linked_date: linked_date || null,
                created_by,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Add timeline event
        await supabase.from("timeline_events").insert({
            care_relationship_id,
            type: "note_added",
            note: text,
            actor_id: created_by,
        });

        return NextResponse.json(
            { message: "Note added", note: data },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to add note" },
            { status: 500 }
        );
    }
}
