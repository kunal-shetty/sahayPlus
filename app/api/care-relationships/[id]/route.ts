import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/care-relationships/:id — Get a specific care relationship
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data, error } = await supabase
            .from("care_relationships")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        return NextResponse.json({ relationship: data }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch care relationship" },
            { status: 500 }
        );
    }
}

// PATCH /api/care-relationships/:id — Update a care relationship
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const { data, error } = await supabase
            .from("care_relationships")
            .update(body)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Care relationship updated", relationship: data },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update care relationship" },
            { status: 500 }
        );
    }
}
