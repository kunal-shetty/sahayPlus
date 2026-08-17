import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const careRelationshipId = searchParams.get("care_relationship_id");
    const triggeredAt = searchParams.get("triggered_at");

    if (!careRelationshipId || !triggeredAt) {
      return NextResponse.json(
        { error: "Missing required query params: care_relationship_id, triggered_at" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("safety_checks")
      .select("*")
      .eq("care_relationship_id", careRelationshipId)
      .eq("status", "pending_check")
      .gte("triggered_at", new Date(new Date(triggeredAt).getTime() - 60000).toISOString())
      .lte("triggered_at", new Date(new Date(triggeredAt).getTime() + 60000).toISOString())
      .order("triggered_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ safety_check: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch safety check" },
      { status: 500 }
    );
  }
}
