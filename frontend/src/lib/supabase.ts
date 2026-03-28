import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ── Server-Side Admin Client (API routes only — never exposed to browser) ──
// Uses the service_role key which bypasses Row Level Security.
// Lazy-initialized to avoid crashing during Next.js build time when env vars aren't set.

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }

  _supabaseAdmin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _supabaseAdmin;
}

// Convenience getter that matches the old import style
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as any)[prop];
  },
});

// ── Client-Side Public Client (safe for browser — respects RLS) ──
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabasePublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

export const supabasePublic =
  supabasePublicUrl && supabaseAnonKey
    ? createClient(supabasePublicUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      })
    : null;
