// tests/email_verification.test.mjs
// Comprehensive Automated Test Suite for Email Verification & Security
// Run: node tests/email_verification.test.mjs

import assert from 'node:assert/strict';
import { createApiServer } from '../server/server.js';
import { resetDatabase, loadDatabase, saveDatabase } from '../server/db.js';
import { resetRateLimits } from '../server/routes.js';

console.log('====================================================');
console.log('📧 RUNNING EMAIL VERIFICATION & SECURITY TEST SUITE');
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

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return { status: res.status, data };
}

async function runTests() {
  server = createApiServer();
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  try {
    resetRateLimits();
    resetDatabase();

    console.log('--- 1. Account Registration with Email Verification Code ---');
    const testEmail = `neema.bride.${Date.now()}@example.co.tz`;
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Neema Bride',
        email: testEmail,
        password: 'Password123!',
        phone: '+255 777 888 999',
        role: 'customer'
      }
    });

    assert.equal(regRes.status, 201, 'Registration should return 201 Created');
    assert.ok(regRes.data.user, 'Registration returns user object');
    assert.equal(regRes.data.user.emailVerified, false, 'New user starts with emailVerified: false');
    assert.ok(regRes.data.verificationCode, 'Server generates and returns 6-digit verification code');
    assert.equal(regRes.data.verificationCode.length, 6, 'Verification code is 6 digits');
    assert.match(regRes.data.verificationCode, /^[0-9]{6}$/, 'Verification code is numeric');
    const userToken = regRes.data.token;
    const initialCode = regRes.data.verificationCode;
    logPass('New user registers with emailVerified: false and receives 6-digit verification code');

    console.log('\n--- 2. Direct Me Profile Verification Status ---');
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.equal(meRes.status, 200);
    assert.equal(meRes.data.user.emailVerified, false, 'Authenticated profile reflects unverified status');
    logPass('Profile /api/auth/me reflects emailVerified: false before verification');

    console.log('\n--- 3. Invalid Verification Code Handling ---');
    const wrongCodeRes = await request('/api/auth/verify-email', {
      method: 'POST',
      body: {
        email: testEmail,
        code: '000000' // wrong code
      }
    });
    assert.equal(wrongCodeRes.status, 400, 'Wrong verification code rejected with 400');
    assert.ok(wrongCodeRes.data.error.includes('Invalid verification code'), 'Error message informs of invalid code');
    logPass('Invalid verification code is rejected with 400 Bad Request');

    console.log('\n--- 4. Expired Verification Code Handling ---');
    // Simulate expired code in DB
    const db = loadDatabase();
    const expiredCode = '888111';
    db.email_verifications.push({
      id: 'ev-test-expired',
      email: testEmail,
      code: expiredCode,
      expiresAt: new Date(Date.now() - 60000).toISOString(), // 1 minute in the past
      used: false,
      createdAt: new Date(Date.now() - 120000).toISOString()
    });
    await saveDatabase();

    const expiredRes = await request('/api/auth/verify-email', {
      method: 'POST',
      body: {
        email: testEmail,
        code: expiredCode
      }
    });
    assert.equal(expiredRes.status, 400, 'Expired verification code rejected with 400');
    assert.ok(expiredRes.data.error.includes('expired'), 'Error message informs that code has expired');
    logPass('Expired verification code is rejected with descriptive error');

    console.log('\n--- 5. Successful Verification with Valid 6-Digit Code ---');
    const validVerifyRes = await request('/api/auth/verify-email', {
      method: 'POST',
      body: {
        email: testEmail,
        code: initialCode
      }
    });
    assert.equal(validVerifyRes.status, 200, 'Valid verification code returns 200 OK');
    assert.equal(validVerifyRes.data.success, true);
    assert.equal(validVerifyRes.data.emailVerified, true);
    assert.equal(validVerifyRes.data.user.emailVerified, true, 'User payload returned with emailVerified: true');
    logPass('Valid 6-digit code verifies email address and returns verified user payload');

    console.log('\n--- 6. Profile Reflects Verified Status ---');
    const verifiedMeRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.equal(verifiedMeRes.status, 200);
    assert.equal(verifiedMeRes.data.user.emailVerified, true, 'Profile /api/auth/me now reflects emailVerified: true');
    logPass('Profile /api/auth/me confirmed emailVerified: true after verification');

    console.log('\n--- 7. Replay / Single-Use Protection ---');
    const replayRes = await request('/api/auth/verify-email', {
      method: 'POST',
      body: {
        email: testEmail,
        code: initialCode
      }
    });
    assert.equal(replayRes.status, 400, 'Reusing a verified code is rejected');
    assert.ok(replayRes.data.error.includes('already been used'), 'Error states code has already been used');
    logPass('Single-use guarantee enforced: used verification code cannot be replayed');

    console.log('\n--- 8. Resend / Send Verification Email Endpoint ---');
    const resendRes = await request('/api/auth/send-verification', {
      method: 'POST',
      body: { email: testEmail }
    });
    assert.equal(resendRes.status, 200, 'Resend verification code returns 200 OK');
    assert.ok(resendRes.data.verificationCode, 'New verification code generated');
    assert.equal(resendRes.data.verificationCode.length, 6, 'Resent code is 6 digits');
    const newCode = resendRes.data.verificationCode;
    logPass('Resend verification endpoint generates fresh 6-digit code');

    // Verify with the newly generated code
    const verifyNewRes = await request('/api/auth/verify-email', {
      method: 'POST',
      body: {
        email: testEmail,
        code: newCode
      }
    });
    assert.equal(verifyNewRes.status, 200);
    assert.equal(verifyNewRes.data.emailVerified, true);
    logPass('Newly requested verification code successfully verified');

    console.log('\n--- 9. Password Reset Verification Flow Integrity ---');
    const forgotRes = await request('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: testEmail }
    });
    assert.equal(forgotRes.status, 200);
    assert.ok(forgotRes.data.resetToken, 'Password reset token generated for registered email');

    const resetRes = await request('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: forgotRes.data.resetToken,
        newPassword: 'BrandNewPassword2026!'
      }
    });
    assert.equal(resetRes.status, 200);
    assert.equal(resetRes.data.success, true);

    // Verify login works with new password
    const newLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'BrandNewPassword2026!'
      }
    });
    assert.equal(newLoginRes.status, 200);
    assert.equal(newLoginRes.data.user.emailVerified, true, 'User maintains emailVerified status after password reset');
    logPass('Password reset verification token flow functions correctly and preserves verified status');

    console.log('\n--- 10. Workspace Invitation Email Verification Flow Integrity ---');
    // Login as groom to invite
    const groomLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'john@myday.co.tz', password: 'password123' }
    });
    const groomToken = groomLogin.data.token;

    const inviteeEmail = `invitee.${Date.now()}@example.co.tz`;
    const inviteRes = await request('/api/workspaces/wed-1/invitations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groomToken}` },
      body: { email: inviteeEmail, role: 'partner' }
    });
    assert.equal(inviteRes.status, 201);
    const inviteToken = inviteRes.data.invitation.token;

    // Check invitation token public check
    const checkInviteRes = await request(`/api/invitations/${inviteToken}`);
    assert.equal(checkInviteRes.status, 200);
    assert.equal(checkInviteRes.data.invitation.email, inviteeEmail);

    // Accept invitation with authenticated test user
    const acceptInviteRes = await request(`/api/invitations/${inviteToken}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newLoginRes.data.token}` }
    });
    assert.equal(acceptInviteRes.status, 200);
    assert.equal(acceptInviteRes.data.success, true);
    logPass('Workspace invitation email token verification and acceptance confirmed functional');

    console.log('\n====================================================');
    console.log(`📊 EMAIL VERIFICATION SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test Suite Failed with unexpected error:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTests();

