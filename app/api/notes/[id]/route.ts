import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// DELETE /api/notes/:id — Remove a contextual note
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { error } = await supabase
            .from("contextual_notes")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Note removed", id },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to remove note" },
            { status: 500 }
        );
    }
}
