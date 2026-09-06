/**
 * @file route.ts
 * @description API routes for managing pharmacist contacts.
 * Provides endpoints to list, create, and delete pharmacist contact information.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/pharmacist-contacts
 * Retrieves a list of pharmacist contacts for a given care relationship.
 *
 * @param {NextRequest} req - The incoming request containing `care_relationship_id` as a query parameter.
 * @returns {Promise<NextResponse>} JSON response containing the list of contacts.
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
      .from("pharmacist_contacts")
      .select("*")
      .eq("care_relationship_id", careRelationshipId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ contacts: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch pharmacist contacts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pharmacist-contacts
 * Adds a new pharmacist contact for a specific care relationship.
 *
 * @param {NextRequest} req - The incoming request containing the contact details in the body.
 * @returns {Promise<NextResponse>} JSON response with the created contact object.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { care_relationship_id, name, phone, address, note } = body;

    if (!care_relationship_id || !name) {
      return NextResponse.json(
        { error: "Missing required fields: care_relationship_id, name" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("pharmacist_contacts")
      .insert({
        care_relationship_id,
        name,
        phone: phone || null,
        address: address || null,
        note: note || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Pharmacist contact added", contact: data },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add pharmacist contact" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pharmacist-contacts
 * Deletes a pharmacist contact by its ID.
 *
 * @param {NextRequest} req - The incoming request containing the `id` of the contact as a query parameter.
 * @returns {Promise<NextResponse>} JSON response confirming the deletion.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required query param: id" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("pharmacist_contacts")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Pharmacist contact deleted" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete pharmacist contact" },
      { status: 500 }
    );
  }
}
