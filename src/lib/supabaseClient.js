import { createClient } from '@supabase/supabase-js';

/**
 * Supabase owns identity: sign-up, email confirmation, sign-in, password reset.
 * MY DAY owns the wedding data and maps a Supabase user id onto a local row.
 *
 * When the env vars are missing the client is null and the app falls back to
 * the legacy local auth path, so the project still boots before keys are set.
 */
const url = import.meta.env.VITE_SUPABASE_URL || '';
// Supabase renamed anon keys to publishable keys; accept either name.
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'implicit',
      },
    })
  : null;

/** Human-readable reason shown in the UI when auth is not configured yet. */
export const SUPABASE_NOT_CONFIGURED =
  'Authentication is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
