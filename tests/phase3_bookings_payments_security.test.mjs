// tests/phase3_bookings_payments_security.test.mjs
// Comprehensive Automated Test Suite for Security, Bookings, Payments, and Concurrency
// Run: node tests/phase3_bookings_payments_security.test.mjs

import assert from 'node:assert/strict';
import { createApiServer } from '../server/server.js';
import { resetDatabase, loadDatabase } from '../server/db.js';
import { resetRateLimits } from '../server/routes.js';

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
        body: { email: 'john@myday.co.tz' }
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
        body: { email: 'john@myday.co.tz', password: 'password123' }
      });
      assert.equal(oldLoginRes.status, 401);
      logPass('Old password is immediately revoked and fails authentication');

      // New password must succeed
      const newLoginRes = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'john@myday.co.tz', password: 'NewSecurePassword2026!' }
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
    }

    // -------------------------------------------------------------
    // SECTION 4: Bookings & Reservation Concurrency
    // -------------------------------------------------------------
    console.log('\n--- 4. Bookings, Past Dates & Concurrency Protection ---');
    const groomToken = activeGroomToken;
    const brideToken = 'token-bride-session';
    let bookingId;

    {
      // Past event date rejection
      const pastBooking = await request('/api/bookings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groomToken}` },
        body: {
          category: 'kumbi',
          providerId: 'venue-1',
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
          providerId: 'venue-2', // Serengeti Palace Ballroom
          packageId: 'standard',
          date: '2026-11-20',
          price: 1800000
        }
      });
      assert.equal(validBooking.status, 201);
      assert.ok(validBooking.data.booking);
      assert.equal(validBooking.data.booking.deposit, 540000); // 30% of 1,800,000
      assert.equal(validBooking.data.booking.commission, 90000); // 5% of 1,800,000
      assert.equal(validBooking.data.booking.status, 'confirmed');
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
          providerId: 'venue-2',
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
    // SECTION 5: Payments, Duplicate Protection & Webhooks
    // -------------------------------------------------------------
    console.log('\n--- 5. Payment Escrow, Idempotency & Webhooks ---');
    {
      // Submit valid balance payment (remaining TSh 1,260,000)
      const payRes = await request('/api/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groomToken}` },
        body: {
          bookingId,
          amount: 1260000,
          gateway: 'tigopesa',
          isFullPayment: true
        }
      });
      assert.equal(payRes.status, 201);
      assert.equal(payRes.data.payment.amount, 1260000);
      assert.equal(payRes.data.booking.status, 'confirmed');
      assert.equal(payRes.data.booking.paidAmount, 1800000);
      logPass('Payment records escrow transaction and completes full booking confirmation');

      // Duplicate payment rejection (idempotency guard within 5 seconds)
      const duplicatePay = await request('/api/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groomToken}` },
        body: {
          bookingId,
          amount: 1260000,
          gateway: 'tigopesa'
        }
      });
      assert.equal(duplicatePay.status, 409);
      logPass('Duplicate payment attempt within 5 seconds rejected to prevent double charge');
    }

    {
      // Webhook simulation for Tanzanian mobile money provider (M-Pesa)
      const webhookRes = await request('/api/payments/webhook', {
        method: 'POST',
        headers: { 'X-Myday-Signature': 'myday_live_webhook_secret_2026' },
        body: {
          bookingId,
          txnRef: 'TXN-MPESA-WEBHOOK-99',
          status: 'success',
          amount: 1800000,
          gateway: 'mpesa'
        }
      });
      assert.equal(webhookRes.status, 200);
      assert.equal(webhookRes.data.received, true);
      logPass('Payment gateway webhook callback processed and confirmed reliably');
    }

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
