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

        const normalizedEmail = email.toLowerCase().trim();

        // Check if a public.users row already exists
        const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", normalizedEmail)
            .maybeSingle();

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

        const validRoles = ["caregiver", "care_receiver", "pharmacist"];
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
                { status: 400 }
            );
        }

        // 1. Create the auth user first so we get a real auth.users.id.
        //    `handle_new_user()` trigger will create the public.users row.
        //    If the email is already in auth.users (orphan state from a
        //    partial reset), admin.createUser fails — fall back to looking
        //    up the existing auth.users row and re-creating public.users
        //    from it instead of failing the whole request.
        let newUserId: string;
        const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
            email: normalizedEmail,
            email_confirm: true,
            user_metadata: { name, role },
        });

        if (signUpError || !authData?.user) {
            const isAlreadyRegistered =
                signUpError?.message?.toLowerCase().includes("already registered") ||
                signUpError?.status === 422;

            if (!isAlreadyRegistered) {
                return NextResponse.json(
                    { error: signUpError?.message || "Failed to create account" },
                    { status: 500 }
                );
            }

            // Orphan recovery: auth.users has the email but public.users
            // does not.  Look up the existing auth.users row by email
            // and rebuild public.users from it.
            const { data: recoveredAuth, error: listError } =
                await supabase.auth.admin.listUsers();
            if (listError) {
                return NextResponse.json(
                    { error: `Orphan auth row but can't list users: ${listError.message}` },
                    { status: 500 }
                );
            }
            const match = recoveredAuth?.users?.find(
                (u: any) => (u.email ?? "").toLowerCase() === normalizedEmail
            );
            if (!match) {
                return NextResponse.json(
                    { error: "Auth reports email registered but row not found." },
                    { status: 500 }
                );
            }
            newUserId = match.id;

            // Manually create the public.users row the trigger would have
            // made, so the rest of the flow can update it.
            const { error: insertErr } = await supabase
                .from("users")
                .insert({
                    id: newUserId,
                    email: normalizedEmail,
                    name,
                    role,
                });
            if (insertErr && !insertErr.message.toLowerCase().includes("duplicate")) {
                return NextResponse.json(
                    { error: `Failed to rebuild public.users: ${insertErr.message}` },
                    { status: 500 }
                );
            }
        } else {
            newUserId = authData.user.id;
        }

        // 2. Generate care_code for care receivers
        let care_code: string | null = null;
        if (role === "care_receiver") {
            let isUnique = false;
            let attempts = 0;
            while (!isUnique && attempts < 10) {
                care_code = generateCareCode();
                const { data: existing } = await supabase
                    .from("users")
                    .select("id")
                    .eq("care_code", care_code)
                    .maybeSingle();
                if (!existing) isUnique = true;
                attempts++;
            }
            if (!isUnique) {
                return NextResponse.json(
                    { error: "Could not generate a unique care code, please try again" },
                    { status: 500 }
                );
            }
        }

        // 3. Update the auto-created public.users row with name, role, and care_code.
        //    The trigger inserts name + null role; we fill the rest in now.
        const { data: newUser, error: updateError } = await supabase
            .from("users")
            .update({
                name,
                role,
                care_code,
            })
            .eq("id", newUserId)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json(
                { error: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Account created",
            user: newUser,
            care_relationship: null,
            is_new: true,
        });
    } catch (error: any) {
        // Unwrap Node's undici "fetch failed" so the real cause is visible
        // (DNS, TLS, ECONNREFUSED, etc.).  Without this the client just sees
        // {"error":"fetch failed"} which is impossible to debug.
        const cause = error?.cause;
        const messages: string[] = [];
        if (error?.message) messages.push(error.message);
        if (cause?.message) messages.push(`cause: ${cause.message}`);
        if (cause?.code) messages.push(`code: ${cause.code}`);
        if (cause?.errno) messages.push(`errno: ${cause.errno}`);
        const detail = messages.length ? messages.join(" | ") : "Failed to login";
        console.error("[/api/auth/login] error:", error);
        return NextResponse.json({ error: detail }, { status: 500 });
    }
}
