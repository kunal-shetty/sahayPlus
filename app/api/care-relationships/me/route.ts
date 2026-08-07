import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/care-relationships/me?user_id=... — Returns the current user
// row + their care relationship (if any).  Used by the client to detect
// when a care-receiver has been linked by their caregiver, since the
// browser-side Supabase client has no auth session and can't read users
// via RLS on its own.
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("user_id");

        if (!userId) {
            return NextResponse.json(
                { error: "user_id is required" },
                { status: 400 }
            );
        }

        const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();

        if (userError || !user) {
            return NextResponse.json(
                { error: userError?.message || "User not found" },
                { status: 404 }
            );
        }

        const { data: relationships } = await supabase
            .from("care_relationships")
            .select("*")
            .or(`caregiver_id.eq.${userId},care_receiver_id.eq.${userId}`)
            .limit(1);

        const relationship =
            relationships && relationships.length > 0 ? relationships[0] : null;

        return NextResponse.json(
            { user, relationship },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("[/api/care-relationships/me] error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to fetch" },
            { status: 500 }
        );
    }
}
