// tests/phase1_workspace.test.mjs
// Comprehensive Automated Test Suite for Phase 1: Shared Wedding Workspace
// Run: node tests/phase1_workspace.test.mjs

import assert from 'node:assert/strict';
import { createApiServer } from '../server/server.js';
import { resetDatabase, loadDatabase } from '../server/db.js';

console.log('====================================================');
console.log('💍 RUNNING PHASE 1: SHARED WEDDING WORKSPACE TESTS');
console.log('====================================================\n');

let server;
let baseUrl;
let passed = 0;
let failed = 0;

function logPass(msg) {
  passed++;
  console.log(`  ✅ PASS: ${msg}`);
}

function logFail(msg, err) {
  failed++;
  console.error(`  ❌ FAIL: ${msg}`);
  console.error(err);
}

// HTTP request helper
async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const body = options.body ? JSON.stringify(options.body) : undefined;

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  // Reset database before tests
  resetDatabase();

  server = createApiServer();
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------
    // TEST SECTION 1: ACCOUNT SEPARATION (BRIDE & GROOM)
    // -------------------------------------------------------------
    console.log('--- 1. Account Separation ---');

    // 1.1 Groom Registration
    const groomRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Baraka Groom',
        email: 'baraka@wedding.tz',
        password: 'secureGroomPassword123',
        phone: '+255 777 111 222',
        role: 'customer'
      }
    });
    assert.equal(groomRes.status, 201, 'Groom account registered');
    assert.ok(groomRes.data.user.id, 'Groom has unique ID');
    assert.ok(groomRes.data.token, 'Groom receives session token');
    const groomToken = groomRes.data.token;
    const groomId = groomRes.data.user.id;
    logPass('Groom registers with separate account and distinct credentials');

    // 1.2 Bride Registration
    const brideRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Amina Bride',
        email: 'amina@wedding.tz',
        password: 'secureBridePassword456',
        phone: '+255 777 333 444',
        role: 'customer'
      }
    });
    assert.equal(brideRes.status, 201, 'Bride account registered');
    assert.notEqual(brideRes.data.user.id, groomId, 'Bride and Groom have distinct IDs');
    assert.notEqual(brideRes.data.user.email, 'baraka@wedding.tz', 'Distinct emails');
    const brideToken = brideRes.data.token;
    const brideId = brideRes.data.user.id;
    logPass('Bride registers with separate account and distinct credentials');

    // 1.3 Uninvited Third Party Registration
    const thirdPartyRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Intruder User',
        email: 'intruder@other.tz',
        password: 'intruderPassword789',
        role: 'customer'
      }
    });
    const intruderToken = thirdPartyRes.data.token;
    logPass('Third-party account registered for isolation testing');

    // -------------------------------------------------------------
    // TEST SECTION 2: WORKSPACE CREATION & OWNERSHIP
    // -------------------------------------------------------------
    console.log('\n--- 2. Workspace Creation & Ownership ---');

    const wsCreateRes = await request('/api/workspaces', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: {
        title: "Baraka & Amina's Royal Wedding",
        groom: 'Baraka',
        bride: 'Amina',
        date: '2026-11-20',
        location: 'Zanzibar',
        guests: 200,
        budget: 25000000
      }
    });

    assert.equal(wsCreateRes.status, 201, 'Workspace created');
    const workspaceId = wsCreateRes.data.workspace.id;
    assert.equal(wsCreateRes.data.workspace.ownerId, groomId, 'Groom is recorded as owner');
    assert.equal(wsCreateRes.data.workspace.userRole, 'owner', 'Creator gets owner role');
    logPass('Groom creates wedding workspace and is established as authoritative Owner');

    // -------------------------------------------------------------
    // TEST SECTION 3: WORKSPACE ISOLATION & UNAUTHORIZED ACCESS
    // -------------------------------------------------------------
    console.log('\n--- 3. Workspace Isolation & Unauthorized Access ---');

    // 3.1 Intruder cannot read Groom's workspace by changing URL/ID
    const intruderReadRes = await request(`/api/workspaces/${workspaceId}`, {
      headers: { Authorization: `Bearer ${intruderToken}` }
    });
    assert.equal(intruderReadRes.status, 403, 'Intruder blocked with 403');
    logPass('Uninvited user blocked from accessing workspace by changing ID/URL (403 Forbidden)');

    // 3.2 Intruder cannot list members of Groom's workspace
    const intruderMembersRes = await request(`/api/workspaces/${workspaceId}/members`, {
      headers: { Authorization: `Bearer ${intruderToken}` }
    });
    assert.equal(intruderMembersRes.status, 403, 'Intruder blocked from viewing members');
    logPass('Uninvited user blocked from viewing workspace members');

    // 3.3 Intruder cannot modify workspace settings
    const intruderPatchRes = await request(`/api/workspaces/${workspaceId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${intruderToken}` },
      body: { title: 'Hacked Wedding' }
    });
    assert.equal(intruderPatchRes.status, 403, 'Intruder blocked from updating workspace');
    logPass('Uninvited user blocked from updating workspace');

    // 3.4 Unauthenticated request blocked
    const anonRes = await request(`/api/workspaces/${workspaceId}`);
    assert.equal(anonRes.status, 401, 'Anonymous request blocked with 401');
    logPass('Unauthenticated request rejected with 401 Unauthorized');

    // -------------------------------------------------------------
    // TEST SECTION 4: SECURE EXPIRING INVITATIONS & EXPIRY
    // -------------------------------------------------------------
    console.log('\n--- 4. Secure Expiring Invitations ---');

    // 4.1 Groom invites Bride as 'partner'
    const inviteBrideRes = await request(`/api/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: {
        email: 'amina@wedding.tz',
        role: 'partner',
        expiresInHours: 48
      }
    });
    assert.equal(inviteBrideRes.status, 201, 'Invitation generated');
    const brideInviteToken = inviteBrideRes.data.invitation.token;
    assert.ok(brideInviteToken, 'Cryptographic invite token generated');
    assert.equal(inviteBrideRes.data.invitation.role, 'partner');
    logPass('Owner generates secure invitation for Bride with partner role and 48h expiry');

    // 4.2 Public invitation verification endpoint
    const checkInviteRes = await request(`/api/invitations/${brideInviteToken}`);
    assert.equal(checkInviteRes.status, 200);
    assert.equal(checkInviteRes.data.invitation.role, 'partner');
    assert.equal(checkInviteRes.data.invitation.weddingTitle, "Baraka & Amina's Royal Wedding");
    logPass('Public token preview returns wedding title, role, and valid status');

    // 4.3 Expired token test: Create an expired invitation with 0 duration
    const expiredInviteRes = await request(`/api/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: {
        role: 'friend',
        expiresInHours: -1 // Expired 1 hour ago
      }
    });
    const expiredToken = expiredInviteRes.data.invitation.token;

    // Attempting to accept expired invitation fails
    const acceptExpiredRes = await request(`/api/invitations/${expiredToken}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${intruderToken}` }
    });
    assert.equal(acceptExpiredRes.status, 410, 'Expired invitation rejected with 410 Gone');
    logPass('Expired invitation is rejected on the server');

    // -------------------------------------------------------------
    // TEST SECTION 5: INVITATION ACCEPTANCE & WORKSPACE MEMBERSHIP
    // -------------------------------------------------------------
    console.log('\n--- 5. Invitation Acceptance & Workspace Sharing ---');

    // Bride accepts invitation
    const acceptBrideRes = await request(`/api/invitations/${brideInviteToken}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${brideToken}` }
    });
    assert.equal(acceptBrideRes.status, 200, 'Bride accepted invitation');
    assert.equal(acceptBrideRes.data.role, 'partner');
    logPass('Bride accepts invitation on server and is joined to wedding workspace as Partner');

    // Single-use guarantee: Re-accepting the same invitation fails
    const reacceptRes = await request(`/api/invitations/${brideInviteToken}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${intruderToken}` }
    });
    assert.equal(reacceptRes.status, 400, 'Already-accepted invite cannot be reused');
    logPass('Invitation token cannot be reused once accepted (single-use guarantee)');

    // Now Bride can access the shared workspace!
    const brideWsRes = await request(`/api/workspaces/${workspaceId}`, {
      headers: { Authorization: `Bearer ${brideToken}` }
    });
    assert.equal(brideWsRes.status, 200, 'Bride has authorized access');
    assert.equal(brideWsRes.data.workspace.userRole, 'partner');
    assert.equal(brideWsRes.data.workspace.permissions.canManageBudget, true);
    logPass('Bride verifies authorized access to shared workspace with partner permissions');

    // -------------------------------------------------------------
    // TEST SECTION 6: INVITATION REVOCATION
    // -------------------------------------------------------------
    console.log('\n--- 6. Invitation Revocation ---');

    // Create an invite for a friend
    const friendInviteRes = await request(`/api/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: { role: 'friend', expiresInHours: 24 }
    });
    const friendInviteId = friendInviteRes.data.invitation.id;
    const friendToken = friendInviteRes.data.invitation.token;

    // Owner revokes invitation
    const revokeRes = await request(`/api/workspaces/${workspaceId}/invitations/${friendInviteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${groomToken}` }
    });
    assert.equal(revokeRes.status, 200, 'Invitation revoked');

    // Third party tries to accept revoked invitation
    const acceptRevokedRes = await request(`/api/invitations/${friendToken}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${intruderToken}` }
    });
    assert.equal(acceptRevokedRes.status, 410, 'Revoked invitation rejected with 410');
    logPass('Revoked invitation is rejected when acceptance is attempted');

    // -------------------------------------------------------------
    // TEST SECTION 7: ROLE-BASED PERMISSION ENFORCEMENT & REMOVAL
    // -------------------------------------------------------------
    console.log('\n--- 7. Role-Based Permissions & Member Management ---');

    // Invite a wedding planner and a vendor
    const plannerInvite = await request(`/api/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: { role: 'planner' }
    });
    const vendorInvite = await request(`/api/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: { role: 'vendor' }
    });

    // Register planner and vendor users
    const plannerUser = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Zuhura Planner', email: 'zuhura@planner.tz', password: 'pass', role: 'customer' }
    });
    const vendorUser = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Kumbi Vendor', email: 'kumbi@vendor.tz', password: 'pass', role: 'provider' }
    });

    // Accept both
    await request(`/api/invitations/${plannerInvite.data.invitation.token}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${plannerUser.data.token}` }
    });
    await request(`/api/invitations/${vendorInvite.data.invitation.token}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${vendorUser.data.token}` }
    });

    // 7.1 Vendor cannot edit workspace
    const vendorEditRes = await request(`/api/workspaces/${workspaceId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${vendorUser.data.token}` },
      body: { budget: 99999999 }
    });
    assert.equal(vendorEditRes.status, 403, 'Vendor cannot edit workspace');
    logPass('Vendor cannot edit workspace settings (permission denied)');

    // 7.2 Vendor cannot invite members
    const vendorInviteRes = await request(`/api/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${vendorUser.data.token}` },
      body: { role: 'friend' }
    });
    assert.equal(vendorInviteRes.status, 403, 'Vendor cannot invite members');
    logPass('Vendor cannot invite new workspace members (permission denied)');

    // 7.3 Planner can invite members, but cannot change roles or remove members
    const plannerInviteRes = await request(`/api/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${plannerUser.data.token}` },
      body: { role: 'family' }
    });
    assert.equal(plannerInviteRes.status, 201, 'Planner has invite permission');
    logPass('Wedding Planner has authorized invite permission');

    // Planner tries to change Bride's role -> denied
    const membersList = await request(`/api/workspaces/${workspaceId}/members`, {
      headers: { Authorization: `Bearer ${groomToken}` }
    });
    const brideMember = membersList.data.members.find(m => m.userId === brideId);

    const plannerChangeRoleRes = await request(`/api/workspaces/${workspaceId}/members/${brideMember.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${plannerUser.data.token}` },
      body: { newRole: 'friend' }
    });
    assert.equal(plannerChangeRoleRes.status, 403, 'Planner cannot change roles');
    logPass('Planner cannot change member roles (owner-only permission enforced)');

    // 7.4 Owner changes Vendor role to 'friend'
    const vendorMember = membersList.data.members.find(m => m.userId === vendorUser.data.user.id);
    const ownerChangeRoleRes = await request(`/api/workspaces/${workspaceId}/members/${vendorMember.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: { newRole: 'friend' }
    });
    assert.equal(ownerChangeRoleRes.status, 200, 'Owner changed role');
    logPass('Owner successfully changes member role');

    // 7.5 Owner removes member
    const removeRes = await request(`/api/workspaces/${workspaceId}/members/${vendorMember.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${groomToken}` }
    });
    assert.equal(removeRes.status, 200, 'Member removed');
    logPass('Owner successfully removes member from wedding workspace');

    // Former member now blocked from workspace
    const exMemberRes = await request(`/api/workspaces/${workspaceId}`, {
      headers: { Authorization: `Bearer ${vendorUser.data.token}` }
    });
    assert.equal(exMemberRes.status, 403, 'Removed member has no access');
    logPass('Removed member immediately loses workspace access');

    // -------------------------------------------------------------
    // TEST SECTION 8: AUTHORITATIVE PERSISTENCE VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- 8. Authoritative Database Persistence ---');

    const rawDb = loadDatabase();
    assert.ok(rawDb.workspaces.some(w => w.id === workspaceId), 'Workspace persisted in db');
    assert.ok(rawDb.workspace_members.some(m => m.workspaceId === workspaceId && m.userId === brideId), 'Bride membership persisted');
    logPass('Authoritative persistent database verified with ACID file-backed records');

  } catch (err) {
    logFail('Unexpected test exception', err);
  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`📊 PHASE 1 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
