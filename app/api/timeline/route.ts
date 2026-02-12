import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/timeline — Fetch shared activity timeline
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const careRelationshipId = searchParams.get("care_relationship_id");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        if (!careRelationshipId) {
            return NextResponse.json(
                { error: "Missing required query param: care_relationship_id" },
                { status: 400 }
            );
        }

        const { data, error, count } = await supabase
            .from("timeline_events")
            .select("*", { count: "exact" })
            .eq("care_relationship_id", careRelationshipId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { events: data, limit, offset, total: count },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch timeline" },
            { status: 500 }
        );
    }
}
