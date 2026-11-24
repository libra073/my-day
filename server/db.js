import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { isSupabaseConfigured } from './supabaseAdmin.js';
import * as pgStore from './pgStore.js';
import { seedMarketingServices } from './marketingSeed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_FILE = path.join(__dirname, 'data', 'db.json');
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'myday-data') : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists safely (JSON fallback only; Postgres needs no dir)
if (!isSupabaseConfigured) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn('Notice: Could not create DATA_DIR:', e.message);
  }
}

// In-memory representation. With Supabase configured this is a durable cache of
// Postgres (hydrated on boot, diff-synced on save); otherwise it is the JSON
// file store used by local development and the test suite.
let dbData = null;
let writePromise = Promise.resolve();
let readyPromise = null;

function hashPassword(password) {
  const salt = 'myday_salt_2026';
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

function getInitialDatabase() {
  // Production starts empty: no demo accounts, sessions, bookings or payments.
  // Admins are bootstrapped server-side via MYDAY_ADMIN_EMAILS only.
  return {
    users: [],
    workspaces: [],
    workspace_members: [],
    invitations: [],
    sessions: [],
    tasks: [],
    decisions: [],
    notes: [],
    budget_categories: [],
    expenses: [],
    notifications: [],
    appointments: [],
    vendor_schedules: [],
    bookings: [],
    payments: [],
    vendors: [],
    complaints: [],
    marketing_services: [],
    marketing_requests: [],
    marketing_request_events: [],
    marketing_request_assets: [],
    marketing_request_messages: [],
    sponsored_placements: [],
    campaign_reports: [],
    password_resets: [],
    email_verifications: []
  };
}

// Hydrate the stable in-memory object from Postgres in place, so any reference
// captured before hydration completes observes the loaded data once ready.
function initPg() {
  if (readyPromise) return readyPromise;
  if (!dbData) dbData = getInitialDatabase();
  const target = dbData;
  readyPromise = (async () => {
    const loaded = await pgStore.hydrate();
    Object.assign(target, loaded);
    pgStore.setSnapshot(target);
    return target;
  })();
  return readyPromise;
}

// Resolves once the store is usable. Every API request awaits this before
// touching the database, so serverless cold starts never serve an empty cache.
export function databaseReady() {
  if (!isSupabaseConfigured) {
    if (!dbData) loadDatabase();
    return Promise.resolve(dbData);
  }
  return initPg();
}

export function loadDatabase() {
  if (dbData) return dbData;

  // Postgres mode: return the stable cache now and hydrate asynchronously.
  if (isSupabaseConfigured) {
    dbData = getInitialDatabase();
    initPg();
    return dbData;
  }

  const targetFile = fs.existsSync(DB_FILE) ? DB_FILE : (fs.existsSync(SEED_FILE) ? SEED_FILE : null);

  if (targetFile) {
    try {
      const raw = fs.readFileSync(targetFile, 'utf-8');
      dbData = JSON.parse(raw);

      // Automatic schema migration for new collections if loading older DB file
      const initial = getInitialDatabase();
      let modified = false;

      const collections = [
        'tasks',
        'decisions',
        'notes',
        'budget_categories',
        'expenses',
        'notifications',
        'appointments',
        'vendor_schedules',
        'bookings',
        'payments',
        'marketing_services',
        'marketing_requests',
        'marketing_request_events',
        'marketing_request_assets',
        'marketing_request_messages',
        'sponsored_placements',
        'campaign_reports',
        'password_resets',
        'email_verifications'
      ];

      for (const col of collections) {
        if (!dbData[col]) {
          dbData[col] = initial[col] || [];
          modified = true;
        }
      }

      // Catalogue is configuration, not demo data: the JSON store seeds it the
      // same way migration 0003 seeds Postgres.
      if (!dbData.marketing_services.length) {
        dbData.marketing_services = seedMarketingServices();
        modified = true;
      }

      if (Array.isArray(dbData.users)) {
        for (const u of dbData.users) {
          if (u.emailVerified === undefined) {
            u.emailVerified = true;
            modified = true;
          }
        }
      }

      if (modified) {
        saveDatabaseSync();
      }

      return dbData;
    } catch (err) {
      console.warn('Could not read existing database, generating fresh initial store:', err.message);
    }
  }

  dbData = getInitialDatabase();
  dbData.marketing_services = seedMarketingServices();
  saveDatabaseSync();
  return dbData;
}

export function saveDatabaseSync() {
  if (!dbData) return;
  // No synchronous network I/O: in Postgres mode queue the async diff-sync.
  if (isSupabaseConfigured) {
    pgStore.persist(dbData);
    return;
  }
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.${Date.now()}-${Math.random().toString(36).substring(2, 7)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(dbData, null, 2), 'utf-8');
    try {
      fs.renameSync(tempFile, DB_FILE);
    } catch (e) {
      fs.copyFileSync(tempFile, DB_FILE);
      try { fs.unlinkSync(tempFile); } catch (_) {}
    }
  } catch (err) {
    console.warn('Notice: Could not write database sync to disk:', err.message);
  }
}

export async function saveDatabase() {
  if (!dbData) return;
  if (isSupabaseConfigured) {
    return pgStore.persist(dbData);
  }
  writePromise = writePromise.then(async () => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        await fs.promises.mkdir(DATA_DIR, { recursive: true });
      }
      const tempFile = `${DB_FILE}.${Date.now()}-${Math.random().toString(36).substring(2, 7)}.tmp`;
      await fs.promises.writeFile(tempFile, JSON.stringify(dbData, null, 2), 'utf-8');
      try {
        await fs.promises.rename(tempFile, DB_FILE);
      } catch (e) {
        await fs.promises.copyFile(tempFile, DB_FILE);
        try { await fs.promises.unlink(tempFile); } catch (_) {}
      }
    } catch (err) {
      console.warn('Notice: Could not write database async to disk:', err.message);
    }
  });
  return writePromise;
}

export function resetDatabase() {
  dbData = getInitialDatabase();
  if (isSupabaseConfigured) {
    // Test-only helper; re-baseline the diff without wiping durable Postgres.
    pgStore.setSnapshot(dbData);
  } else {
    saveDatabaseSync();
  }
  return dbData;
}

export { hashPassword };
