import crypto from 'node:crypto';
import { loadDatabase, saveDatabase } from './db.js';

export const WORKSPACE_ROLES = {
  OWNER: 'owner',
  PARTNER: 'partner',
  PLANNER: 'planner',
  FAMILY: 'family',
  FRIEND: 'friend',
  VENDOR: 'vendor',
};

// Capabilities defined per role
export const ROLE_PERMISSIONS = {
  owner: {
    canEditWorkspace: true,
    canInviteMembers: true,
    canChangeRoles: true,
    canRemoveMembers: true,
    canManageBudget: true,
    canRecordExpenses: true,
    canManageVendors: true,
    canManageTasks: true,
    canCommentTasks: true,
    canManageDecisions: true,
    canVoteDecisions: true,
    canViewFinancials: true,
  },
  partner: {
    canEditWorkspace: true,
    canInviteMembers: true,
    canChangeRoles: false,
    canRemoveMembers: false,
    canManageBudget: true,
    canRecordExpenses: true,
    canManageVendors: true,
    canManageTasks: true,
    canCommentTasks: true,
    canManageDecisions: true,
    canVoteDecisions: true,
    canViewFinancials: true,
  },
  planner: {
    canEditWorkspace: false,
    canInviteMembers: true,
    canChangeRoles: false,
    canRemoveMembers: false,
    canManageBudget: true,
    canRecordExpenses: true,
    canManageVendors: true,
    canManageTasks: true,
    canCommentTasks: true,
    canManageDecisions: true,
    canVoteDecisions: true,
    canViewFinancials: true,
  },
  family: {
    canEditWorkspace: false,
    canInviteMembers: false,
    canChangeRoles: false,
    canRemoveMembers: false,
    canManageBudget: false,
    canRecordExpenses: false,
    canManageVendors: false,
    canManageTasks: false,
    canCommentTasks: true,
    canManageDecisions: false,
    canVoteDecisions: true,
    canViewFinancials: false,
  },
  friend: {
    canEditWorkspace: false,
    canInviteMembers: false,
    canChangeRoles: false,
    canRemoveMembers: false,
    canManageBudget: false,
    canRecordExpenses: false,
    canManageVendors: false,
    canManageTasks: false,
    canCommentTasks: true,
    canManageDecisions: false,
    canVoteDecisions: true,
    canViewFinancials: false,
  },
  vendor: {
    canEditWorkspace: false,
    canInviteMembers: false,
    canChangeRoles: false,
    canRemoveMembers: false,
    canManageBudget: false,
    canRecordExpenses: false,
    canManageVendors: false,
    canManageTasks: false,
    canCommentTasks: false,
    canManageDecisions: false,
    canVoteDecisions: false,
    canViewFinancials: false,
  },
};

/**
 * Maps a verified Supabase user onto the local user table.
 * Creates the row on first contact, links it by email if it already exists,
 * and keeps MY DAY roles/vendor fields in sync with Supabase metadata.
 */
export function upsertUserFromSupabase(supaUser) {
  const db = loadDatabase();
  const email = (supaUser.email || '').toLowerCase();
  const meta = supaUser.user_metadata || {};

  let user = db.users.find((u) => u.supabaseId === supaUser.id)
    || db.users.find((u) => (u.email || '').toLowerCase() === email);

  if (!user) {
    user = {
      id: 'usr-' + crypto.randomBytes(6).toString('hex'),
      supabaseId: supaUser.id,
      name: meta.full_name || email.split('@')[0] || 'MY DAY user',
      email,
      phone: meta.phone || '',
      globalRole: meta.global_role || 'customer',
      emailVerified: Boolean(supaUser.email_confirmed_at),
      createdAt: new Date().toISOString(),
      ...(meta.vendor_category
        ? { vendorCategory: meta.vendor_category, vendorLocation: meta.vendor_location || '' }
        : {}),
    };
    db.users.push(user);
    saveDatabase();
    return user;
  }

  let dirty = false;
  if (user.supabaseId !== supaUser.id) { user.supabaseId = supaUser.id; dirty = true; }
  if (supaUser.email_confirmed_at && !user.emailVerified) { user.emailVerified = true; dirty = true; }
  if (meta.full_name && !user.name) { user.name = meta.full_name; dirty = true; }
  if (dirty) saveDatabase();
  return user;
}

export function createSessionToken(userId) {
  const token = 'myday_sess_' + crypto.randomBytes(24).toString('hex');
  const db = loadDatabase();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
  db.sessions.push({ token, userId, expiresAt });
  saveDatabase();
  return token;
}

export function getUserByToken(token) {
  if (!token) return null;
  const db = loadDatabase();
  const session = db.sessions.find(s => s.token === token && new Date(s.expiresAt) > new Date());
  if (!session) return null;
  return db.users.find(u => u.id === session.userId) || null;
}

export function revokeSessionToken(token) {
  const db = loadDatabase();
  db.sessions = db.sessions.filter(s => s.token !== token);
  saveDatabase();
}

export function getWorkspaceMembership(workspaceId, userId) {
  const db = loadDatabase();
  return db.workspace_members.find(
    m => m.workspaceId === workspaceId && m.userId === userId
  ) || null;
}

export function checkWorkspaceAccess(workspaceId, userId, requiredPermission = null) {
  const db = loadDatabase();
  const workspace = db.workspaces.find(w => w.id === workspaceId);
  if (!workspace) {
    return { authorized: false, error: 'Workspace not found', status: 404 };
  }

  const membership = getWorkspaceMembership(workspaceId, userId);
  if (!membership) {
    return { authorized: false, error: 'Forbidden: You do not have access to this workspace', status: 403 };
  }

  if (requiredPermission) {
    const permissions = ROLE_PERMISSIONS[membership.role] || {};
    if (!permissions[requiredPermission]) {
      return { authorized: false, error: `Forbidden: Role '${membership.role}' lacks '${requiredPermission}' permission`, status: 403 };
    }
  }

  return { authorized: true, workspace, membership };
}
