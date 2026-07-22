import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/handover/end — End an active handover
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { handover_id } = body;

        if (!handover_id) {
            return NextResponse.json(
                { error: "Missing required field: handover_id" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("handovers")
            .update({
                is_active: false,
                end_date: new Date().toISOString(),
            })
            .eq("id", handover_id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Add timeline event
        if (data) {
            await supabase.from("timeline_events").insert({
                care_relationship_id: data.care_relationship_id,
                type: "handover_ended",
                note: "Care handover ended",
                actor_id: data.from_caregiver_id,
                actor_type: "caregiver",
            });
        }

        return NextResponse.json(
            { message: "Handover ended", handover: data },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to end handover" },
            { status: 500 }
        );
    }
}
