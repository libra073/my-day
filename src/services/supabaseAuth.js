import { supabase, isSupabaseConfigured, SUPABASE_NOT_CONFIGURED } from '../lib/supabaseClient';

/**
 * Identity layer backed by Supabase Auth.
 *
 * Supabase owns: passwords, email verification, password reset, sessions.
 * MY DAY owns: the profile row (name, phone, role) that maps to a Supabase user.
 */

const redirectTo = `${window.location.origin}/auth/callback`;

function assertConfigured() {
  if (!isSupabaseConfigured) throw new Error(SUPABASE_NOT_CONFIGURED);
}

/** Create the account and trigger Supabase's confirmation email. */
export async function signUp({ email, password, name, role = 'customer', vendorCategory, vendorLocation, phone }) {
  assertConfigured();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        full_name: name,
        global_role: role,
        vendor_category: vendorCategory || null,
        vendor_location: vendorLocation || null,
        phone: phone || null,
      },
    },
  });
  if (error) throw error;
  return {
    user: data.user,
    // Supabase returns a session when "Confirm email" is disabled; otherwise null
    needsEmailConfirmation: !data.session,
  };
}

/** Password sign-in; fails with "Email not confirmed" until the link is clicked. */
export async function signIn({ email, password }) {
  assertConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut().catch(() => {});
}

/** Sends the password-reset email with a link back to /auth/callback?type=recovery. */
export async function sendPasswordReset(email) {
  assertConfigured();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

/** Used on the reset screen once the recovery link has established a session. */
export async function updatePassword(newPassword) {
  assertConfigured();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

/** Re-sends the confirmation email for an unverified account. */
export async function resendConfirmation(email) {
  assertConfigured();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
}

/** Current session (or null) — used to hydrate app state on load. */
export async function getSession() {
  if (!isSupabaseConfigured) return { data: { session: null } };
  return supabase.auth.getSession();
}

/** Current session token to send as `Authorization: Bearer …` to the MY DAY API. */
export async function getAccessToken() {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || null;
}

/** Subscribe to sign-in / sign-out / token refresh. Returns an unsubscribe fn. */
export function onAuthChange(handler) {
  if (!isSupabaseConfigured) return () => {};
  const { data } = supabase.auth.onAuthStateChange((event, session) => handler(event, session));
  return () => data?.subscription?.unsubscribe?.();
}

/** Shape a Supabase user into the object MY DAY components already expect. */
export function toAppUser(supabaseUser) {
  if (!supabaseUser) return null;
  const meta = supabaseUser.user_metadata || {};
  return {
    id: supabaseUser.id,
    supabaseId: supabaseUser.id,
    email: supabaseUser.email,
    name: meta.full_name || supabaseUser.email?.split('@')[0] || 'MY DAY user',
    phone: meta.phone || '',
    role: meta.global_role || 'customer',
    globalRole: meta.global_role || 'customer',
    vendorCategory: meta.vendor_category || null,
    vendorLocation: meta.vendor_location || null,
    emailVerified: Boolean(supabaseUser.email_confirmed_at),
  };
}
