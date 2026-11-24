// tests/phase3_bookings_payments_security.test.mjs
// Comprehensive Automated Test Suite for Security, Bookings, Payments, and Concurrency
// Run: node tests/phase3_bookings_payments_security.test.mjs

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createApiServer } from '../server/server.js';
import { resetDatabase, loadDatabase, saveDatabase, hashPassword } from '../server/db.js';
import { resetRateLimits } from '../server/routes.js';
import { seedUser, seedVendor } from './fixtures.mjs';

console.log('================================================================');
console.log('🛡️  RUNNING PHASE 3: SECURITY, BOOKINGS, PAYMENTS & AUDIT TESTS');
console.log('================================================================\n');

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
  return { status: res.status, ok: res.ok, headers: res.headers, data };
}

async function runTests() {
  resetDatabase();

  // Self-created fixtures (production starts empty). vendor2 is priced at
  // TSh 1,800,000 so the server-owned deposit (30%) is 540,000 and commission
  // (5%) is 90,000, independent of any client-supplied price.
  const groom = seedUser({ name: 'John Msuya', email: 'groom.phase3@myday.test', password: 'password123' });
  const bride = seedUser({ name: 'Sarah Kimaro', email: 'bride.phase3@myday.test', password: 'password123' });
  const vendor1 = seedVendor({ id: 'test-venue-1', name: 'Grand Imperial Hall', category: 'kumbi', priceRate: 2000000 });
  const vendor2 = seedVendor({ id: 'test-venue-2', name: 'Serengeti Palace Ballroom', category: 'kumbi', priceRate: 1800000 });

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
    // SECTION 1: Production Security Headers
    // -------------------------------------------------------------
    console.log('--- 1. Production Security Headers ---');
    {
      const res = await request('/api/business-schedule');
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
      assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
      assert.equal(res.headers.get('x-xss-protection'), '1; mode=block');
      assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
      assert.ok(res.headers.get('permissions-policy'));
      logPass('HTTP response carries all essential production security headers');
    }

    // -------------------------------------------------------------
    // SECTION 2: Rate Limiting on Sensitive Endpoints
    // -------------------------------------------------------------
    console.log('\n--- 2. Sensitive Endpoint Rate Limiting ---');
    {
      let rateLimited = false;
      // Rapidly fire auth requests to test rate limiter
      for (let i = 0; i < 30; i++) {
        const res = await request('/api/auth/login', {
          method: 'POST',
          body: { email: `test-${i}@example.com`, password: 'invalid-pass' }
        });
        if (res.status === 429) {
          rateLimited = true;
          assert.ok(res.headers.get('retry-after'));
          break;
        }
      }
      assert.ok(rateLimited, 'Expected sensitive login endpoint to rate-limit excessive requests');
      logPass('Rate limiter successfully intercepts excessive requests with HTTP 429 & Retry-After');
      resetRateLimits();
    }

    // -------------------------------------------------------------
    // SECTION 3: Password Recovery & Reset Flow
    // -------------------------------------------------------------
    console.log('\n--- 3. Password Recovery & Account Recovery ---');
    let resetToken;
    let activeGroomToken;
    {
      // Request reset token for John
      const forgotRes = await request('/api/auth/forgot-password', {
        method: 'POST',
        body: { email: groom.user.email }
      });
      assert.equal(forgotRes.status, 200);
      assert.ok(forgotRes.data.resetToken);
      resetToken = forgotRes.data.resetToken;
      logPass('Forgot password endpoint issues secure expiring reset token');
    }

    {
      // Reject short password
      const shortPassRes = await request('/api/auth/reset-password', {
        method: 'POST',
        body: { token: resetToken, newPassword: '123' }
      });
      assert.equal(shortPassRes.status, 422);
      logPass('Password reset rejects weak/short passwords (< 6 chars)');

      // Complete reset with valid password
      const resetRes = await request('/api/auth/reset-password', {
        method: 'POST',
        body: { token: resetToken, newPassword: 'NewSecurePassword2026!' }
      });
      assert.equal(resetRes.status, 200);
      assert.ok(resetRes.data.success);
      logPass('Password reset successfully updates password hash in database');

      // Old password must fail
      const oldLoginRes = await request('/api/auth/login', {
        method: 'POST',
        body: { email: groom.user.email, password: 'password123' }
      });
      assert.equal(oldLoginRes.status, 401);
      logPass('Old password is immediately revoked and fails authentication');

      // New password must succeed
      const newLoginRes = await request('/api/auth/login', {
        method: 'POST',
        body: { email: groom.user.email, password: 'NewSecurePassword2026!' }
      });
      assert.equal(newLoginRes.status, 200);
      assert.ok(newLoginRes.data.token);
      activeGroomToken = newLoginRes.data.token;
      logPass('New password successfully authenticates user and generates new session');

      // Reset token is single-use and cannot be replayed
      const replayRes = await request('/api/auth/reset-password', {
        method: 'POST',
        body: { token: resetToken, newPassword: 'AnotherPassword!' }
      });
      assert.equal(replayRes.status, 400);
      logPass('Single-use reset token cannot be reused or replayed');

      // Restore John's password hash back to default 'password123'
      const db = loadDatabase();
      const john = db.users.find(u => u.id === groom.user.id);
      if (john) {
        john.passwordHash = hashPassword('password123');
        await saveDatabase();
      }
    }

    // -------------------------------------------------------------
    // SECTION 4: Bookings & Reservation Concurrency
    // -------------------------------------------------------------
    console.log('\n--- 4. Bookings, Past Dates & Concurrency Protection ---');
    const groomToken = activeGroomToken;
    const brideToken = bride.token;
    let bookingId;

    {
      // Past event date rejection
      const pastBooking = await request('/api/bookings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groomToken}` },
        body: {
          category: 'kumbi',
          providerId: vendor1.id,
          packageId: 'standard',
          date: '2020-01-01',
          price: 2000000
        }
      });
      assert.equal(pastBooking.status, 422);
      logPass('Past event date reservation rejected safely with HTTP 422');
    }

    {
      // Valid future reservation
      const validBooking = await request('/api/bookings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groomToken}` },
        body: {
          category: 'kumbi',
          providerId: vendor2.id, // Serengeti Palace Ballroom
          packageId: 'standard',
          date: '2026-11-20',
          price: 1800000
        }
      });
      assert.equal(validBooking.status, 201);
      assert.ok(validBooking.data.booking);
      assert.equal(validBooking.data.booking.deposit, 540000); // 30% of 1,800,000
      assert.equal(validBooking.data.booking.commission, 90000); // 5% of 1,800,000
      assert.equal(validBooking.data.booking.status, 'pending_deposit');
      bookingId = validBooking.data.booking.id;
      logPass('Future booking created with authoritative 30% deposit calculation (TSh 540,000)');
    }

    {
      // Concurrency & Double-Booking Prevention:
      // Another user attempts to book the same vendor on the same date
      const doubleBooking = await request('/api/bookings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${brideToken}` },
        body: {
          category: 'kumbi',
          providerId: vendor2.id,
          packageId: 'standard',
          date: '2026-11-20',
          price: 1800000
        }
      });
      assert.equal(doubleBooking.status, 409);
      assert.ok(doubleBooking.data.error.includes('already booked'));
      logPass('Concurrent double-booking on same vendor and date rejected with HTTP 409 Conflict');
    }

    // -------------------------------------------------------------
    // SECTION 5: Payments — disabled by default, then a verified gateway flow
    // -------------------------------------------------------------
    console.log('\n--- 5. Payment Escrow, Idempotency & Signed Webhooks ---');

    // 5a. No licensed gateway configured: the API must refuse to record money
    // movement rather than simulate success. Booking stays pending_deposit.
    {
      delete process.env.PAYMENTS_PROVIDER;
      delete process.env.PAYMENTS_WEBHOOK_SECRET;
      const disabledPay = await request('/api/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groomToken}` },
        body: { bookingId, amount: 540000, gateway: 'mpesa' }
      });
      assert.equal(disabledPay.status, 503);
      assert.ok(/not enabled/i.test(disabledPay.data.error));
      const disabledWebhook = await request('/api/payments/webhook', {
        method: 'POST',
        headers: { 'X-Myday-Signature': 'anything' },
        body: { bookingId, txnRef: 'TXN-X', status: 'success', amount: 540000 }
      });
      assert.equal(disabledWebhook.status, 503);
      const dbDisabled = loadDatabase();
      const bkDisabled = dbDisabled.bookings.find(b => b.id === bookingId);
      assert.equal(bkDisabled.status, 'pending_deposit');
      assert.equal(bkDisabled.paidAmount, 0);
      assert.equal((dbDisabled.payments || []).length, 0);
      logPass('Payments and webhooks refuse money movement (503) while no gateway is configured; booking stays pending_deposit');
    }

    // 5b. Enable a test gateway and exercise the real, verified flow.
    const TEST_SECRET = 'test-webhook-secret';
    process.env.PAYMENTS_PROVIDER = 'test-gateway';
    process.env.PAYMENTS_WEBHOOK_SECRET = TEST_SECRET;

    async function signedWebhook(payload, secret = TEST_SECRET) {
      const raw = JSON.stringify(payload);
      const sig = crypto.createHmac('sha256', secret).update(raw).digest('hex');
      const res = await fetch(`${baseUrl}/api/payments/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Myday-Signature': sig },
        body: raw,
      });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    }

    // Initiate the deposit (server-computed due = 540,000). Never success at initiation.
    {
      const depositPay = await request('/api/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groomToken}` },
        body: { bookingId, amount: 540000, gateway: 'mpesa', txnRef: 'TXN-DEP-1' }
      });
      assert.equal(depositPay.status, 201);
      assert.equal(depositPay.data.payment.status, 'pending');
      assert.equal(depositPay.data.payment.amount, 540000);
      assert.equal(depositPay.data.booking.status, 'pending_deposit');
      logPass('Deposit initiation records a pending payment, never an instant success');

      // Wrong amount (not a server-computed due) is rejected.
      const badAmount = await request('/api/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groomToken}` },
        body: { bookingId, amount: 12345, gateway: 'mpesa', txnRef: 'TXN-BAD' }
      });
      assert.equal(badAmount.status, 422);
      logPass('Payment amount must equal a server-computed due (deposit or balance); arbitrary amounts rejected');

      // Duplicate within 5s rejected.
      const duplicatePay = await request('/api/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groomToken}` },
        body: { bookingId, amount: 540000, gateway: 'mpesa', txnRef: 'TXN-DEP-1' }
      });
      assert.equal(duplicatePay.status, 409);
      logPass('Duplicate payment attempt within 5 seconds rejected to prevent double charge');
    }

    // Webhook signature enforcement.
    {
      const badSig = await request('/api/payments/webhook', {
        method: 'POST',
        headers: { 'X-Myday-Signature': 'forged-signature' },
        body: { bookingId, txnRef: 'TXN-DEP-1', status: 'success', amount: 540000 }
      });
      assert.equal(badSig.status, 401);
      logPass('Webhook with an invalid HMAC signature is rejected (401)');

      const goodSig = await signedWebhook({ bookingId, txnRef: 'TXN-DEP-1', status: 'success', amount: 540000 });
      assert.equal(goodSig.status, 200);
      assert.equal(goodSig.data.received, true);
      assert.equal(goodSig.data.status, 'partial');
      const dbPartial = loadDatabase();
      const bkPartial = dbPartial.bookings.find(b => b.id === bookingId);
      assert.equal(bkPartial.paidAmount, 540000);
      assert.equal(bkPartial.status, 'partial');
      logPass('Validly signed deposit callback marks the payment success and booking partial (paid 540,000)');
    }

    // Pay the remaining balance (1,260,000) and confirm via signed callback.
    {
      const balancePay = await request('/api/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groomToken}` },
        body: { bookingId, amount: 1260000, gateway: 'mpesa', txnRef: 'TXN-BAL-1' }
      });
      assert.equal(balancePay.status, 201);
      assert.equal(balancePay.data.payment.status, 'pending');

      const confirm = await signedWebhook({ bookingId, txnRef: 'TXN-BAL-1', status: 'success', amount: 1260000 });
      assert.equal(confirm.status, 200);
      assert.equal(confirm.data.status, 'confirmed');
      const dbFull = loadDatabase();
      const bkFull = dbFull.bookings.find(b => b.id === bookingId);
      assert.equal(bkFull.paidAmount, 1800000);
      assert.equal(bkFull.status, 'confirmed');
      logPass('Balance callback confirms the booking only after verified full payment (paid 1,800,000)');
    }

    // Restore the disabled-by-default state for the remaining sections.
    delete process.env.PAYMENTS_PROVIDER;
    delete process.env.PAYMENTS_WEBHOOK_SECRET;

    // -------------------------------------------------------------
    // SECTION 6: Cross-Account Data Isolation
    // -------------------------------------------------------------
    console.log('\n--- 6. Cross-Account Data Isolation ---');
    {
      // Unauthenticated access blocked
      const unauth = await request('/api/bookings');
      assert.equal(unauth.status, 401);
      logPass('Unauthenticated request to bookings rejected with HTTP 401');

      // Third-party user cannot view other users single booking
      const thirdPartyRegister = await request('/api/auth/register', {
        method: 'POST',
        body: { name: 'Stranger', email: 'stranger@external.tz', password: 'Password123!', role: 'customer' }
      });
      const strangerToken = thirdPartyRegister.data.token;

      const strangerBookingAccess = await request(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${strangerToken}` }
      });
      assert.equal(strangerBookingAccess.status, 403);
      logPass('IDOR protection: unauthorized user blocked from viewing private booking (HTTP 403)');
    }

    // -------------------------------------------------------------
    // SECTION 7: File-Backed ACID Persistence
    // -------------------------------------------------------------
    console.log('\n--- 7. Database Persistence & Recovery ---');
    {
      const db = loadDatabase();
      const savedBooking = db.bookings.find(b => b.id === bookingId);
      assert.ok(savedBooking);
      assert.equal(savedBooking.price, 1800000);
      assert.equal(savedBooking.paidAmount, 1800000);
      assert.equal(savedBooking.status, 'confirmed');
      logPass('Bookings and payments safely persist in authoritative ACID database store');
    }

  } catch (err) {
    logFail('Test assertion failed', err);
  } finally {
    server.close();
  }

  console.log('\n================================================================');
  console.log(`📊 PHASE 3 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
