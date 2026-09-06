/**
 * @file route.ts
 * @description API routes for managing system notifications.
 * Provides endpoints to retrieve notifications for a user and create new alerts.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/notifications
 * Retrieves a paginated list of notifications for a specific user.
 *
 * @param {NextRequest} req - The incoming request.
 * @param {string} req.query.user_id - Required. The ID of the user.
 * @param {string} [req.query.limit="50"] - Maximum number of notifications to return.
 * @param {string} [req.query.offset="0"] - The starting offset for pagination.
 * @returns {Promise<NextResponse>} JSON response containing notifications and pagination metadata.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("user_id");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        if (!userId) {
            return NextResponse.json(
                { error: "Missing required query param: user_id" },
                { status: 400 }
            );
        }

        const { data, error, count } = await supabase
            .from("notifications")
            .select("*", { count: "exact" })
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { notifications: data, limit, offset, total: count },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/notifications
 * Creates a new notification for a specific user.
 *
 * @param {NextRequest} req - The incoming request containing `user_id`, `type`, `title`, and `body` in the body.
 * @returns {Promise<NextResponse>} JSON response confirming the notification was created.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user_id, type, title, body: notifBody } = body;

        if (!user_id || !type || !title || !notifBody) {
            return NextResponse.json(
                { error: "Missing required fields: user_id, type, title, body" },
                { status: 400 }
            );
        }

        const validTypes = [
            "medication_reminder",
            "refill_warning",
            "safety_alert",
            "wellness_reminder",
            "message",
            "check_in_suggestion",
            "medication_taken"
        ];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("notifications")
            .insert({
                user_id,
                type,
                title,
                body: notifBody,
                sent_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Notification created", notification: data },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create notification" },
            { status: 500 }
        );
    }
}
