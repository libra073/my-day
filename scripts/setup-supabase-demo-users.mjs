/**
 * Creates the MY DAY demo accounts inside Supabase.
 *
 *   node scripts/setup-supabase-demo-users.mjs
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in the environment (or .env).
 * Email confirmation is pre-set so the demo accounts can sign in immediately.
 */
import 'dotenv/config';
// Node < 22 has no global WebSocket and supabase-js initialises Realtime eagerly.
if (typeof globalThis.WebSocket === 'undefined') {
  const { WebSocket } = await import('ws');
  globalThis.WebSocket = WebSocket;
}

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  console.error('Add them to .env (see .env.example), then run this again.');
  process.exit(1);
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const DEMO_USERS = [
  { email: 'john@myday.co.tz', name: 'John Msuya (Groom)', role: 'customer', phone: '+255 777 123 456' },
  { email: 'sarah@myday.co.tz', name: 'Sarah Kimaro (Bride)', role: 'customer', phone: '+255 777 654 321' },
  { email: 'neema@planning.co.tz', name: 'Neema Wedding Planners', role: 'customer', phone: '+255 714 888 777' },
  { email: 'info@grandimperial.co.tz', name: 'Grand Imperial Hall', role: 'provider', vendorCategory: 'kumbi', vendorLocation: 'Dar es Salaam' },
  { email: 'admin@myday.co.tz', name: 'MY DAY Superadmin', role: 'admin', phone: '+255 766 466 187' },
];

const results = [];

for (const user of DEMO_USERS) {
  const { data, error } = await admin.auth.admin.createUser({
    email: user.email,
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: user.name,
      global_role: user.role,
      phone: user.phone || null,
      vendor_category: user.vendorCategory || null,
      vendor_location: user.vendorLocation || null,
    },
  });

  if (error) {
    const already = /already/i.test(error.message);
    results.push({ email: user.email, status: already ? 'exists' : 'error', detail: already ? '' : error.message });
  } else {
    results.push({ email: user.email, status: 'created', id: data.user?.id });
  }
}

console.table(results);

const failed = results.filter((r) => r.status === 'error');
if (failed.length) {
  console.error(`\n${failed.length} account(s) failed. Fix the errors above and re-run.`);
  process.exit(1);
}

console.log('\nDone. Demo password for every account: password123');
