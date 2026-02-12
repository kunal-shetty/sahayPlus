import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service_role key for server-side API routes — bypasses RLS
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
