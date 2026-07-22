import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/day/history — Day closure history
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const careRelationshipId = searchParams.get("care_relationship_id");

        if (!careRelationshipId) {
            return NextResponse.json(
                { error: "Missing required query param: care_relationship_id" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("day_closures")
            .select("*")
            .eq("care_relationship_id", careRelationshipId)
            .order("date", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ closures: data }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch day closure history" },
            { status: 500 }
        );
    }
}
