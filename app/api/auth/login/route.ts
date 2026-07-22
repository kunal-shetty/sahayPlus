import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Generate a random 6-character alphanumeric code
function generateCareCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No 0/O/1/I to avoid confusion
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// POST /api/auth/login — Email-only login/signup
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, name, role } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", email.toLowerCase().trim())
            .single();

        if (existingUser) {
            // Existing user — fetch their care relationship
            const { data: relationships } = await supabase
                .from("care_relationships")
                .select("*")
                .or(`caregiver_id.eq.${existingUser.id},care_receiver_id.eq.${existingUser.id}`)
                .limit(1);

            return NextResponse.json({
                message: "Login successful",
                user: existingUser,
                care_relationship: relationships && relationships.length > 0 ? relationships[0] : null,
                is_new: false,
            });
        }

        // New user — require name and role
        if (!name || !role) {
            return NextResponse.json(
                { error: "Name and role are required for new users" },
                { status: 400 }
            );
        }

        // Generate care_code for care receivers
        let care_code: string | null = null;
        if (role === "care_receiver") {
            // Generate unique code
            let isUnique = false;
            while (!isUnique) {
                care_code = generateCareCode();
                const { data: existing } = await supabase
                    .from("users")
                    .select("id")
                    .eq("care_code", care_code)
                    .single();
                if (!existing) isUnique = true;
            }
        }

        // Create the user
        const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert({
                email: email.toLowerCase().trim(),
                name,
                role,
                care_code,
            })
            .select()
            .single();

        if (insertError) {
            return NextResponse.json(
                { error: insertError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Account created",
            user: newUser,
            care_relationship: null,
            is_new: true,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to login" },
            { status: 500 }
        );
    }
}
