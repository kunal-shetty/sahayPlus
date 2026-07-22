import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// DELETE /api/emergency-contacts/:id — Remove an emergency contact
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { error } = await supabase
            .from("emergency_contacts")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Emergency contact removed", id },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to remove emergency contact" },
            { status: 500 }
        );
    }
}
