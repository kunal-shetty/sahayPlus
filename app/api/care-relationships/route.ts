import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/care-relationships — List my care circles
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("user_id");

        let query = supabase.from("care_relationships").select("*");

        if (userId) {
            query = query.or(`caregiver_id.eq.${userId},care_receiver_id.eq.${userId},alt_caregiver_id.eq.${userId}`);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ relationships: data }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch care relationships" },
            { status: 500 }
        );
    }
}

// POST /api/care-relationships — Create a new care circle
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { caregiver_id, care_receiver_id, alt_caregiver_id } = body;

        if (!caregiver_id || !care_receiver_id) {
            return NextResponse.json(
                { error: "Missing required fields: caregiver_id, care_receiver_id" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("care_relationships")
            .insert({
                caregiver_id,
                care_receiver_id,
                alt_caregiver_id: alt_caregiver_id || null,
                caregiver_status: "active",
                current_streak: 0,
                longest_streak: 0,
                total_days_tracked: 0,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Care relationship created", relationship: data },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create care relationship" },
            { status: 500 }
        );
    }
}
