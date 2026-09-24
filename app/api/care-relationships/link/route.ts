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
                { status: 400 },
            );
        }

        // Look up care receiver by code
        let { data: careReceiver } = await supabase
            .from("users")
            .select("*")
            .eq("care_code", care_code.toUpperCase().trim())
            .maybeSingle();

        // If not directly found by care_code, resolve via active care handover
        if (!careReceiver) {
            const { data: activeHandover } = await supabase
                .from("handovers")
                .select("care_relationship_id")
                .eq("is_active", true)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (activeHandover?.care_relationship_id) {
                const { data: rel } = await supabase
                    .from("care_relationships")
                    .select("care_receiver_id")
                    .eq("id", activeHandover.care_relationship_id)
                    .maybeSingle();

                if (rel?.care_receiver_id) {
                    const { data: crUser } = await supabase
                        .from("users")
                        .select("*")
                        .eq("id", rel.care_receiver_id)
                        .maybeSingle();
                    if (crUser) {
                        careReceiver = crUser;
                    }
                }
            }
        }

        if (!careReceiver) {
            return NextResponse.json(
                {
                    error: "No care receiver found with that code. Please check and try again.",
                },
                { status: 404 },
            );
        }

        if (careReceiver.role !== "care_receiver") {
            return NextResponse.json(
                { error: "That code does not belong to a care receiver." },
                { status: 400 },
            );
        }

        // Check if caregiver is already the primary or secondary caregiver for this receiver
        const { data: existing } = await supabase
            .from("care_relationships")
            .select("*")
            .eq("care_receiver_id", careReceiver.id)
            .or(`caregiver_id.eq.${caregiver_id},alt_caregiver_id.eq.${caregiver_id}`)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({
                message: "Already linked",
                relationship: existing,
                care_receiver: careReceiver,
            });
        }

        // Check if an existing primary relationship exists for this care receiver
        const { data: primaryRel } = await supabase
            .from("care_relationships")
            .select("*")
            .eq("care_receiver_id", careReceiver.id)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();

        if (primaryRel) {
            // Attach as secondary / alternate caregiver to the existing care relationship
            // so all medications, notes, timeline events, and history are shared seamlessly!
            const { data: updatedRel, error: updateError } = await supabase
                .from("care_relationships")
                .update({ alt_caregiver_id: caregiver_id })
                .eq("id", primaryRel.id)
                .select()
                .single();

            if (updateError) {
                return NextResponse.json(
                    { error: updateError.message },
                    { status: 500 },
                );
            }

            return NextResponse.json({
                message: "Successfully linked to care receiver",
                relationship: updatedRel,
                care_receiver: careReceiver,
            });
        }

        // If no relationship exists yet, create the initial care relationship
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
                { status: 500 },
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
            { status: 500 },
        );
    }
}
