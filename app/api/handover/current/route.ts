import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const careRelationshipId = searchParams.get("care_relationship_id");

    if (!careRelationshipId) {
      return NextResponse.json(
        { error: "Missing required query param: care_relationship_id" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("handovers")
      .select("*")
      .eq("care_relationship_id", careRelationshipId)
      .eq("is_active", true)
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto-expiration check: If the handover end date has passed, deactivate it and restore primary caregiver
    if (data && data.end_date && new Date(data.end_date).getTime() <= Date.now()) {
      await supabase
        .from("handovers")
        .update({
          is_active: false,
        })
        .eq("id", data.id);

      // Log handover expiration to shared timeline
      await supabase.from("timeline_events").insert({
        care_relationship_id: data.care_relationship_id,
        type: "handover_ended",
        note: `Care handover to ${data.to_person_name} expired. Primary caregiver restored.`,
        actor_id: data.from_caregiver_id,
        actor_type: "caregiver",
      });

      return NextResponse.json({ handover: null, expired: true }, { status: 200 });
    }

    return NextResponse.json({ handover: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch current handover" },
      { status: 500 },
    );
  }
}
