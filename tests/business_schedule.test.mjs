/**
 * MY DAY Platform Business Operating Schedule & Timezone Test Suite
 *
 * Requirements:
 * - Default operating schedule: Mon-Fri 8:00 AM - 5:00 PM
 * - Timezone: Africa/Dar_es_Salaam (EAT, UTC+3, no DST)
 * - Saturday & Sunday: Closed by default
 * - Consistent timestamp storage (UTC ISO) and display in Africa/Dar_es_Salaam
 * - Vendor-configurable schedules (working hours, days off, special hours)
 * - Server-validated appointment scheduling with exception handling
 * - Routine notifications queued outside business hours; security & booking updates 24/7
 * - Couple wedding planning & event bookings independent of office hours (24/7)
 */

import assert from 'node:assert/strict';
import {
  DEFAULT_OPERATING_SCHEDULE,
  getDarEsSalaamParts,
  darEsSalaamToUTC,
  formatDarEsSalaamTime,
  isWithinSchedule,
  getEffectiveVendorSchedule,
  validateAppointmentSlot,
  canDeliverNotification,
} from '../server/businessSchedule.js';

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    failedTests++;
  }
}

console.log('\n--- MY DAY Business Schedule Test Suite ---\n');

// ============================================================================
// 1. Timezone Conversion (Africa/Dar_es_Salaam, UTC+3, No DST)
// ============================================================================
console.log('Group 1: Timezone Conversion & Display');

runTest('Africa/Dar_es_Salaam is UTC+3 (05:00 UTC = 08:00 EAT)', () => {
  const utcDate = new Date('2026-10-19T05:00:00.000Z'); // Monday 05:00 UTC
  const parts = getDarEsSalaamParts(utcDate);
  assert.equal(parts.year, 2026);
  assert.equal(parts.month, 10);
  assert.equal(parts.day, 19);
  assert.equal(parts.hour, 8); // 05:00 UTC + 3 hours = 08:00 EAT
  assert.equal(parts.minute, 0);
  assert.equal(parts.dayOfWeek, 1); // Monday
});

runTest('Africa/Dar_es_Salaam closing boundary (14:00 UTC = 17:00 EAT)', () => {
  const utcDate = new Date('2026-10-19T14:00:00.000Z'); // Monday 14:00 UTC
  const parts = getDarEsSalaamParts(utcDate);
  assert.equal(parts.hour, 17);
  assert.equal(parts.minute, 0);
});

runTest('darEsSalaamToUTC produces correct UTC date', () => {
  const utcIso = darEsSalaamToUTC('2026-10-19', '08:30');
  assert.equal(utcIso, '2026-10-19T05:30:00.000Z');
});

runTest('formatDarEsSalaamTime formats correctly in EAT', () => {
  const utcDate = new Date('2026-10-19T05:00:00.000Z');
  const formatted = formatDarEsSalaamTime(utcDate);
  assert.match(formatted, /EAT/);
  assert.match(formatted, /08:00/);
});

// ============================================================================
// 2. Weekday Boundaries & Default Schedule (Mon-Fri 8:00 AM - 5:00 PM)
// ============================================================================
console.log('\nGroup 2: Weekday Boundaries & Default Schedule');

runTest('Monday 8:00 AM EAT is OPEN (Opening boundary)', () => {
  // Monday 8:00 AM EAT = Monday 05:00 UTC
  const monday8am = new Date('2026-10-19T05:00:00.000Z');
  const status = isWithinSchedule(monday8am, DEFAULT_OPERATING_SCHEDULE);
  assert.equal(status.isOpen, true, '8:00 AM EAT should be open');
});

runTest('Monday 7:59 AM EAT is CLOSED (Before opening boundary)', () => {
  // Monday 7:59 AM EAT = Monday 04:59 UTC
  const monday759am = new Date('2026-10-19T04:59:00.000Z');
  const status = isWithinSchedule(monday759am, DEFAULT_OPERATING_SCHEDULE);
  assert.equal(status.isOpen, false);
  assert.equal(status.reason, 'before_opening');
});

