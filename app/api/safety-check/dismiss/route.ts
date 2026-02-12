import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/safety-check/dismiss — Dismiss a safety check
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { safety_check_id } = body;

        if (!safety_check_id) {
            return NextResponse.json(
                { error: "Missing required field: safety_check_id" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("safety_checks")
            .update({
                status: "dismissed",
                resolved_at: new Date().toISOString(),
            })
            .eq("id", safety_check_id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Add timeline event
        if (data) {
            await supabase.from("timeline_events").insert({
                care_relationship_id: data.care_relationship_id,
                type: "safety_check_dismissed",
                note: "Safety check dismissed",
            });
        }

        return NextResponse.json(
            { message: "Safety check dismissed", safetyCheck: data },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to dismiss safety check" },
            { status: 500 }
        );
    }
}
