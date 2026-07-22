import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/day/close — Close the day (daily closure ritual)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            care_relationship_id,
            all_taken,
            total_meds,
            taken_count,
            closed_by,
        } = body;

        if (!care_relationship_id || !closed_by) {
            return NextResponse.json(
                { error: "Missing required fields: care_relationship_id, closed_by" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("day_closures")
            .insert({
                care_relationship_id,
                date: new Date().toISOString().split("T")[0],
                closed_at: new Date().toISOString(),
                all_taken: all_taken || false,
                total_meds: total_meds || 0,
                taken_count: taken_count || 0,
                closed_by,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Add timeline event
        await supabase.from("timeline_events").insert({
            care_relationship_id,
            type: "day_closed",
            note: `Day closed with ${taken_count || 0}/${total_meds || 0} taken`,
            actor_id: closed_by,
        });

        return NextResponse.json(
            { message: "Day closed successfully", closure: data },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to close day" },
            { status: 500 }
        );
    }
}
