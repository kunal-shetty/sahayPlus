import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/safety-check/trigger — Trigger a safety check
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { care_relationship_id } = body;

        if (!care_relationship_id) {
            return NextResponse.json(
                { error: "Missing required field: care_relationship_id" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("safety_checks")
            .insert({
                care_relationship_id,
                status: "pending",
                triggered_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Add timeline event
        await supabase.from("timeline_events").insert({
            care_relationship_id,
            type: "safety_check_triggered",
            note: "Safety check triggered",
        });

        return NextResponse.json(
            { message: "Safety check triggered", safetyCheck: data },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to trigger safety check" },
            { status: 500 }
        );
    }
}