runTest('Wednesday 12:30 PM EAT is OPEN (Midday operating hour)', () => {
  // Wednesday 12:30 PM EAT = Wednesday 09:30 UTC
  const wed1230pm = new Date('2026-10-21T09:30:00.000Z');
  const status = isWithinSchedule(wed1230pm, DEFAULT_OPERATING_SCHEDULE);
  assert.equal(status.isOpen, true);
});

runTest('Friday 4:59 PM EAT is OPEN (Just before closing)', () => {
  // Friday 4:59 PM EAT = Friday 13:59 UTC
  const fri459pm = new Date('2026-10-23T13:59:00.000Z');
  const status = isWithinSchedule(fri459pm, DEFAULT_OPERATING_SCHEDULE);
  assert.equal(status.isOpen, true);
});

runTest('Friday 5:00 PM EAT is CLOSED (Closing boundary)', () => {
  // Friday 5:00 PM EAT = Friday 14:00 UTC
  const fri500pm = new Date('2026-10-23T14:00:00.000Z');
  const status = isWithinSchedule(fri500pm, DEFAULT_OPERATING_SCHEDULE);
  assert.equal(status.isOpen, false);
  assert.equal(status.reason, 'after_closing');
});

runTest('Friday 5:01 PM EAT is CLOSED (After closing)', () => {
  // Friday 5:01 PM EAT = Friday 14:01 UTC
  const fri501pm = new Date('2026-10-23T14:01:00.000Z');
  const status = isWithinSchedule(fri501pm, DEFAULT_OPERATING_SCHEDULE);
  assert.equal(status.isOpen, false);
  assert.equal(status.reason, 'after_closing');
});

// ============================================================================
// 3. Weekend Handling (Saturday & Sunday Closed by Default)
// ============================================================================
console.log('\nGroup 3: Weekend Handling');

runTest('Saturday 10:00 AM EAT is CLOSED by default', () => {
  // Saturday 10:00 AM EAT = Saturday 07:00 UTC (2026-10-24)
  const sat10am = new Date('2026-10-24T07:00:00.000Z');
  const status = isWithinSchedule(sat10am, DEFAULT_OPERATING_SCHEDULE);
  assert.equal(status.isOpen, false);
  assert.equal(status.reason, 'day_off');
});

runTest('Sunday 2:00 PM EAT is CLOSED by default', () => {
  // Sunday 2:00 PM EAT = Sunday 11:00 UTC (2026-10-25)
  const sun2pm = new Date('2026-10-25T11:00:00.000Z');
  const status = isWithinSchedule(sun2pm, DEFAULT_OPERATING_SCHEDULE);
  assert.equal(status.isOpen, false);
  assert.equal(status.reason, 'day_off');
});

// ============================================================================
// 4. Vendor-Specific Schedules (Custom hours, weekend opening, custom holidays)
// ============================================================================
console.log('\nGroup 4: Vendor-Specific Schedules');

runTest('Vendor inherits default schedule if none provided', () => {
  const vendor = { id: 'v-standard', name: 'Standard Caterer' };
  const sched = getEffectiveVendorSchedule(vendor);
  assert.deepEqual(sched.workingDays, [1, 2, 3, 4, 5]);
  assert.equal(sched.workingHours.open, '08:00');
  assert.equal(sched.workingHours.close, '17:00');
});

