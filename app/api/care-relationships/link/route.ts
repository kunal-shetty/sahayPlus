import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/care-relationships/link — Caregiver enters a 6-char code to link to care receiver
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { caregiver_id, care_code } = body;

        if (!caregiver_id || !care_code) {
            return NextResponse.json(
                { error: "caregiver_id and care_code are required" },
                { status: 400 }
            );
        }

        // Look up care receiver by code
        const { data: careReceiver, error: lookupError } = await supabase
            .from("users")
            .select("*")
            .eq("care_code", care_code.toUpperCase().trim())
            .single();

        if (lookupError || !careReceiver) {
            return NextResponse.json(
                { error: "No care receiver found with that code. Please check and try again." },
                { status: 404 }
            );
        }

        if (careReceiver.role !== "care_receiver") {
            return NextResponse.json(
                { error: "That code does not belong to a care receiver." },
                { status: 400 }
            );
        }

        // Check if relationship already exists
        const { data: existing } = await supabase
            .from("care_relationships")
            .select("*")
            .eq("caregiver_id", caregiver_id)
            .eq("care_receiver_id", careReceiver.id)
            .single();

        if (existing) {
            return NextResponse.json({
                message: "Already linked",
                relationship: existing,
                care_receiver: careReceiver,
            });
        }

        // Create the care relationship
        const { data: relationship, error: insertError } = await supabase
            .from("care_relationships")
            .insert({
                caregiver_id,
                care_receiver_id: careReceiver.id,
            })
            .select()
            .single();

        if (insertError) {
            return NextResponse.json(
                { error: insertError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Successfully linked",
            relationship,
            care_receiver: careReceiver,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to link care code" },
            { status: 500 }
        );
    }
}
