import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/auth/me — Get current authenticated user
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json({ error: "No token provided" }, { status: 401 });
        }

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUser.id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
}
