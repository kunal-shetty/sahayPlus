import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/medication-logs?care_relationship_id=...&date=YYYY-MM-DD
// Returns today's "taken" status for the care-receiver's medications so
// the caregiver's UI can show whether meds have been checked off.
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const careRelationshipId = searchParams.get("care_relationship_id");
        const date = searchParams.get("date");

        if (!careRelationshipId) {
            return NextResponse.json(
                { error: "Missing required query param: care_relationship_id" },
                { status: 400 }
            );
        }

        // Get all medications for this relationship
        const { data: meds, error: medsError } = await supabase
            .from("medications")
            .select("id")
            .eq("care_relationship_id", careRelationshipId);

        if (medsError) {
            return NextResponse.json({ error: medsError.message }, { status: 500 });
        }

        const medIds = (meds || []).map((m) => m.id);
        if (medIds.length === 0) {
            return NextResponse.json({ logs: [] }, { status: 200 });
        }

        let query = supabase
            .from("medication_logs")
            .select("*")
            .in("medication_id", medIds)
            .order("created_at", { ascending: false });

        if (date) {
            query = query.eq("date", date);
        }

        const { data: logs, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ logs: logs || [] }, { status: 200 });
    } catch (error: any) {
        console.error("[/api/medication-logs] error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to fetch logs" },
            { status: 500 }
        );
    }
}
