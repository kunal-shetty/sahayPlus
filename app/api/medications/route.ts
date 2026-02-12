import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/medications — List all medications
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const careRelationshipId = searchParams.get("care_relationship_id");

        let query = supabase.from("medications").select("*");

        if (careRelationshipId) {
            query = query.eq("care_relationship_id", careRelationshipId);
        }

        const { data, error } = await query.order("time_of_day").order("created_at");

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ medications: data }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch medications" },
            { status: 500 }
        );
    }
}

// POST /api/medications — Add a new medication
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            care_relationship_id,
            name,
            dosage,
            time_of_day,
            time,
            notes,
            simple_explanation,
            refill_days_left,
            pharmacist_note,
        } = body;

        if (!care_relationship_id || !name || !dosage || !time_of_day) {
            return NextResponse.json(
                {
                    error: "Missing required fields: care_relationship_id, name, dosage, time_of_day",
                },
                { status: 400 }
            );
        }

        const validTimes = ["morning", "afternoon", "evening"];
        if (!validTimes.includes(time_of_day)) {
            return NextResponse.json(
                { error: `Invalid time_of_day. Must be one of: ${validTimes.join(", ")}` },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("medications")
            .insert({
                care_relationship_id,
                name,
                dosage,
                time_of_day,
                time: time || null,
                notes: notes || null,
                simple_explanation: simple_explanation || null,
                refill_days_left: refill_days_left || null,
                pharmacist_note: pharmacist_note || null,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Medication added", medication: data },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to add medication" },
            { status: 500 }
        );
    }
}