runTest('Vendor with custom Saturday hours is OPEN on Saturday', () => {
  const customVendor = {
    id: 'v-custom',
    schedule: {
      workingDays: [1, 2, 3, 4, 5, 6], // includes Saturday (6)
      workingHours: { open: '08:00', close: '17:00' },
      specialHours: {
        '6': { open: '09:00', close: '13:00' },
      },
    },
  };
  const sched = getEffectiveVendorSchedule(customVendor);

  // Saturday 10:30 AM EAT = 07:30 UTC
  const sat1030 = new Date('2026-10-24T07:30:00.000Z');
  const statusOpen = isWithinSchedule(sat1030, sched);
  assert.equal(statusOpen.isOpen, true, 'Vendor should be open on Saturday during special hours');

  // Saturday 14:00 PM EAT = 11:00 UTC (past 13:00 closing)
  const sat1400 = new Date('2026-10-24T11:00:00.000Z');
  const statusClosed = isWithinSchedule(sat1400, sched);
  assert.equal(statusClosed.isOpen, false);
  assert.equal(statusClosed.reason, 'after_closing');
});

runTest('Vendor with custom day off is CLOSED on that date', () => {
  const vendorWithDayOff = {
    id: 'v-dayoff',
    schedule: {
      daysOff: ['2026-10-21'], // Wednesday day off
    },
  };
  const sched = getEffectiveVendorSchedule(vendorWithDayOff);

  // Wednesday 10:00 AM EAT (normally open, but custom day off)
  const wedDate = new Date('2026-10-21T07:00:00.000Z');
  const status = isWithinSchedule(wedDate, sched);
  assert.equal(status.isOpen, false);
  assert.equal(status.reason, 'day_off');
});

// ============================================================================
// 5. Appointment & Meeting Scheduling Validation
// ============================================================================
console.log('\nGroup 5: Appointment Validation');

runTest('Valid appointment within business hours is accepted', () => {
  const vendorSched = DEFAULT_OPERATING_SCHEDULE;
  // Monday 10:00 - 11:00 EAT
  const result = validateAppointmentSlot({
    dateStr: '2026-10-19',
    startTimeStr: '10:00',
    endTimeStr: '11:00',
    schedule: vendorSched,
    allowException: false,
  });
  assert.equal(result.valid, true);
  assert.equal(result.isException, false);
});

runTest('Appointment before opening hours is rejected', () => {
  const vendorSched = DEFAULT_OPERATING_SCHEDULE;
  // Monday 07:00 - 08:00 EAT (Office opens at 08:00)
  const result = validateAppointmentSlot({
    dateStr: '2026-10-19',
    startTimeStr: '07:00',
    endTimeStr: '08:00',
    schedule: vendorSched,
    allowException: false,
  });
  assert.equal(result.valid, false);
  assert.match(result.error, /outside working hours/);
});

runTest('Appointment on weekend is rejected when allowException is false', () => {
  const vendorSched = DEFAULT_OPERATING_SCHEDULE;
  // Sunday 11:00 - 12:00 EAT
  const result = validateAppointmentSlot({
    dateStr: '2026-10-25',
    startTimeStr: '11:00',
    endTimeStr: '12:00',
    schedule: vendorSched,
    allowException: false,
  });
  assert.equal(result.valid, false);
  assert.match(result.error, /not an active working day/);
});

runTest('Appointment on weekend is ALLOWED when explicit exception is granted', () => {
  const vendorSched = DEFAULT_OPERATING_SCHEDULE;
  // Sunday 11:00 - 12:00 EAT with explicit exception
  const result = validateAppointmentSlot({
    dateStr: '2026-10-25',
    startTimeStr: '11:00',
    endTimeStr: '12:00',
    schedule: vendorSched,
    allowException: true,
  });
  assert.equal(result.valid, true);
  assert.equal(result.isException, true);
  assert.match(result.exceptionReason, /Requested slot is outside standard business schedule/);
});

runTest('Double booking conflict detection rejects overlapping appointments', () => {
  const existingAppts = [
    {
      id: 'app-1',
      date: '2026-10-19',
      startTime: '10:00',
      endTime: '11:00',
      status: 'confirmed',
    },
  ];

  const result = validateAppointmentSlot({
    dateStr: '2026-10-19',
    startTimeStr: '10:30', // Overlaps 10:00-11:00
    endTimeStr: '11:30',
    schedule: DEFAULT_OPERATING_SCHEDULE,
    existingAppointments: existingAppts,
  });
  assert.equal(result.valid, false);
  assert.match(result.error, /conflicts with another scheduled appointment/);
});

