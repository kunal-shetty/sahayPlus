import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/wellness — Get wellness entry history
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

// POST /api/wellness — Log a wellness entry
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

        // Add timeline event
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
