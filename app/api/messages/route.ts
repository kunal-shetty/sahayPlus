/**
 * @file route.ts
 * @description API routes for managing messages between care parties.
 * Provides endpoints to retrieve message history and send new messages.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/messages
 * Retrieves a paginated list of messages for a specific care relationship.
 *
 * @param {NextRequest} req - The incoming request.
 * @param {string} req.query.care_relationship_id - Required. The ID of the relationship.
 * @param {string} [req.query.limit="50"] - Maximum number of messages to return.
 * @param {string} [req.query.offset="0"] - The starting offset for pagination.
 * @returns {Promise<NextResponse>} JSON response containing messages and pagination metadata.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const careRelationshipId = searchParams.get("care_relationship_id");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        if (!careRelationshipId) {
            return NextResponse.json(
                { error: "Missing required query param: care_relationship_id" },
                { status: 400 }
            );
        }

        const { data, error, count } = await supabase
            .from("messages")
            .select("*", { count: "exact" })
            .eq("care_relationship_id", careRelationshipId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { messages: data, limit, offset, total: count },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/messages
 * Sends a new message within a care relationship.
 *
 * @param {NextRequest} req - The incoming request containing `care_relationship_id`, `from_user_id`, and `text` in the body.
 * @returns {Promise<NextResponse>} JSON response confirming the message was sent.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { care_relationship_id, from_user_id, text } = body;

        if (!care_relationship_id || !from_user_id || !text) {
            return NextResponse.json(
                {
                    error: "Missing required fields: care_relationship_id, from_user_id, text",
                },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("messages")
            .insert({
                care_relationship_id,
                from_user_id,
                text,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Message sent", data },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        );
    }
}