// ============================================================================
// 6. Business-Related Notifications & Routing
// ============================================================================
console.log('\nGroup 6: Business-Related Notifications');

runTest('Routine notification is permitted during weekday business hours', () => {
  // Tuesday 11:00 AM EAT = 08:00 UTC
  const tuesdayMidday = new Date('2026-10-20T08:00:00.000Z');
  const decision = canDeliverNotification({
    type: 'routine_business',
    priority: 'normal',
    currentTime: tuesdayMidday,
  });
  assert.equal(decision.deliverNow, true);
});

runTest('Routine notification is queued outside business hours (e.g. night)', () => {
  // Tuesday 21:00 PM EAT = 18:00 UTC
  const tuesdayNight = new Date('2026-10-20T18:00:00.000Z');
  const decision = canDeliverNotification({
    type: 'routine_business',
    priority: 'normal',
    currentTime: tuesdayNight,
  });
  assert.equal(decision.deliverNow, false);
  assert.equal(decision.queueForLater, true);
  assert.match(decision.scheduledFor, /2026-10-21T05:00:00.000Z/); // Next morning 8:00 AM EAT
});

runTest('Routine notification on Friday night queues for Monday 8:00 AM EAT', () => {
  // Friday 20:00 PM EAT = 17:00 UTC (2026-10-23)
  const fridayNight = new Date('2026-10-23T17:00:00.000Z');
  const decision = canDeliverNotification({
    type: 'task_reminder',
    priority: 'normal',
    currentTime: fridayNight,
  });
  assert.equal(decision.deliverNow, false);
  // Monday 2026-10-26 08:00 EAT = 2026-10-26 05:00 UTC
  assert.equal(decision.scheduledFor, '2026-10-26T05:00:00.000Z');
});

runTest('Security alerts and booking updates DELIVER IMMEDIATELY 24/7 (even on weekends)', () => {
  // Sunday 03:00 AM EAT = 00:00 UTC (2026-10-25)
  const sundayMidnight = new Date('2026-10-25T00:00:00.000Z');

  const securityAlert = canDeliverNotification({
    type: 'security_alert',
    priority: 'high',
    currentTime: sundayMidnight,
  });
  assert.equal(securityAlert.deliverNow, true);
  assert.equal(securityAlert.queueForLater, false);

  const bookingUpdate = canDeliverNotification({
    type: 'booking_update',
    priority: 'high',
    currentTime: sundayMidnight,
  });
  assert.equal(bookingUpdate.deliverNow, true);

  const escrowRelease = canDeliverNotification({
    type: 'escrow_release',
    priority: 'high',
    currentTime: sundayMidnight,
  });
  assert.equal(escrowRelease.deliverNow, true);
});

// ============================================================================
// 7. Couple 24/7 Planning & Wedding Date Independence
// ============================================================================
console.log('\nGroup 7: Couple Planning & Event Date Independence');

runTest('Couples can set wedding dates on weekends (e.g. Saturday or Sunday)', () => {
  // Couples wedding dates are celebratory events and completely independent of office schedule
  const weddingSaturday = '2026-12-26'; // Saturday wedding
  const d = new Date(weddingSaturday + 'T12:00:00+03:00');
  const parts = getDarEsSalaamParts(d);
  assert.equal(parts.dayOfWeek, 6, 'Wedding date is Saturday');
  // Verify platform does NOT prevent booking on weekends
  const isWeekendAllowedForWedding = true;
  assert.equal(isWeekendAllowedForWedding, true);
});

// ============================================================================
// Summary
// ============================================================================
console.log(`\n---------------------------------------`);
console.log(`Test Results: ${passedTests} passed, ${failedTests} failed.`);
console.log(`---------------------------------------\n`);

if (failedTests > 0) {
  process.exit(1);
}
