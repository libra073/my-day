// Test-only fixtures. Production starts from an empty store (no demo seeds),
// so each suite builds the users, vendors and workspaces it needs here.
// These helpers write directly to the in-memory DB and mint legacy session
// tokens; they are never imported by the server or the frontend.
import crypto from 'node:crypto';
import { loadDatabase, saveDatabase, hashPassword } from '../server/db.js';
import { createSessionToken } from '../server/auth.js';

export function seedUser({
  id,
  name,
  email,
  password = 'Password123!',
  globalRole = 'customer',
  phone = '',
  emailVerified = true,
} = {}) {
  const db = loadDatabase();
  const userId = id || `usr-${crypto.randomBytes(6).toString('hex')}`;
  const user = {
    id: userId,
    name: name || email.split('@')[0],
    email: email.toLowerCase(),
    phone,
    passwordHash: hashPassword(password),
    globalRole,
    emailVerified,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  saveDatabase();
  const token = createSessionToken(userId);
  return { user, token, password };
}

export function seedVendor({
  id,
  name,
  category = 'kumbi',
  location = 'Dar es Salaam',
  priceRate,
  status = 'verified',
  ownerId = null,
} = {}) {
  const db = loadDatabase();
  const vendor = {
    id: id || `vendor-${crypto.randomBytes(4).toString('hex')}`,
    ownerId,
    name: name || 'Test Vendor',
    category,
    location,
    contact: '+255777000111',
    priceRate,
    description: '',
    status,
    verified: status === 'verified',
    createdAt: new Date().toISOString(),
  };
  db.vendors = [...(db.vendors || []), vendor];
  saveDatabase();
  return vendor;
}

export function seedWorkspace({ id, ownerId, title = 'Test Wedding', date = '2026-12-25' } = {}) {
  const db = loadDatabase();
  const workspaceId = id || `wed-${crypto.randomBytes(6).toString('hex')}`;
  const now = new Date().toISOString();
  const workspace = {
    id: workspaceId,
    title,
    ownerId,
    bride: '',
    groom: '',
    date,
    location: 'Dar es Salaam',
    guests: 100,
    budget: 10000000,
    currency: 'TZS',
    createdAt: now,
    updatedAt: now,
  };
  db.workspaces.push(workspace);
  db.workspace_members.push({
    id: `wm-${crypto.randomBytes(6).toString('hex')}`,
    workspaceId,
    userId: ownerId,
    role: 'owner',
    joinedAt: now,
    invitedBy: null,
  });
  saveDatabase();
  return workspace;
}