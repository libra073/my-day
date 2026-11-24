// Durable Postgres persistence for the MY DAY API (Supabase service role).
//
// The API keeps its synchronous in-memory store (server/db.js) and mutates it
// in place. This module hydrates that store from Postgres on boot and diff-syncs
// it back on every save, so data survives serverless restarts (Vercel /tmp is
// ephemeral). The service role bypasses RLS; browser clients are still governed
// by the policies in supabase/migrations.
//
// Identity: in Supabase mode the canonical user id IS the auth.users uuid, so
// profiles.id and every owner_id/user_id/customer_id foreign key line up.
//
// Two app vocabularies are translated at this boundary so the schema CHECKs stay
// canonical without touching route logic:
//   globalRole 'provider' <-> global_role 'vendor'
//   payment status 'success' <-> payments.status 'confirmed'

import { supabaseAdmin } from './supabaseAdmin.js';

const PAGE = 1000;
const CHUNK = 200;

// Collections that Supabase owns end-to-end (auth sessions, password resets,
// email verification) are never persisted here; they stay in-memory and empty.
const IN_MEMORY_ONLY = ['sessions', 'password_resets', 'email_verifications'];

const PLANNING = [
  'tasks', 'decisions', 'notes', 'budget_categories', 'expenses',
  'notifications', 'appointments', 'vendor_schedules', 'complaints',
];

// Insert order respects foreign keys (parents first); deletes run in reverse.
// payments references marketing_requests, so the catalogue and requests load first.
const INSERT_ORDER = [
  'profiles', 'workspaces', 'vendors', 'workspace_members', 'invitations',
  'bookings', 'marketing_services', 'marketing_requests', 'payments',
  'marketing_request_events', 'marketing_request_assets',
  'marketing_request_messages', 'sponsored_placements', 'campaign_reports',
  ...PLANNING,
];
const DELETE_ORDER = [...INSERT_ORDER].reverse();

const nowIso = () => new Date().toISOString();

// --- row mappers -----------------------------------------------------------

function userToRow(u) {
  return {
    id: u.id,
    email: u.email,
    full_name: u.name || '',
    phone: u.phone || '',
    global_role: u.globalRole === 'provider' ? 'vendor' : (u.globalRole || 'customer'),
    email_verified: Boolean(u.emailVerified),
    created_at: u.createdAt || nowIso(),
  };
}
function rowToUser(r) {
  return {
    id: r.id,
    supabaseId: r.id,
    name: r.full_name || '',
    email: r.email,
    phone: r.phone || '',
    globalRole: r.global_role === 'vendor' ? 'provider' : r.global_role,
    emailVerified: Boolean(r.email_verified),
    createdAt: r.created_at,
  };
}

