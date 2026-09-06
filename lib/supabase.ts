/**
 * @file supabase.ts
 * @description Initializes and exports the Supabase admin client for server-side operations.
 * This client uses the service_role key, which bypasses Row Level Security (RLS),
 * allowing the server to perform administrative tasks and cross-user queries.
 *
 * WARNING: This client should ONLY be used in server-side environments (API routes, Server Components).
 * Never expose this client or the service_role key to the browser.
 */

import { createClient } from "@supabase/supabase-js";

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * The Supabase admin client instance used in server-side API routes.
 * Bypasses RLS for administrative access.
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
