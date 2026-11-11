// Node < 22 has no global WebSocket and supabase-js initialises Realtime eagerly.
if (typeof globalThis.WebSocket === 'undefined') {
  const { WebSocket } = await import('ws');
  globalThis.WebSocket = WebSocket;
}

import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client (service role).
 *
 * Used for two things only:
 *   1. verifying the access token that the browser sends on each API call
 *   2. admin operations (deleting users, resending confirmations)
 *
 * If the env vars are absent the client is null and the API keeps using the
 * legacy session tokens, so the project runs before keys are configured.
 */
const url = process.env.SUPABASE_URL || '';
// Supabase renamed service-role keys to secret keys; accept either name.
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  '';

export const isSupabaseConfigured = Boolean(url && serviceRoleKey);

export const supabaseAdmin = isSupabaseConfigured
  ? createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

/**
 * Returns the Supabase user for a bearer token, or null when the token is
 * missing, expired, or the project is not configured.
 */
export async function getUserFromToken(token) {
  if (!token || !supabaseAdmin) return null;
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch {
    return null;
  }
}