function workspaceToRow(w) {
  return {
    id: w.id,
    owner_id: w.ownerId,
    title: w.title || '',
    bride: w.bride || '',
    groom: w.groom || '',
    date: w.date || null,
    location: w.location || '',
    guests: Number.isFinite(w.guests) ? w.guests : 100,
    budget: Math.round(Number(w.budget) || 0),
    currency: w.currency || 'TZS',
    created_at: w.createdAt || nowIso(),
  };
}
function rowToWorkspace(r) {
  return {
    id: r.id, ownerId: r.owner_id, title: r.title, bride: r.bride, groom: r.groom,
    date: r.date, location: r.location, guests: r.guests, budget: r.budget,
    currency: r.currency, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function memberToRow(m) {
  return {
    id: m.id,
    workspace_id: m.workspaceId,
    user_id: m.userId,
    role: m.role,
    joined_at: m.joinedAt || nowIso(),
    invited_by: m.invitedBy || null,
  };
}
function rowToMember(r) {
  return {
    id: r.id, workspaceId: r.workspace_id, userId: r.user_id, role: r.role,
    joinedAt: r.joined_at, invitedBy: r.invited_by,
  };
}

function invitationToRow(i) {
  return {
    id: i.id,
    workspace_id: i.workspaceId,
    token: i.token,
    email: i.email || null,
    role: i.role || 'friend',
    inviter_id: i.inviterId || null,
    inviter_name: i.inviterName || '',
    status: i.status || 'pending',
    expires_at: i.expiresAt || null,
    accepted_by: i.acceptedBy || null,
    accepted_at: i.acceptedAt || null,
    created_at: i.createdAt || nowIso(),
  };
}
function rowToInvitation(r) {
  return {
    id: r.id, workspaceId: r.workspace_id, token: r.token, email: r.email,
    role: r.role, inviterId: r.inviter_id, inviterName: r.inviter_name,
    status: r.status, expiresAt: r.expires_at, acceptedBy: r.accepted_by,
    acceptedAt: r.accepted_at, createdAt: r.created_at,
  };
}

// vendors keeps typed columns for RLS/catalog plus a jsonb overflow (data) for
// fields the normalized table does not model (description, status, ...).
const VENDOR_COLUMN_KEYS = [
  'id', 'ownerId', 'name', 'category', 'location', 'priceRate', 'contact',
  'unavailableDates', 'verified', 'suspended', 'createdAt', 'updatedAt',
];
function vendorToRow(v) {
  const data = {};
  for (const k of Object.keys(v)) if (!VENDOR_COLUMN_KEYS.includes(k)) data[k] = v[k];
  return {
    id: v.id,
    owner_id: v.ownerId || null,
    name: v.name,
    category: v.category || '',
    location: v.location || '',
    price_rate: Math.round(Number(v.priceRate) || 0),
    contact: v.contact || '',
    unavailable_dates: Array.isArray(v.unavailableDates) ? v.unavailableDates : [],
    verified: Boolean(v.verified),
    suspended: v.status === 'suspended' || Boolean(v.suspended),
    created_at: v.createdAt || nowIso(),
    data,
  };
}
function rowToVendor(r) {
  return {
    ...(r.data || {}),
    id: r.id, ownerId: r.owner_id, name: r.name, category: r.category,
    location: r.location, priceRate: r.price_rate, contact: r.contact,
    unavailableDates: r.unavailable_dates || [], verified: r.verified,
    suspended: r.suspended, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function bookingToRow(b) {
  return {
    id: b.id,
    customer_id: b.customerId,
    provider_id: b.providerId,
    category: b.category || '',
    package_id: b.packageId || null,
    wedding_id: b.weddingId || null,
    date: b.date,
    price: Math.round(Number(b.price) || 0),
    deposit: Math.round(Number(b.deposit) || 0),
    paid_amount: Math.round(Number(b.paidAmount) || 0),
    commission: Math.round(Number(b.commission) || 0),
    status: b.status,
    created_at: b.createdAt || nowIso(),
  };
}
function rowToBooking(r) {
  return {
    id: r.id, customerId: r.customer_id, providerId: r.provider_id,
    category: r.category, packageId: r.package_id, weddingId: r.wedding_id,
    date: r.date, price: r.price, deposit: r.deposit, paidAmount: r.paid_amount,
    commission: r.commission, status: r.status, createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function paymentToRow(p) {
  return {
    id: p.id,
    booking_id: p.bookingId || null,
    marketing_request_id: p.marketingRequestId || null,
    customer_id: p.customerId,
    amount: Math.round(Number(p.amount) || 0),
    gateway: p.gateway || '',
    txn_ref: p.txnRef || '',
    status: p.status === 'success' ? 'confirmed' : p.status,
    created_at: p.createdAt || nowIso(),
  };
}
function rowToPayment(r) {
  return {
    id: r.id, bookingId: r.booking_id, marketingRequestId: r.marketing_request_id,
    customerId: r.customer_id, amount: r.amount,
    gateway: r.gateway, txnRef: r.txn_ref,
    status: r.status === 'confirmed' ? 'success' : r.status,
    createdAt: r.created_at,
  };
}

// Marketing collections: typed columns carry everything RLS and the lifecycle
// need; descriptive/multilingual content round-trips through the jsonb `data`.
const MARKETING_COLUMNS = {
  marketing_services: {
    id: 'id', slug: 'slug', active: 'active', priceType: 'price_type',
    priceTzs: 'price_tzs', sort: 'sort', createdAt: 'created_at', updatedAt: 'updated_at',
  },
  marketing_requests: {
    id: 'id', serviceId: 'service_id', vendorId: 'vendor_id', status: 'status',
    paymentStatus: 'payment_status', assigneeId: 'assignee_id',
    quotedPriceTzs: 'quoted_price_tzs', agreedPriceTzs: 'agreed_price_tzs',
    preferredStart: 'preferred_start', preferredEnd: 'preferred_end',
    campaignStart: 'campaign_start', campaignEnd: 'campaign_end',
    createdAt: 'created_at', updatedAt: 'updated_at',
  },
  marketing_request_events: {
    id: 'id', requestId: 'request_id', actorId: 'actor_id', kind: 'kind',
    fromStatus: 'from_status', toStatus: 'to_status', createdAt: 'created_at',
  },
  marketing_request_assets: {
    id: 'id', requestId: 'request_id', uploadedBy: 'uploaded_by', kind: 'kind',
    status: 'status', storagePath: 'storage_path', createdAt: 'created_at',
  },
  marketing_request_messages: {
    id: 'id', requestId: 'request_id', senderId: 'sender_id',
    senderRole: 'sender_role', body: 'body', createdAt: 'created_at',
  },
  sponsored_placements: {
    id: 'id', vendorId: 'vendor_id', requestId: 'request_id', location: 'location',
    category: 'category', status: 'status', startsAt: 'starts_at', endsAt: 'ends_at',
    createdAt: 'created_at', updatedAt: 'updated_at',
  },
  campaign_reports: {
    id: 'id', requestId: 'request_id', published: 'published',
    createdAt: 'created_at', updatedAt: 'updated_at',
  },
};

function marketingToRow(cols) {
  return (rec) => {
    const row = {};
    const data = {};
    for (const [key, value] of Object.entries(rec)) {
      const col = cols[key];
      if (col) row[col] = value === undefined ? null : value;
      else data[key] = value;
    }
    row.data = data;
    return row;
  };
}
function marketingFromRow(cols) {
  return (r) => {
    const rec = { ...(r.data || {}) };
    for (const [key, col] of Object.entries(cols)) {
      rec[key] = r[col] === undefined ? null : r[col];
    }
    return rec;
  };
}

// Planning collections: id + workspace_id + user_id are columns; everything
// else round-trips through the jsonb `data` payload, so no field is ever lost.
function planningToRow(rec) {
  const { id, workspaceId, userId, createdAt, updatedAt: _updatedAt, ...rest } = rec;
  return {
    id,
    workspace_id: workspaceId || null,
    user_id: userId || null,
    data: rest,
    created_at: createdAt || nowIso(),
  };
}
function rowToPlanning(r) {
  return {
    id: r.id, workspaceId: r.workspace_id, userId: r.user_id,
    ...(r.data || {}), createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

const COLLECTIONS = [
  { collection: 'users', table: 'profiles', toRow: userToRow, fromRow: rowToUser },
  { collection: 'workspaces', table: 'workspaces', toRow: workspaceToRow, fromRow: rowToWorkspace },
  { collection: 'workspace_members', table: 'workspace_members', toRow: memberToRow, fromRow: rowToMember },
  { collection: 'invitations', table: 'invitations', toRow: invitationToRow, fromRow: rowToInvitation },
  { collection: 'vendors', table: 'vendors', toRow: vendorToRow, fromRow: rowToVendor },
  { collection: 'bookings', table: 'bookings', toRow: bookingToRow, fromRow: rowToBooking },
  { collection: 'payments', table: 'payments', toRow: paymentToRow, fromRow: rowToPayment },
  ...Object.entries(MARKETING_COLUMNS).map(([name, cols]) => ({
    collection: name, table: name,
    toRow: marketingToRow(cols), fromRow: marketingFromRow(cols),
  })),
  ...PLANNING.map(name => ({ collection: name, table: name, toRow: planningToRow, fromRow: rowToPlanning })),
];

const BY_TABLE = new Map(COLLECTIONS.map(c => [c.table, c]));

// --- helpers ---------------------------------------------------------------

// Key-order-independent serialization so a hydrated row and a freshly created
// row with identical content do not register as a false diff.
function canonical(value) {
  return JSON.stringify(value, (_k, v) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return Object.keys(v).sort().reduce((acc, key) => { acc[key] = v[key]; return acc; }, {});
    }
    return v;
  });
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function selectAll(table) {
  let from = 0;
  let out = [];
  for (;;) {
    const { data, error } = await supabaseAdmin.from(table).select('*').range(from, from + PAGE - 1);
    if (error) throw new Error(`hydrate ${table}: ${error.message}`);
    out = out.concat(data || []);
    if (!data || data.length < PAGE) break;
    from += PAGE;
  }
  return out;
}

function buildSnapshot(dbData) {
  const snap = {};
  for (const { collection, table, toRow } of COLLECTIONS) {
    const rows = new Map();
    for (const rec of dbData[collection] || []) {
      const row = toRow(rec);
      rows.set(row.id, canonical(row));
    }
    snap[table] = rows;
  }
  return snap;
}

// --- public API ------------------------------------------------------------

let snapshot = {};
let queue = Promise.resolve();

export async function hydrate() {
  const db = {};
  // Reads are independent: fetch all tables in parallel to keep cold starts fast.
  const results = await Promise.all(COLLECTIONS.map(async ({ collection, table, fromRow }) => {
    const rows = await selectAll(table);
    return [collection, rows.map(fromRow)];
  }));
  for (const [collection, records] of results) db[collection] = records;
  for (const name of IN_MEMORY_ONLY) db[name] = [];
  return db;
}

// Baseline the diff against the freshly hydrated state (no writes on boot).
export function setSnapshot(dbData) {
  snapshot = buildSnapshot(dbData);
}

async function doPersist(dbData) {
  const current = buildSnapshot(dbData);

  // Deletes first, children before parents.
  for (const table of DELETE_ORDER) {
    const prev = snapshot[table] || new Map();
    const cur = current[table] || new Map();
    const removed = [...prev.keys()].filter(id => !cur.has(id));
    for (const ids of chunk(removed, CHUNK)) {
      const { error } = await supabaseAdmin.from(table).delete().in('id', ids);
      if (error) throw new Error(`delete ${table}: ${error.message}`);
    }
  }

  // Upserts second, parents before children. Only changed/new rows are written,
  // so unchanged rows keep their updated_at and the write volume stays small.
  for (const table of INSERT_ORDER) {
    const prev = snapshot[table] || new Map();
    const cur = current[table] || new Map();
    const { toRow } = BY_TABLE.get(table);
    const changed = [];
    const byId = new Map((dbData[COLLECTIONS.find(c => c.table === table).collection] || []).map(r => [r.id, r]));
    for (const [id, serialized] of cur) {
      if (prev.get(id) !== serialized) changed.push(toRow(byId.get(id)));
    }
    for (const rows of chunk(changed, CHUNK)) {
      const { error } = await supabaseAdmin.from(table).upsert(rows, { onConflict: 'id' });
      if (error) throw new Error(`upsert ${table}: ${error.message}`);
    }
  }

  snapshot = current;
}

// Serialized best-effort persist. A failed write leaves the snapshot untouched
// so the next save retries the same diff.
export function persist(dbData) {
  queue = queue.then(() => doPersist(dbData)).catch(err => {
    console.error('[pgStore] persist failed (will retry on next save):', err.message);
  });
  return queue;
}