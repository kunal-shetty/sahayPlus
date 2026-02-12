import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/medications/:id — Get a specific medication
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data, error } = await supabase
            .from("medications")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        return NextResponse.json({ medication: data }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch medication" },
            { status: 500 }
        );
    }
}

// PATCH /api/medications/:id — Update a medication
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const { data, error } = await supabase
            .from("medications")
            .update({ ...body, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Medication updated", medication: data },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update medication" },
            { status: 500 }
        );
    }
}

// DELETE /api/medications/:id — Remove a medication
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { error } = await supabase
            .from("medications")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Medication removed", id },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to remove medication" },
            { status: 500 }
        );
    }
}
