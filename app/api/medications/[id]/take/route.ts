import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/medications/:id/take — Mark medication as taken
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const { marked_by } = body;

        const today = new Date().toISOString().split("T")[0];

        // Check if a log already exists for this medication today
        const { data: existingLog } = await supabase
            .from("medication_logs")
            .select("id")
            .eq("medication_id", id)
            .eq("date", today)
            .maybeSingle();

        let log;
        let logError;

        if (existingLog) {
            const res = await supabase
                .from("medication_logs")
                .update({
                    taken: true,
                    taken_at: new Date().toISOString(),
                    marked_by: marked_by || null,
                })
                .eq("id", existingLog.id)
                .select()
                .single();
            log = res.data;
            logError = res.error;
        } else {
            const res = await supabase
                .from("medication_logs")
                .insert({
                    medication_id: id,
                    date: today,
                    taken: true,
                    taken_at: new Date().toISOString(),
                    marked_by: marked_by || null,
                })
                .select()
                .single();
            log = res.data;
            logError = res.error;
        }

        if (logError) {
            return NextResponse.json(
                { error: logError.message },
                { status: 500 },
            );
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
                type: "medication_taken",
                medication_id: id,
                actor_id: marked_by || null,
                actor_type: "care_receiver",
            });
        }

        return NextResponse.json(
            { message: "Medication marked as taken", log },
            { status: 201 },
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to mark medication as taken" },
            { status: 500 },
        );
    }
}
