import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// PATCH /api/messages/:id/read — Mark a message as read
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data, error } = await supabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Message marked as read", data },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to mark message as read" },
            { status: 500 }
        );
    }
}
