import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/handover/start — Start a care handover
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            care_relationship_id,
            from_caregiver_id,
            to_person_name,
            start_date,
            end_date,
        } = body;

        if (!care_relationship_id || !from_caregiver_id || !to_person_name) {
            return NextResponse.json(
                {
                    error: "Missing required fields: care_relationship_id, from_caregiver_id, to_person_name",
                },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("handovers")
            .insert({
                care_relationship_id,
                from_caregiver_id,
                to_person_name,
                start_date: start_date || new Date().toISOString(),
                end_date: end_date || null,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Add timeline event
        await supabase.from("timeline_events").insert({
            care_relationship_id,
            type: "handover_started",
            note: `Care handed over to ${to_person_name}`,
            actor_id: from_caregiver_id,
            actor_type: "caregiver",
        });

        return NextResponse.json(
            { message: "Handover started", handover: data },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to start handover" },
            { status: 500 }
        );
    }
}
