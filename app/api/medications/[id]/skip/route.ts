import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/medications/:id/skip — Mark medication as skipped
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const { marked_by, note } = body;

        // Insert medication log
        const { data: log, error: logError } = await supabase
            .from("medication_logs")
            .insert({
                medication_id: id,
                date: new Date().toISOString().split("T")[0],
                taken: false,
                marked_by: marked_by || null,
            })
            .select()
            .single();

        if (logError) {
            return NextResponse.json({ error: logError.message }, { status: 500 });
        }

        // Get med details for timeline event
        const { data: med } = await supabase
            .from("medications")
            .select("care_relationship_id")
            .eq("id", id)
            .single();

        if (med) {
            await supabase.from("timeline_events").insert({
                care_relationship_id: med.care_relationship_id,
                type: "medication_skipped",
                medication_id: id,
                actor_id: marked_by || null,
                actor_type: "care_receiver",
                note: note || null,
            });
        }

        return NextResponse.json(
            { message: "Medication marked as skipped", log },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to mark medication as skipped" },
            { status: 500 }
        );
    }
}
