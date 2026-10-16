import crypto from 'node:crypto';
import { loadDatabase, saveDatabase, hashPassword } from './db.js';
import {
  createSessionToken,
  getUserByToken,
  revokeSessionToken,
  checkWorkspaceAccess,
  ROLE_PERMISSIONS,
  WORKSPACE_ROLES,
} from './auth.js';
import {
  PLATFORM_TIMEZONE,
  DEFAULT_OPERATING_SCHEDULE,
  getCurrentOfficeStatus,
  getDarEsSalaamParts,
  formatDarEsSalaamDateTime,
  validateAppointmentSlot,
  getEffectiveVendorSchedule,
  canDeliverNotification,
} from './businessSchedule.js';

// In-memory sliding window rate limiter
const rateLimitMap = new Map();

function checkRateLimit(req, res, maxRequests = 25, windowMs = 60000) {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const endpoint = (req.url || '').split('?')[0];
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) || []).filter(t => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Retry-After', Math.ceil(windowMs / 1000).toString());
    res.end(JSON.stringify({ error: 'Too many requests. Please slow down and try again later.', status: 429 }));
    return false;
  }

  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return true;
}

export function resetRateLimits() {
  rateLimitMap.clear();
}

function parseBearerToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  return null;
}

export function handleApiRequest(req, res, urlObj) {
  const method = req.method.toUpperCase();
  const pathname = urlObj.pathname;

  // Helper response functions
  const json = (data, status = 200) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  const err = (message, status = 400) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: message }));
  };

  const db = loadDatabase();

  // Helper to read JSON body
  const readBody = () => {
    if (req.body !== undefined && req.body !== null) {
      if (typeof req.body === 'object') return Promise.resolve(req.body);
      if (typeof req.body === 'string') {
        try {
          return Promise.resolve(JSON.parse(req.body));
        } catch (e) {
          return Promise.reject(new Error('Invalid JSON'));
        }
      }
    }
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        if (!body) return resolve({});
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Invalid JSON'));
        }
      });
      req.on('error', reject);
    });
  };

  // Helper to get authenticated user
  const authenticate = () => {
    const token = parseBearerToken(req);
    const user = getUserByToken(token);
    return { token, user };
  };

  return (async () => {
    // Rate limit check on sensitive endpoints (prevent brute-force and spam)
    if (['/api/auth/register', '/api/auth/login', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/payments'].includes(pathname)) {
      if (!checkRateLimit(req, res, 20, 60000)) {
        return;
      }
    }

    // -------------------------------------------------------------
    // AUTH ROUTES
    // -------------------------------------------------------------
    if (pathname === '/api/auth/register' && method === 'POST') {
      const body = await readBody();
      const { name, email, password, phone, role = 'customer' } = body;

      if (!name || !email || !password) {
        return err('Name, email, and password are required', 400);
      }

      const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return err('Email already registered', 409);
      }

      const userId = `usr-${crypto.randomBytes(6).toString('hex')}`;
      const newUser = {
        id: userId,
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        passwordHash: hashPassword(password),
        globalRole: role,
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);
      const token = createSessionToken(userId);
      await saveDatabase();

      const { passwordHash: _, ...safeUser } = newUser;
      return json({ user: safeUser, token }, 201);
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await readBody();
      const { email, password } = body;

      if (!email || !password) {
        return err('Email and password are required', 400);
      }

      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return err('Invalid email or password', 401);
      }

      if (user.passwordHash !== hashPassword(password)) {
        return err('Invalid email or password', 401);
      }

      const token = createSessionToken(user.id);
      const { passwordHash: _, ...safeUser } = user;
      return json({ user: safeUser, token });
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      const { user, token } = authenticate();
      if (!user) {
        return err('Unauthorized', 401);
      }

      const userMemberships = db.workspace_members.filter(m => m.userId === user.id);
      const workspaceIds = userMemberships.map(m => m.workspaceId);
      const workspaces = db.workspaces
        .filter(w => workspaceIds.includes(w.id))
        .map(w => {
          const membership = userMemberships.find(m => m.workspaceId === w.id);
          return {
            ...w,
            userRole: membership?.role,
            permissions: ROLE_PERMISSIONS[membership?.role] || {}
          };
        });

      const { passwordHash: _, ...safeUser } = user;
      return json({ user: safeUser, workspaces, token });
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      const { token } = authenticate();
      if (token) {
        revokeSessionToken(token);
      }
      return json({ success: true });
    }

    // -------------------------------------------------------------
    // WORKSPACE ROUTES
    // -------------------------------------------------------------
    if (pathname === '/api/workspaces' && method === 'GET') {
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const memberships = db.workspace_members.filter(m => m.userId === user.id);
      const workspaceIds = memberships.map(m => m.workspaceId);
      const workspaces = db.workspaces
        .filter(w => workspaceIds.includes(w.id))
        .map(w => {
          const m = memberships.find(mem => mem.workspaceId === w.id);
          return {
            ...w,
            userRole: m?.role,
            permissions: ROLE_PERMISSIONS[m?.role] || {}
          };
        });

      return json({ workspaces });
    }

    if (pathname === '/api/workspaces' && method === 'POST') {
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const body = await readBody();
      const workspaceId = `wed-${crypto.randomBytes(6).toString('hex')}`;
      const now = new Date().toISOString();

      const newWorkspace = {
        id: workspaceId,
        title: body.title || `${user.name}'s Wedding`,
        ownerId: user.id,
        bride: body.bride || '',
        groom: body.groom || '',
        date: body.date || '2026-12-25',
        location: body.location || 'Dar es Salaam',
        guests: parseInt(body.guests) || 100,
        budget: parseInt(body.budget) || 10000000,
        currency: 'TZS',
        createdAt: now,
        updatedAt: now
      };

      db.workspaces.push(newWorkspace);
      db.workspace_members.push({
        id: `wm-${crypto.randomBytes(6).toString('hex')}`,
        workspaceId,
        userId: user.id,
        role: WORKSPACE_ROLES.OWNER,
        joinedAt: now,
        invitedBy: null
      });

      await saveDatabase();
      return json({
        workspace: {
          ...newWorkspace,
          userRole: WORKSPACE_ROLES.OWNER,
          permissions: ROLE_PERMISSIONS[WORKSPACE_ROLES.OWNER]
        }
      }, 201);
    }

    // Match /api/workspaces/:id
    const workspaceMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)$/);
    if (workspaceMatch) {
      const workspaceId = workspaceMatch[1];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) {
        return err(access.error, access.status);
      }

      if (method === 'GET') {
        const membersCount = db.workspace_members.filter(m => m.workspaceId === workspaceId).length;
        return json({
          workspace: {
            ...access.workspace,
            userRole: access.membership.role,
            permissions: ROLE_PERMISSIONS[access.membership.role] || {},
            membersCount
          }
        });
      }

      if (method === 'PATCH') {
        if (!ROLE_PERMISSIONS[access.membership.role]?.canEditWorkspace) {
          return err('Forbidden: You do not have permission to edit workspace settings', 403);
        }

        const body = await readBody();
        const allowedFields = ['title', 'bride', 'groom', 'date', 'location', 'guests', 'budget', 'currency'];
        for (const field of allowedFields) {
          if (body[field] !== undefined) {
            access.workspace[field] = (field === 'guests' || field === 'budget')
              ? (parseInt(body[field]) || 0)
              : body[field];
          }
        }
        access.workspace.updatedAt = new Date().toISOString();
        await saveDatabase();

        return json({
          workspace: {
            ...access.workspace,
            userRole: access.membership.role,
            permissions: ROLE_PERMISSIONS[access.membership.role]
          }
        });
      }
    }

    // Match /api/workspaces/:id/members
    const membersMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/members$/);
    if (membersMatch) {
      const workspaceId = membersMatch[1];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      if (method === 'GET') {
        const rawMembers = db.workspace_members.filter(m => m.workspaceId === workspaceId);
        const members = rawMembers.map(m => {
          const u = db.users.find(usr => usr.id === m.userId);
          return {
            id: m.id,
            userId: m.userId,
            name: u?.name || 'Unknown',
            email: u?.email || '',
            phone: u?.phone || '',
            role: m.role,
            joinedAt: m.joinedAt,
            isOwner: m.role === WORKSPACE_ROLES.OWNER
          };
        });

        return json({ members });
      }
    }

    // Match /api/workspaces/:id/members/:memberId
    const singleMemberMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/members\/([a-zA-Z0-9_-]+)$/);
    if (singleMemberMatch) {
      const workspaceId = singleMemberMatch[1];
      const targetMemberId = singleMemberMatch[2];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      const targetMembership = db.workspace_members.find(
        m => m.workspaceId === workspaceId && (m.id === targetMemberId || m.userId === targetMemberId)
      );

      if (!targetMembership) {
        return err('Member not found in workspace', 404);
      }

      // Change role
      if (method === 'PATCH') {
        if (!ROLE_PERMISSIONS[access.membership.role]?.canChangeRoles) {
          return err('Forbidden: Only the workspace owner can change member roles', 403);
        }

        const body = await readBody();
        const { newRole } = body;
        const validRoles = Object.values(WORKSPACE_ROLES);
        if (!validRoles.includes(newRole)) {
          return err(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
        }

        // Prevent demoting the primary owner unless ownership transfer
        if (targetMembership.role === WORKSPACE_ROLES.OWNER && newRole !== WORKSPACE_ROLES.OWNER) {
          return err('Cannot demote the primary owner directly. Transfer ownership first.', 400);
        }

        targetMembership.role = newRole;
        await saveDatabase();
        return json({ success: true, member: targetMembership });
      }

      // Remove member
      if (method === 'DELETE') {
        if (!ROLE_PERMISSIONS[access.membership.role]?.canRemoveMembers) {
          return err('Forbidden: Only the workspace owner can remove members', 403);
        }

        if (targetMembership.role === WORKSPACE_ROLES.OWNER) {
          return err('Cannot remove the workspace owner', 400);
        }

        db.workspace_members = db.workspace_members.filter(m => m.id !== targetMembership.id);
        await saveDatabase();
        return json({ success: true, removedUserId: targetMembership.userId });
      }
    }

    // -------------------------------------------------------------
    // INVITATION ROUTES
    // -------------------------------------------------------------
    // POST /api/workspaces/:id/invitations - Create expiring invitation
    const createInviteMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/invitations$/);
    if (createInviteMatch) {
      const workspaceId = createInviteMatch[1];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      if (method === 'GET') {
        // List pending invitations for this workspace
        const invites = db.invitations.filter(i => i.workspaceId === workspaceId);
        return json({ invitations: invites });
      }

      if (method === 'POST') {
        if (!ROLE_PERMISSIONS[access.membership.role]?.canInviteMembers) {
          return err('Forbidden: Your role does not have permission to invite members', 403);
        }

        const body = await readBody();
        const { email, role = WORKSPACE_ROLES.FRIEND, expiresInHours = 48 } = body;

        const validRoles = Object.values(WORKSPACE_ROLES).filter(r => r !== WORKSPACE_ROLES.OWNER);
        if (!validRoles.includes(role)) {
          return err(`Invalid role for invitation. Allowed: ${validRoles.join(', ')}`, 400);
        }

        const token = crypto.randomBytes(20).toString('hex');
        const inviteId = `inv-${crypto.randomBytes(6).toString('hex')}`;
        const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

        const newInvite = {
          id: inviteId,
          workspaceId,
          token,
          email: email ? email.toLowerCase() : null,
          role,
          inviterId: user.id,
          inviterName: user.name,
          status: 'pending',
          expiresAt,
          createdAt: new Date().toISOString()
        };

        db.invitations.push(newInvite);
        await saveDatabase();

        return json({
          invitation: {
            ...newInvite,
            inviteUrl: `/invite/${token}`
          }
        }, 201);
      }
    }

    // DELETE /api/workspaces/:id/invitations/:inviteId - Revoke invitation
    const revokeInviteMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/invitations\/([a-zA-Z0-9_-]+)$/);
    if (revokeInviteMatch && method === 'DELETE') {
      const workspaceId = revokeInviteMatch[1];
      const inviteId = revokeInviteMatch[2];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      if (!ROLE_PERMISSIONS[access.membership.role]?.canInviteMembers) {
        return err('Forbidden: You cannot revoke invitations', 403);
      }

      const invite = db.invitations.find(i => i.workspaceId === workspaceId && i.id === inviteId);
      if (!invite) {
        return err('Invitation not found', 404);
      }

      invite.status = 'revoked';
      await saveDatabase();
      return json({ success: true, message: 'Invitation revoked' });
    }

    // GET /api/invitations/:token - Public check of invitation details
    const getInviteTokenMatch = pathname.match(/^\/api\/invitations\/([a-zA-Z0-9_-]+)$/);
    if (getInviteTokenMatch && method === 'GET') {
      const token = getInviteTokenMatch[1];
      const invite = db.invitations.find(i => i.token === token);
      if (!invite) {
        return err('Invitation not found', 404);
      }

      const isExpired = new Date(invite.expiresAt) < new Date();
      if (isExpired && invite.status === 'pending') {
        invite.status = 'expired';
        saveDatabase();
      }

      const workspace = db.workspaces.find(w => w.id === invite.workspaceId);
      const inviter = db.users.find(u => u.id === invite.inviterId);

      return json({
        invitation: {
          token: invite.token,
          role: invite.role,
          email: invite.email,
          status: isExpired ? 'expired' : invite.status,
          expiresAt: invite.expiresAt,
          weddingTitle: workspace?.title || 'Wedding Workspace',
          inviterName: inviter?.name || invite.inviterName || 'A couple member'
        }
      });
    }

    // POST /api/invitations/:token/accept - Accept invitation
    const acceptInviteMatch = pathname.match(/^\/api\/invitations\/([a-zA-Z0-9_-]+)\/accept$/);
    if (acceptInviteMatch && method === 'POST') {
      const token = acceptInviteMatch[1];
      const { user } = authenticate();
      if (!user) return err('Unauthorized: Please log in to accept the invitation', 401);

      const invite = db.invitations.find(i => i.token === token);
      if (!invite) {
        return err('Invitation not found', 404);
      }

      if (invite.status === 'revoked') {
        return err('This invitation has been revoked by the workspace owner', 410);
      }

      if (new Date(invite.expiresAt) < new Date() || invite.status === 'expired') {
        invite.status = 'expired';
        await saveDatabase();
        return err('This invitation link has expired', 410);
      }

      if (invite.status === 'accepted') {
        return err('This invitation has already been accepted', 400);
      }

      // Check if user is already a member of this workspace
      const existingMember = db.workspace_members.find(
        m => m.workspaceId === invite.workspaceId && m.userId === user.id
      );

      if (existingMember) {
        return json({
          message: 'You are already a member of this workspace',
          workspaceId: invite.workspaceId,
          role: existingMember.role
        });
      }

      // Add user to workspace members
      const newMembership = {
        id: `wm-${crypto.randomBytes(6).toString('hex')}`,
        workspaceId: invite.workspaceId,
        userId: user.id,
        role: invite.role,
        joinedAt: new Date().toISOString(),
        invitedBy: invite.inviterId
      };

      db.workspace_members.push(newMembership);
      invite.status = 'accepted';
      invite.acceptedBy = user.id;
      invite.acceptedAt = new Date().toISOString();

      await saveDatabase();

      return json({
        success: true,
        message: `Successfully joined workspace as ${invite.role}`,
        workspaceId: invite.workspaceId,
        role: invite.role
      });
    }

    // -------------------------------------------------------------
    // PHASE 2: TASKS / CHECKLIST ROUTES
    // -------------------------------------------------------------
    const getTodayDateStr = () => {
      // In Africa/Dar_es_Salaam timezone
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Dar_es_Salaam' }).format(new Date());
    };

    const evaluateTaskStatus = (task, weddingDate) => {
      if (task.status === 'completed') return 'completed';
      const today = getTodayDateStr();
      if (weddingDate && weddingDate < today) {
        return 'missed';
      }
      if (task.dueDate && task.dueDate < today) {
        return 'overdue';
      }
      return 'pending';
    };

    // Helper to send notification
    const createNotification = async (workspaceId, userId, { type, title, message, entityId, entityType }) => {
      if (!userId) return;
      const notif = {
        id: `notif-${crypto.randomBytes(6).toString('hex')}`,
        workspaceId,
        userId,
        type,
        title,
        message,
        read: false,
        createdAt: new Date().toISOString(),
        entityId: entityId || null,
        entityType: entityType || null
      };
      db.notifications.push(notif);
      await saveDatabase();
      return notif;
    };

    // GET /api/workspaces/:id/tasks
    const tasksMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/tasks$/);
    if (tasksMatch) {
      const workspaceId = tasksMatch[1];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      if (method === 'GET') {
        const rawTasks = db.tasks.filter(t => t.workspaceId === workspaceId);
        const weddingDate = access.workspace.date;
        const tasks = rawTasks.map(t => {
          const currentStatus = evaluateTaskStatus(t, weddingDate);
          return {
            ...t,
            status: currentStatus,
            commentsCount: (t.comments || []).length
          };
        });

        return json({ tasks });
      }

      if (method === 'POST') {
        if (!ROLE_PERMISSIONS[access.membership.role]?.canManageTasks) {
          return err('Forbidden: You do not have permission to create tasks', 403);
        }

        const body = await readBody();
        const { title, description, assigneeId, dueDate, priority = 'medium' } = body;
        if (!title) return err('Task title is required', 400);

        let assigneeName = 'Unassigned';
        if (assigneeId) {
          const assigneeUser = db.users.find(u => u.id === assigneeId);
          if (assigneeUser) assigneeName = assigneeUser.name;
        }

        const taskId = `task-${crypto.randomBytes(6).toString('hex')}`;
        const now = new Date().toISOString();
        const initialStatus = evaluateTaskStatus({ dueDate, status: 'pending' }, access.workspace.date);
        const newTask = {
          id: taskId,
          workspaceId,
          title,
          description: description || '',
          assigneeId: assigneeId || null,
          assigneeName,
          dueDate: dueDate || null,
          priority: ['high', 'medium', 'low'].includes(priority) ? priority : 'medium',
          status: initialStatus,
          comments: [],
          activityHistory: [
            {
              id: `act-${crypto.randomBytes(4).toString('hex')}`,
              action: 'created',
              userId: user.id,
              userName: user.name,
              timestamp: now,
              details: `Task created by ${user.name}`
            }
          ],
          createdAt: now,
          updatedAt: now,
          completedAt: null,
          version: 1
        };

        db.tasks.push(newTask);
        await saveDatabase();

        // Notify assignee if assigned to someone else
        if (assigneeId && assigneeId !== user.id) {
          await createNotification(workspaceId, assigneeId, {
            type: 'task_assigned',
            title: 'New Task Assigned',
            message: `${user.name} assigned you to "${title}"`,
            entityId: taskId,
            entityType: 'task'
          });
        }

        return json({ task: newTask }, 201);
      }
    }

    // PATCH / PUT / DELETE /api/workspaces/:id/tasks/:taskId
    const singleTaskMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/tasks\/([a-zA-Z0-9_-]+)$/);
    if (singleTaskMatch) {
      const workspaceId = singleTaskMatch[1];
      const taskId = singleTaskMatch[2];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      const task = db.tasks.find(t => t.workspaceId === workspaceId && t.id === taskId);
      if (!task) return err('Task not found', 404);

      if (method === 'PATCH' || method === 'PUT') {
        const body = await readBody();
        const permissions = ROLE_PERMISSIONS[access.membership.role] || {};

        // Status update check
        if (body.status !== undefined) {
          const isAssignee = task.assigneeId === user.id;
          const canManage = permissions.canManageTasks;

          if (!canManage && !isAssignee) {
            return err('Forbidden: You can only complete tasks assigned to you', 403);
          }

          const oldStatus = task.status;
          task.status = body.status;
          task.updatedAt = new Date().toISOString();
          task.version = (task.version || 1) + 1;

          task.activityHistory.push({
            id: `act-${crypto.randomBytes(4).toString('hex')}`,
            action: 'status_changed',
            userId: user.id,
            userName: user.name,
            timestamp: new Date().toISOString(),
            details: `Status changed from ${oldStatus} to ${body.status}`
          });

          if (body.status === 'completed') {
            task.completedAt = new Date().toISOString();
            task.activityHistory.push({
              id: `act-${crypto.randomBytes(4).toString('hex')}`,
              action: 'completed',
              userId: user.id,
              userName: user.name,
              timestamp: new Date().toISOString(),
              details: `Marked completed by ${user.name}`
            });

            // Notify workspace owner/partner if someone else completed it
            if (access.workspace.ownerId !== user.id) {
              await createNotification(workspaceId, access.workspace.ownerId, {
                type: 'task_completed',
                title: 'Task Completed',
                message: `${user.name} completed "${task.title}"`,
                entityId: taskId,
                entityType: 'task'
              });
            }
          } else {
            task.completedAt = null;
          }
        }

        // Field updates (title, description, assigneeId, dueDate, priority)
        const editableFields = ['title', 'description', 'assigneeId', 'dueDate', 'priority'];
        let hasFieldEdit = false;

        for (const field of editableFields) {
          if (body[field] !== undefined) {
            if (!permissions.canManageTasks) {
              return err('Forbidden: Only authorized members can edit task details', 403);
            }
            if (field === 'assigneeId' && body[field] !== task.assigneeId) {
              const oldAssignee = task.assigneeName;
              task.assigneeId = body[field];
              const newAssigneeUser = db.users.find(u => u.id === body[field]);
              task.assigneeName = newAssigneeUser ? newAssigneeUser.name : 'Unassigned';
              task.activityHistory.push({
                id: `act-${crypto.randomBytes(4).toString('hex')}`,
                action: 'reassigned',
                userId: user.id,
                userName: user.name,
                timestamp: new Date().toISOString(),
                details: `Reassigned from ${oldAssignee} to ${task.assigneeName}`
              });

              if (body[field] && body[field] !== user.id) {
                await createNotification(workspaceId, body[field], {
                  type: 'task_assigned',
                  title: 'Task Assigned',
                  message: `${user.name} assigned you to "${task.title}"`,
                  entityId: taskId,
                  entityType: 'task'
                });
              }
            } else {
              task[field] = body[field];
            }
            hasFieldEdit = true;
          }
        }

        if (hasFieldEdit) {
          task.updatedAt = new Date().toISOString();
          task.version = (task.version || 1) + 1;
        }

        await saveDatabase();
        return json({ task });
      }

      if (method === 'DELETE') {
        if (!ROLE_PERMISSIONS[access.membership.role]?.canManageTasks) {
          return err('Forbidden: You cannot delete tasks', 403);
        }
        db.tasks = db.tasks.filter(t => t.id !== taskId);
        await saveDatabase();
        return json({ success: true, removedTaskId: taskId });
      }
    }

    // POST /api/workspaces/:id/tasks/:taskId/comments
    const taskCommentMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/tasks\/([a-zA-Z0-9_-]+)\/comments$/);
    if (taskCommentMatch && method === 'POST') {
      const workspaceId = taskCommentMatch[1];
      const taskId = taskCommentMatch[2];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      if (!ROLE_PERMISSIONS[access.membership.role]?.canCommentTasks) {
        return err('Forbidden: You cannot leave comments', 403);
      }

      const task = db.tasks.find(t => t.workspaceId === workspaceId && t.id === taskId);
      if (!task) return err('Task not found', 404);

      const body = await readBody();
      if (!body.text || !body.text.trim()) {
        return err('Comment text is required', 400);
      }

      const comment = {
        id: `c-${crypto.randomBytes(4).toString('hex')}`,
        userId: user.id,
        userName: user.name,
        text: body.text.trim(),
        createdAt: new Date().toISOString()
      };

      if (!task.comments) task.comments = [];
      task.comments.push(comment);

      task.activityHistory.push({
        id: `act-${crypto.randomBytes(4).toString('hex')}`,
        action: 'comment_added',
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString(),
        details: `${user.name} commented on task`
      });

      task.updatedAt = new Date().toISOString();
      await saveDatabase();

      return json({ success: true, comment, task }, 201);
    }

    // -------------------------------------------------------------
    // PHASE 2: DECISIONS & NOTES ROUTES
    // -------------------------------------------------------------
    // GET / POST /api/workspaces/:id/decisions
    const decisionsMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/decisions$/);
    if (decisionsMatch) {
      const workspaceId = decisionsMatch[1];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      if (method === 'GET') {
        const decisions = db.decisions.filter(d => d.workspaceId === workspaceId);
        return json({ decisions });
      }

      if (method === 'POST') {
        if (!ROLE_PERMISSIONS[access.membership.role]?.canManageDecisions) {
          return err('Forbidden: You cannot create decisions', 403);
        }

        const body = await readBody();
        const { title, description, category = 'general', options = [] } = body;
        if (!title) return err('Title is required', 400);

        const decisionId = `dec-${crypto.randomBytes(6).toString('hex')}`;
        const formattedOptions = (options.length ? options : ['Option A', 'Option B']).map((opt, idx) => ({
          id: `opt-${idx + 1}-${crypto.randomBytes(3).toString('hex')}`,
          text: typeof opt === 'string' ? opt : opt.text,
          votes: []
        }));

        const newDecision = {
          id: decisionId,
          workspaceId,
          title,
          description: description || '',
          category,
          status: 'open',
          options: formattedOptions,
          decisionNotes: '',
          decidedBy: null,
          decidedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        db.decisions.push(newDecision);
        await saveDatabase();

        return json({ decision: newDecision }, 201);
      }
    }

    // POST /api/workspaces/:id/decisions/:decisionId/vote
    const voteMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/decisions\/([a-zA-Z0-9_-]+)\/vote$/);
    if (voteMatch && method === 'POST') {
      const workspaceId = voteMatch[1];
      const decisionId = voteMatch[2];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      if (!ROLE_PERMISSIONS[access.membership.role]?.canVoteDecisions) {
        return err('Forbidden: Your role cannot vote on decisions', 403);
      }

      const decision = db.decisions.find(d => d.workspaceId === workspaceId && d.id === decisionId);
      if (!decision) return err('Decision not found', 404);

      if (decision.status !== 'open') {
        return err('Voting is closed for this decision', 400);
      }

      const body = await readBody();
      const { optionId } = body;
      const targetOption = decision.options.find(o => o.id === optionId);
      if (!targetOption) return err('Option not found in decision', 404);

      // Toggle or single vote: remove previous vote in this decision and add to target
      decision.options.forEach(opt => {
        opt.votes = (opt.votes || []).filter(v => v !== user.id);
      });
      targetOption.votes.push(user.id);
      decision.updatedAt = new Date().toISOString();
      await saveDatabase();

      return json({ success: true, decision });
    }

    // PATCH / PUT /api/workspaces/:id/decisions/:decisionId
    const patchDecisionMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/decisions\/([a-zA-Z0-9_-]+)$/);
    if (patchDecisionMatch && (method === 'PATCH' || method === 'PUT')) {
      const workspaceId = patchDecisionMatch[1];
      const decisionId = patchDecisionMatch[2];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      if (!ROLE_PERMISSIONS[access.membership.role]?.canManageDecisions) {
        return err('Forbidden: You cannot finalize decisions', 403);
      }

      const decision = db.decisions.find(d => d.workspaceId === workspaceId && d.id === decisionId);
      if (!decision) return err('Decision not found', 404);

      const body = await readBody();
      if (body.status !== undefined) decision.status = body.status;
      if (body.decisionNotes !== undefined) decision.decisionNotes = body.decisionNotes;
      if (body.status === 'agreed' || body.status === 'rejected') {
        decision.decidedBy = user.name;
        decision.decidedAt = new Date().toISOString();
      }
      decision.updatedAt = new Date().toISOString();
      await saveDatabase();

      return json({ decision });
    }

    // GET / POST /api/workspaces/:id/notes
    const notesMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/notes$/);
    if (notesMatch) {
      const workspaceId = notesMatch[1];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      if (method === 'GET') {
        const notes = db.notes.filter(n => n.workspaceId === workspaceId);
        return json({ notes });
      }

      if (method === 'POST') {
        const body = await readBody();
        const { title, content, category = 'general', pinned = false } = body;
        if (!title || !content) return err('Title and content are required', 400);

        const newNote = {
          id: `note-${crypto.randomBytes(6).toString('hex')}`,
          workspaceId,
          title,
          content,
          category,
          pinned: !!pinned,
          authorId: user.id,
          authorName: user.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        db.notes.push(newNote);
        await saveDatabase();

        return json({ note: newNote }, 201);
      }
    }

    // -------------------------------------------------------------
    // PHASE 2: BUDGET CATEGORIES & EXPENSES
    // -------------------------------------------------------------
    // GET /api/workspaces/:id/budget - Aggregated budget calculation
    const budgetMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/budget$/);
    if (budgetMatch && method === 'GET') {
      const workspaceId = budgetMatch[1];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      if (!ROLE_PERMISSIONS[access.membership.role]?.canViewFinancials) {
        return err('Forbidden: You do not have access to view budget financials', 403);
      }

      const categories = db.budget_categories.filter(c => c.workspaceId === workspaceId);
      const expenses = db.expenses.filter(e => e.workspaceId === workspaceId);

      const totalBudget = access.workspace.budget || 0;
      const totalAllocated = categories.reduce((sum, c) => sum + (c.allocatedAmount || 0), 0);
      const totalEstimated = expenses.reduce((sum, e) => sum + (e.estimatedAmount || 0), 0);
      const totalActual = expenses.reduce((sum, e) => sum + (e.actualAmount || e.estimatedAmount || 0), 0);
      const totalPaid = expenses.reduce((sum, e) => sum + (e.paidAmount || 0), 0);
      const remainingBudget = totalBudget - totalActual;
      const unallocatedBudget = totalBudget - totalAllocated;

      // Category breakdown
      const categoryBreakdown = categories.map(cat => {
        const catExpenses = expenses.filter(e => e.categoryId === cat.id);
        const catEstimated = catExpenses.reduce((sum, e) => sum + (e.estimatedAmount || 0), 0);
        const catActual = catExpenses.reduce((sum, e) => sum + (e.actualAmount || e.estimatedAmount || 0), 0);
        const catPaid = catExpenses.reduce((sum, e) => sum + (e.paidAmount || 0), 0);
        const variance = (cat.allocatedAmount || 0) - catActual;
        const isOverBudget = catActual > (cat.allocatedAmount || 0);

        return {
          ...cat,
          estimated: catEstimated,
          actual: catActual,
          paid: catPaid,
          variance,
          isOverBudget,
          expenseCount: catExpenses.length
        };
      });

      return json({
        summary: {
          totalBudget,
          totalAllocated,
          totalEstimated,
          totalActual,
          totalPaid,
          remainingBudget,
          unallocatedBudget,
          allocatedPct: Math.round((totalAllocated / (totalBudget || 1)) * 100),
          usedPct: Math.round((totalActual / (totalBudget || 1)) * 100),
        },
        categories: categoryBreakdown,
        expenses
      });
    }

    // POST /api/workspaces/:id/budget/categories
    const createCatMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/budget\/categories$/);
    if (createCatMatch && method === 'POST') {
      const workspaceId = createCatMatch[1];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      if (!ROLE_PERMISSIONS[access.membership.role]?.canManageBudget) {
        return err('Forbidden: You cannot modify budget categories', 403);
      }

      const body = await readBody();
      const { name, icon = '💰', allocatedAmount = 0 } = body;
      if (!name) return err('Category name is required', 400);

      const newCat = {
        id: `bcat-${crypto.randomBytes(6).toString('hex')}`,
        workspaceId,
        name,
        icon,
        allocatedAmount: parseInt(allocatedAmount) || 0,
        order: db.budget_categories.filter(c => c.workspaceId === workspaceId).length + 1
      };

      db.budget_categories.push(newCat);
      await saveDatabase();

      return json({ category: newCat }, 201);
    }

    // POST /api/workspaces/:id/budget/expenses
    const createExpMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/budget\/expenses$/);
    if (createExpMatch && method === 'POST') {
      const workspaceId = createExpMatch[1];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      if (!ROLE_PERMISSIONS[access.membership.role]?.canRecordExpenses) {
        return err('Forbidden: You cannot record expenses', 403);
      }

      const body = await readBody();
      const { categoryId, title, estimatedAmount = 0, actualAmount = 0, paidAmount = 0, status = 'planned', vendorId } = body;
      if (!title) return err('Expense title is required', 400);

      const newExpense = {
        id: `exp-${crypto.randomBytes(6).toString('hex')}`,
        workspaceId,
        categoryId: categoryId || 'bcat-other',
        title,
        estimatedAmount: parseInt(estimatedAmount) || 0,
        actualAmount: parseInt(actualAmount) || parseInt(estimatedAmount) || 0,
        paidAmount: parseInt(paidAmount) || 0,
        status: ['planned', 'deposit_paid', 'paid_in_full'].includes(status) ? status : 'planned',
        vendorId: vendorId || null,
        addedBy: user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.expenses.push(newExpense);

      // Check if category allocation is exceeded -> alert owner
      const category = db.budget_categories.find(c => c.id === categoryId);
      if (category) {
        const catTotal = db.expenses
          .filter(e => e.categoryId === categoryId)
          .reduce((sum, e) => sum + (e.actualAmount || 0), 0);

        if (catTotal > category.allocatedAmount) {
          await createNotification(workspaceId, access.workspace.ownerId, {
            type: 'budget_alert',
            title: 'Budget Alert: Allocation Exceeded',
            message: `Category "${category.name}" is over budget by TSh ${(catTotal - category.allocatedAmount).toLocaleString()}`,
            entityId: categoryId,
            entityType: 'budget_category'
          });
        }
      }

      await saveDatabase();
      return json({ expense: newExpense }, 201);
    }

    // PATCH / DELETE /api/workspaces/:id/budget/expenses/:expId
    const singleExpMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/budget\/expenses\/([a-zA-Z0-9_-]+)$/);
    if (singleExpMatch) {
      const workspaceId = singleExpMatch[1];
      const expId = singleExpMatch[2];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      const expense = db.expenses.find(e => e.workspaceId === workspaceId && e.id === expId);
      if (!expense) return err('Expense not found', 404);

      if (method === 'PATCH') {
        if (!ROLE_PERMISSIONS[access.membership.role]?.canRecordExpenses) {
          return err('Forbidden: You cannot modify expenses', 403);
        }

        const body = await readBody();
        const fields = ['title', 'categoryId', 'estimatedAmount', 'actualAmount', 'paidAmount', 'status', 'vendorId'];
        for (const f of fields) {
          if (body[f] !== undefined) {
            expense[f] = (f === 'estimatedAmount' || f === 'actualAmount' || f === 'paidAmount')
              ? (parseInt(body[f]) || 0)
              : body[f];
          }
        }
        expense.updatedAt = new Date().toISOString();
        await saveDatabase();

        return json({ expense });
      }

      if (method === 'DELETE') {
        if (!ROLE_PERMISSIONS[access.membership.role]?.canRecordExpenses) {
          return err('Forbidden: You cannot delete expenses', 403);
        }
        db.expenses = db.expenses.filter(e => e.id !== expId);
        await saveDatabase();
        return json({ success: true, removedExpenseId: expId });
      }
    }

    // -------------------------------------------------------------
    // PHASE 2: NOTIFICATIONS ROUTES
    // -------------------------------------------------------------
    // GET /api/workspaces/:id/notifications
    const notifsMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/notifications$/);
    if (notifsMatch && method === 'GET') {
      const workspaceId = notifsMatch[1];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      // Return notifications designated for this user
      const userNotifs = db.notifications
        .filter(n => n.workspaceId === workspaceId && n.userId === user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const unreadCount = userNotifs.filter(n => !n.read).length;
      return json({ notifications: userNotifs, unreadCount });
    }

    // PATCH / PUT /api/workspaces/:id/notifications/:notifId/read
    const markReadMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/notifications\/([a-zA-Z0-9_-]+)\/read$/);
    if (markReadMatch && (method === 'PATCH' || method === 'PUT')) {
      const workspaceId = markReadMatch[1];
      const notifId = markReadMatch[2];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const notif = db.notifications.find(n => n.workspaceId === workspaceId && n.id === notifId && n.userId === user.id);
      if (!notif) return err('Notification not found', 404);

      notif.read = true;
      await saveDatabase();
      return json({ success: true, notification: notif });
    }

    // POST / PUT /api/workspaces/:id/notifications/mark-all-read
    const markAllReadMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/notifications\/mark-all-read$/);
    if (markAllReadMatch && (method === 'POST' || method === 'PUT')) {
      const workspaceId = markAllReadMatch[1];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      db.notifications
        .filter(n => n.workspaceId === workspaceId && n.userId === user.id)
        .forEach(n => { n.read = true; });

      await saveDatabase();
      return json({ success: true, message: 'All notifications marked as read' });
    }

    // POST /api/workspaces/:id/notifications (Creates notification with business-hour delivery rules)
    const createNotifMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)\/notifications$/);
    if (createNotifMatch && method === 'POST') {
      const workspaceId = createNotifMatch[1];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const access = checkWorkspaceAccess(workspaceId, user.id);
      if (!access.authorized) return err(access.error, access.status);

      const body = await readBody();
      const { userId, type = 'general_update', title, message, entityId, entityType } = body;

      if (!userId || !title || !message) {
        return err('userId, title, and message are required', 400);
      }

      // Check delivery rules against business hours (Rule 4)
      const delivery = canDeliverNotification(type, new Date(), DEFAULT_OPERATING_SCHEDULE);

      const newNotif = {
        id: `notif-${crypto.randomBytes(6).toString('hex')}`,
        workspaceId,
        userId,
        type,
        title,
        message,
        read: false,
        createdAt: new Date().toISOString(),
        entityId: entityId || null,
        entityType: entityType || null,
        status: delivery.canDeliver ? 'delivered' : 'queued',
        deliveredAt: delivery.canDeliver ? new Date().toISOString() : null,
        scheduledFor: delivery.scheduledFor || null,
        deliveryReason: delivery.reason
      };

      db.notifications.push(newNotif);
      await saveDatabase();

      return json({ notification: newNotif, delivery }, 201);
    }

    // -------------------------------------------------------------
    // BUSINESS SCHEDULE & TIMEZONE ROUTES (Africa/Dar_es_Salaam)
    // -------------------------------------------------------------
    // GET /api/business-schedule
    if (pathname === '/api/business-schedule' && method === 'GET') {
      const status = getCurrentOfficeStatus();
      return json({
        schedule: DEFAULT_OPERATING_SCHEDULE,
        status
      });
    }

    // GET /api/system/time
    if (pathname === '/api/system/time' && method === 'GET') {
      const now = new Date();
      const parts = getDarEsSalaamParts(now);
      const status = getCurrentOfficeStatus(now);
      return json({
        timezone: PLATFORM_TIMEZONE,
        currentIso: now.toISOString(),
        darEsSalaam: {
          ...parts,
          formatted: formatDarEsSalaamDateTime(now.toISOString()),
          isOfficeOpen: status.isOpen,
          reason: status.reason,
          nextOpeningIso: status.nextOpeningIso
        }
      });
    }

    // GET & PUT /api/vendors/:id/schedule
    const vendorSchedMatch = pathname.match(/^\/api\/vendors\/([a-zA-Z0-9_-]+)\/schedule$/);
    if (vendorSchedMatch) {
      const vendorId = vendorSchedMatch[1];

      if (method === 'GET') {
        const customSched = db.vendor_schedules?.find(s => s.vendorId === vendorId);
        const effective = getEffectiveVendorSchedule(customSched ? { schedule: customSched } : null);
        const status = getCurrentOfficeStatus(new Date(), effective);

        return json({
          vendorId,
          schedule: effective,
          status
        });
      }

      if (method === 'PUT') {
        const { user } = authenticate();
        if (!user) return err('Unauthorized', 401);

        // Allow provider themselves or admin
        if (user.globalRole !== 'admin' && user.id !== vendorId) {
          return err('Forbidden: You can only configure your own vendor schedule', 403);
        }

        const body = await readBody();
        if (!db.vendor_schedules) db.vendor_schedules = [];

        let existingIndex = db.vendor_schedules.findIndex(s => s.vendorId === vendorId);

        const updatedSchedule = {
          vendorId,
          useDefault: Boolean(body.useDefault),
          timezone: body.timezone || PLATFORM_TIMEZONE,
          weeklyHours: body.weeklyHours || DEFAULT_OPERATING_SCHEDULE.weeklyHours,
          daysOff: body.daysOff !== undefined ? body.daysOff : DEFAULT_OPERATING_SCHEDULE.daysOff,
          holidays: body.holidays !== undefined ? body.holidays : DEFAULT_OPERATING_SCHEDULE.holidays,
          specialHours: body.specialHours || [],
          notificationHours: body.notificationHours || DEFAULT_OPERATING_SCHEDULE.notificationHours,
          updatedAt: new Date().toISOString()
        };

        if (existingIndex >= 0) {
          db.vendor_schedules[existingIndex] = updatedSchedule;
        } else {
          db.vendor_schedules.push(updatedSchedule);
        }

        await saveDatabase();
        return json({ success: true, schedule: updatedSchedule });
      }
    }

    // -------------------------------------------------------------
    // APPOINTMENTS & MEETINGS ROUTES
    // -------------------------------------------------------------
    // GET /api/appointments
    if (pathname === '/api/appointments' && method === 'GET') {
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const vendorIdFilter = urlObj.searchParams.get('vendorId');
      const workspaceIdFilter = urlObj.searchParams.get('workspaceId');

      let list = db.appointments || [];

      if (user.globalRole === 'admin') {
        // Admin can inspect all
      } else if (user.globalRole === 'provider') {
        list = list.filter(a => a.vendorId === user.id);
      } else {
        list = list.filter(a => a.customerId === user.id || (workspaceIdFilter && a.workspaceId === workspaceIdFilter));
      }

      if (vendorIdFilter) {
        list = list.filter(a => a.vendorId === vendorIdFilter);
      }
      if (workspaceIdFilter) {
        list = list.filter(a => a.workspaceId === workspaceIdFilter);
      }

      const formatted = list.map(app => ({
        ...app,
        startDarFormatted: formatDarEsSalaamDateTime(app.startIso),
        endDarFormatted: formatDarEsSalaamDateTime(app.endIso)
      }));

      return json({ appointments: formatted });
    }

    // POST /api/appointments (Server validation of business hours & availability)
    if (pathname === '/api/appointments' && method === 'POST') {
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const body = await readBody();
      const {
        workspaceId = 'wed-1',
        vendorId,
        title,
        startIso,
        endIso,
        allowException = false,
        exceptionReason = '',
        notes = ''
      } = body;

      if (!vendorId || !title || !startIso || !endIso) {
        return err('vendorId, title, startIso, and endIso are required', 400);
      }

      // Retrieve vendor schedule
      const customSched = db.vendor_schedules?.find(s => s.vendorId === vendorId);
      const vendorSchedule = getEffectiveVendorSchedule(customSched ? { schedule: customSched } : null);

      // Validate appointment slot on server (Rule 3 and Rule 6)
      const validation = validateAppointmentSlot({
        vendorSchedule,
        startIso,
        endIso,
        allowException: Boolean(allowException),
        exceptionReason,
        existingAppointments: db.appointments || []
      });

      if (!validation.valid) {
        return err(validation.error, 422); // 422 Unprocessable Entity
      }

      const appointmentId = `app-${crypto.randomBytes(6).toString('hex')}`;
      const newAppointment = {
        id: appointmentId,
        workspaceId,
        vendorId,
        customerId: user.id,
        customerName: user.name,
        title,
        startIso,
        endIso,
        status: 'confirmed',
        allowException: Boolean(allowException),
        exceptionReason: allowException ? (exceptionReason || 'Explicit exception requested') : null,
        notes,
        darDate: validation.darDate,
        darStartTime: validation.darStartTime,
        darEndTime: validation.darEndTime,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!db.appointments) db.appointments = [];
      db.appointments.push(newAppointment);

      // Create essential appointment confirmation notification
      if (!db.notifications) db.notifications = [];
      db.notifications.push({
        id: `notif-${crypto.randomBytes(6).toString('hex')}`,
        workspaceId,
        userId: user.id,
        type: 'booking_update', // Essential notification
        title: 'Appointment Confirmed',
        message: `Appointment "${title}" scheduled for ${validation.darDate} from ${validation.darStartTime} to ${validation.darEndTime} EAT.`,
        read: false,
        createdAt: new Date().toISOString(),
        entityId: appointmentId,
        entityType: 'appointment',
        status: 'delivered',
        deliveredAt: new Date().toISOString()
      });

      await saveDatabase();

      return json({
        appointment: {
          ...newAppointment,
          startDarFormatted: formatDarEsSalaamDateTime(newAppointment.startIso),
          endDarFormatted: formatDarEsSalaamDateTime(newAppointment.endIso)
        }
      }, 201);
    }

    // PATCH /api/appointments/:id
    const singleAppMatch = pathname.match(/^\/api\/appointments\/([a-zA-Z0-9_-]+)$/);
    if (singleAppMatch && method === 'PATCH') {
      const appId = singleAppMatch[1];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const appointment = (db.appointments || []).find(a => a.id === appId);
      if (!appointment) return err('Appointment not found', 404);

      if (user.globalRole !== 'admin' && appointment.customerId !== user.id && appointment.vendorId !== user.id) {
        return err('Forbidden: You cannot modify this appointment', 403);
      }

      const body = await readBody();
      const newStart = body.startIso || appointment.startIso;
      const newEnd = body.endIso || appointment.endIso;
      const allowException = body.allowException !== undefined ? Boolean(body.allowException) : appointment.allowException;
      const exceptionReason = body.exceptionReason !== undefined ? body.exceptionReason : appointment.exceptionReason;

      // If time changed, re-validate slot
      if (body.startIso || body.endIso) {
        const customSched = db.vendor_schedules?.find(s => s.vendorId === appointment.vendorId);
        const vendorSchedule = getEffectiveVendorSchedule(customSched ? { schedule: customSched } : null);

        const validation = validateAppointmentSlot({
          vendorSchedule,
          startIso: newStart,
          endIso: newEnd,
          allowException,
          exceptionReason,
          existingAppointments: db.appointments || [],
          appointmentIdToExclude: appId
        });

        if (!validation.valid) {
          return err(validation.error, 422);
        }

        appointment.startIso = newStart;
        appointment.endIso = newEnd;
        appointment.darDate = validation.darDate;
        appointment.darStartTime = validation.darStartTime;
        appointment.darEndTime = validation.darEndTime;
      }

      if (body.title !== undefined) appointment.title = body.title;
      if (body.notes !== undefined) appointment.notes = body.notes;
      if (body.status !== undefined) appointment.status = body.status;
      if (body.allowException !== undefined) appointment.allowException = allowException;
      if (body.exceptionReason !== undefined) appointment.exceptionReason = exceptionReason;
      appointment.updatedAt = new Date().toISOString();

      await saveDatabase();

      return json({
        appointment: {
          ...appointment,
          startDarFormatted: formatDarEsSalaamDateTime(appointment.startIso),
          endDarFormatted: formatDarEsSalaamDateTime(appointment.endIso)
        }
      });
    }

    // DELETE /api/appointments/:id
    if (singleAppMatch && method === 'DELETE') {
      const appId = singleAppMatch[1];
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const appointment = (db.appointments || []).find(a => a.id === appId);
      if (!appointment) return err('Appointment not found', 404);

      if (user.globalRole !== 'admin' && appointment.customerId !== user.id && appointment.vendorId !== user.id) {
        return err('Forbidden: You cannot cancel this appointment', 403);
      }

      appointment.status = 'cancelled';
      appointment.updatedAt = new Date().toISOString();
      await saveDatabase();

      return json({ success: true, message: 'Appointment cancelled', appointmentId: appId });
    }

    // -------------------------------------------------------------
    // PASSWORD RECOVERY / RESET ROUTES
    // -------------------------------------------------------------
    if (pathname === '/api/auth/forgot-password' && method === 'POST') {
      const body = await readBody();
      const { email } = body;
      if (!email) {
        return err('Email address is required', 400);
      }

      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      const resetToken = 'rst-' + crypto.randomBytes(16).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

      if (user) {
        if (!db.password_resets) db.password_resets = [];
        db.password_resets.push({
          token: resetToken,
          userId: user.id,
          email: user.email,
          expiresAt,
          used: false,
          createdAt: new Date().toISOString()
        });
        await saveDatabase();
      }

      return json({
        message: 'If the email exists in our records, password reset instructions have been generated.',
        resetToken: user ? resetToken : null
      });
    }

    if (pathname === '/api/auth/reset-password' && method === 'POST') {
      const body = await readBody();
      const { token, newPassword } = body;
      if (!token || !newPassword) {
        return err('Reset token and new password are required', 400);
      }
      if (newPassword.length < 6) {
        return err('Password must be at least 6 characters long', 422);
      }

      const resetRecord = (db.password_resets || []).find(
        r => r.token === token && !r.used && new Date(r.expiresAt) > new Date()
      );
      if (!resetRecord) {
        return err('Invalid or expired password reset token', 400);
      }

      const user = db.users.find(u => u.id === resetRecord.userId);
      if (!user) {
        return err('User associated with reset token not found', 404);
      }

      user.passwordHash = hashPassword(newPassword);
      resetRecord.used = true;

      // Invalidate existing sessions for security
      db.sessions = db.sessions.filter(s => s.userId !== user.id);
      await saveDatabase();

      return json({ success: true, message: 'Password reset successfully. Please log in with your new password.' });
    }

    // -------------------------------------------------------------
    // BOOKING & RESERVATION ESCROW ROUTES
    // -------------------------------------------------------------
    if (pathname === '/api/bookings' && method === 'GET') {
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      let userBookings = db.bookings || [];
      if (user.globalRole === 'admin') {
        // Admin views all platform bookings
      } else if (user.globalRole === 'provider') {
        userBookings = userBookings.filter(b => b.providerId === user.id || b.providerId === 'venue-1');
      } else {
        // Customers/Planners see their bookings
        userBookings = userBookings.filter(b => b.customerId === user.id || b.weddingId === 'wed-1');
      }

      return json({ bookings: userBookings });
    }

    if (pathname === '/api/bookings' && method === 'POST') {
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const body = await readBody();
      const { category, providerId, packageId = 'standard', weddingId = 'wed-1', date, price } = body;

      if (!category || !providerId || !date || !price) {
        return err('Category, providerId, date, and price are required', 400);
      }

      // Past event date rejection (Africa/Dar_es_Salaam)
      const darNow = getDarEsSalaamParts(new Date());
      if (date < darNow.dateStr) {
        return err('Cannot book an event date in the past.', 422);
      }

      // Double-booking conflict rejection
      const conflict = (db.bookings || []).find(
        b => b.providerId === providerId && b.date === date && b.status !== 'cancelled'
      );
      if (conflict) {
        return err('This provider is already booked for the selected date. Please choose another date.', 409);
      }

      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return err('Price must be a positive number', 422);
      }

      // Authoritative server-side deposit calculation (30%) & commission (5%)
      const deposit = Math.round(numPrice * 0.3);
      const commission = Math.round(numPrice * 0.05);
      const bookingId = `bk-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

      const newBooking = {
        id: bookingId,
        customerId: user.id,
        providerId,
        category,
        packageId,
        weddingId,
        date,
        price: numPrice,
        deposit,
        paidAmount: deposit,
        commission,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!db.bookings) db.bookings = [];
      db.bookings.push(newBooking);

      // Auto-record initial deposit payment record
      const paymentId = `pay-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      if (!db.payments) db.payments = [];
      db.payments.push({
        id: paymentId,
        bookingId,
        customerId: user.id,
        amount: deposit,
        gateway: body.gateway || 'mpesa',
        txnRef: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'success',
        createdAt: new Date().toISOString()
      });

      await saveDatabase();
      return json({ booking: newBooking, paymentId }, 201);
    }

    // Match /api/bookings/:id
    const singleBookingMatch = pathname.match(/^\/api\/bookings\/([a-zA-Z0-9_-]+)$/);
    if (singleBookingMatch && method === 'GET') {
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const bookingId = singleBookingMatch[1];
      const booking = (db.bookings || []).find(b => b.id === bookingId);
      if (!booking) return err('Booking not found', 404);

      if (user.globalRole !== 'admin' && booking.customerId !== user.id && booking.providerId !== user.id) {
        return err('Forbidden: You do not have access to this booking', 403);
      }

      const bookingPayments = (db.payments || []).filter(p => p.bookingId === bookingId);
      return json({ booking, payments: bookingPayments });
    }

    if (singleBookingMatch && method === 'PATCH') {
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const bookingId = singleBookingMatch[1];
      const booking = (db.bookings || []).find(b => b.id === bookingId);
      if (!booking) return err('Booking not found', 404);

      if (user.globalRole !== 'admin' && booking.customerId !== user.id && booking.providerId !== user.id) {
        return err('Forbidden: You cannot modify this booking', 403);
      }

      const body = await readBody();
      if (body.status !== undefined) booking.status = body.status;
      booking.updatedAt = new Date().toISOString();
      await saveDatabase();

      return json({ booking });
    }

    // -------------------------------------------------------------
    // PAYMENTS & WEBHOOK CALLBACK ROUTES
    // -------------------------------------------------------------
    if (pathname === '/api/payments' && method === 'GET') {
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const bookingId = urlObj.searchParams.get('bookingId');
      let paymentsList = db.payments || [];
      if (bookingId) {
        paymentsList = paymentsList.filter(p => p.bookingId === bookingId);
      } else if (user.globalRole !== 'admin') {
        paymentsList = paymentsList.filter(p => p.customerId === user.id);
      }

      return json({ payments: paymentsList });
    }

    if (pathname === '/api/payments' && method === 'POST') {
      const { user } = authenticate();
      if (!user) return err('Unauthorized', 401);

      const body = await readBody();
      const { bookingId, amount, gateway = 'mpesa', isFullPayment = false } = body;

      if (!bookingId || !amount) {
        return err('Booking ID and payment amount are required', 400);
      }

      const booking = (db.bookings || []).find(b => b.id === bookingId);
      if (!booking) {
        return err('Booking not found', 404);
      }

      // Duplicate payment protection / Idempotency guard (5-second window)
      const nowMs = Date.now();
      const duplicate = (db.payments || []).find(
        p => p.bookingId === bookingId &&
             p.amount === Number(amount) &&
             (nowMs - new Date(p.createdAt).getTime()) < 5000
      );
      if (duplicate) {
        return err('Duplicate payment rejected to prevent double charge. Please wait before retrying.', 409);
      }

      const paymentId = `pay-${nowMs}-${crypto.randomBytes(4).toString('hex')}`;
      const txnRef = body.txnRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      const numAmount = Number(amount);

      const newPayment = {
        id: paymentId,
        bookingId,
        customerId: user.id,
        amount: numAmount,
        gateway,
        txnRef,
        status: 'success',
        createdAt: new Date().toISOString()
      };

      if (!db.payments) db.payments = [];
      db.payments.push(newPayment);

      booking.paidAmount = (booking.paidAmount || 0) + numAmount;
      if (isFullPayment || booking.paidAmount >= booking.price) {
        booking.status = 'confirmed';
      } else {
        booking.status = 'partial';
      }
      booking.updatedAt = new Date().toISOString();

      await saveDatabase();
      return json({ payment: newPayment, booking }, 201);
    }

    // Simulated Webhook Callback for Tanzanian Mobile Money Gateways (M-Pesa, Tigo Pesa, Airtel Money)
    if (pathname === '/api/payments/webhook' && method === 'POST') {
      const body = await readBody();
      const { bookingId, txnRef, status = 'success', amount } = body;

      if (!bookingId || !txnRef) {
        return err('Webhook requires bookingId and txnRef', 400);
      }

      const booking = (db.bookings || []).find(b => b.id === bookingId);
      if (!booking) {
        return err('Booking not found for webhook callback', 404);
      }

      if (!db.payments) db.payments = [];
      const existingPay = db.payments.find(p => p.txnRef === txnRef);
      if (!existingPay) {
        db.payments.push({
          id: `pay-hook-${Date.now()}`,
          bookingId,
          customerId: booking.customerId,
          amount: Number(amount) || booking.deposit,
          gateway: body.gateway || 'mobile_money_webhook',
          txnRef,
          status,
          createdAt: new Date().toISOString()
        });
      }

      if (status === 'success') {
        booking.paidAmount = Math.max(booking.paidAmount || 0, Number(amount) || booking.deposit);
        booking.status = 'confirmed';
      } else if (status === 'failed') {
        booking.status = 'pending_deposit';
      }
      booking.updatedAt = new Date().toISOString();

      await saveDatabase();
      return json({ received: true, status: booking.status });
    }

    return err(`API endpoint not found: ${method} ${pathname}`, 404);
  })().catch(error => {
    console.error('Unhandled API error:', error);
    err('Internal server error', 500);
  });
}
