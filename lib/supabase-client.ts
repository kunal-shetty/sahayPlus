/**
 * @file supabase-client.ts
 * @description Initializes and exports the Supabase client for browser-side operations.
 * This client uses the anonymous key and respects Row Level Security (RLS)
 * policies configured in the Supabase database.
 */

import { createClient } from "@supabase/supabase-js";

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * The Supabase client instance used throughout the client-side application.
 * Respects RLS policies for secure data access.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
