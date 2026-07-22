import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/auth/register — Register a new user
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, phone, name, nickname, role } = body;

        if (!email || !password || !name || !role) {
            return NextResponse.json(
                { error: "Missing required fields: email, password, name, role" },
                { status: 400 }
            );
        }

        const validRoles = ["caregiver", "care_receiver", "pharmacist"];
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
                { status: 400 }
            );
        }

        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        // Insert user profile into users table
        const { data: user, error: userError } = await supabase
            .from("users")
            .insert({
                id: authData.user?.id,
                email,
                phone: phone || null,
                name,
                nickname: nickname || null,
                role,
                prefer_voice_confirm: false,
            })
            .select()
            .single();

        if (userError) {
            return NextResponse.json({ error: userError.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "User registered successfully", user },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to register user" },
            { status: 500 }
        );
    }
}
