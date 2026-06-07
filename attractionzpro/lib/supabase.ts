import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createBrowserClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export function createSupabaseServerClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export function createAdminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}