/**
 * @file route.ts
 * @description API routes for managing emergency contacts.
 * Provides endpoints to retrieve and create emergency contacts for a specific care relationship.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/emergency-contacts
 * Retrieves a list of emergency contacts for a given care relationship.
 *
 * @param {NextRequest} req - The incoming request containing `care_relationship_id` as a query parameter.
 * @returns {Promise<NextResponse>} JSON response containing the list of contacts, ordered by primary status.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const careRelationshipId = searchParams.get("care_relationship_id");

        if (!careRelationshipId) {
            return NextResponse.json(
                { error: "Missing required query param: care_relationship_id" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("emergency_contacts")
            .select("*")
            .eq("care_relationship_id", careRelationshipId)
            .order("is_primary", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ contacts: data }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch emergency contacts" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/emergency-contacts
 * Adds a new emergency contact to the database for a specific care relationship.
 *
 * @param {NextRequest} req - The incoming request containing the contact details in the body.
 * @returns {Promise<NextResponse>} JSON response with the created contact object.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { care_relationship_id, name, relationship, phone, is_primary } = body;

        if (!care_relationship_id || !name || !phone) {
            return NextResponse.json(
                { error: "Missing required fields: care_relationship_id, name, phone" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("emergency_contacts")
            .insert({
                care_relationship_id,
                name,
                relationship: relationship || null,
                phone,
                is_primary: is_primary || false,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Emergency contact added", contact: data },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to add emergency contact" },
            { status: 500 }
        );
    }
}
