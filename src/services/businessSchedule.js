// src/services/businessSchedule.js
// MY DAY Platform Business Operating Schedule & Timezone Engine
// Configured for Africa/Dar_es_Salaam (EAT, UTC+3)

export const PLATFORM_TIMEZONE = 'Africa/Dar_es_Salaam';

export const TANZANIA_NATIONAL_HOLIDAYS_2026 = [
  '2026-01-01', // New Year's Day
  '2026-01-12', // Zanzibar Revolution Day
  '2026-04-07', // Karume Day
  '2026-04-26', // Union Day
  '2026-05-01', // Worker's Day
  '2026-07-07', // Saba Saba (Dar es Salaam Int'l Trade Fair)
  '2026-08-08', // Nane Nane (Farmers' Day)
  '2026-10-14', // Nyerere Day
  '2026-12-09', // Independence Day
  '2026-12-25', // Christmas Day
  '2026-12-26', // Boxing Day
];

export const DEFAULT_OPERATING_SCHEDULE = {
  timezone: PLATFORM_TIMEZONE,
  openingTime: '08:00', // 8:00 AM EAT
  closingTime: '17:00', // 5:00 PM EAT
  workingHours: { open: '08:00', close: '17:00' },
  workingDays: [1, 2, 3, 4, 5], // Monday through Friday (1=Mon, 5=Fri)
  daysOff: [0, 6], // Saturday (6) and Sunday (0) closed by default
  weeklyHours: {
    0: null, // Sunday: Closed
    1: { open: '08:00', close: '17:00' }, // Monday
    2: { open: '08:00', close: '17:00' }, // Tuesday
    3: { open: '08:00', close: '17:00' }, // Wednesday
    4: { open: '08:00', close: '17:00' }, // Thursday
    5: { open: '08:00', close: '17:00' }, // Friday
    6: null, // Saturday: Closed
  },
  holidays: TANZANIA_NATIONAL_HOLIDAYS_2026,
  notificationHours: {
    start: '08:00',
    end: '17:00',
    enabledDays: [1, 2, 3, 4, 5],
  },
};

export const NOTIFICATION_CRITICALITY = {
  // Critical / essential types: delivered 24/7 without business-hour restrictions
  security_alert: 'essential',
  booking_update: 'essential',
  escrow_release: 'essential',
  payment_confirmed: 'essential',
  auth_event: 'essential',
  critical_alert: 'essential',

  // Routine business types: must respect business notification hours (Mon-Fri 8am-5pm)
  task_assigned: 'routine',
  task_reminder: 'routine',
  general_update: 'routine',
  marketing_digest: 'routine',
  meeting_reminder: 'routine',
  routine_business: 'routine',
};

/**
 * Converts HH:mm time string into minutes since midnight (0 to 1439).
 */
export function parseTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Formats total minutes since midnight back into HH:mm.
 */
export function formatMinutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Extracts date & time components specifically in Africa/Dar_es_Salaam timezone.
 */
export function getDarEsSalaamParts(dateOrIso) {
  const d = dateOrIso instanceof Date ? dateOrIso : new Date(dateOrIso);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date provided to getDarEsSalaamParts: ${dateOrIso}`);
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: PLATFORM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'short',
  });

  const parts = formatter.formatToParts(d);
  const map = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }

  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayOfWeek = weekdayMap[map.weekday];
  const year = parseInt(map.year, 10);
  const month = parseInt(map.month, 10);
  const day = parseInt(map.day, 10);
  const hour = parseInt(map.hour === '24' ? '00' : map.hour, 10);
  const minute = parseInt(map.minute, 10);
  const second = parseInt(map.second, 10);

  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const timeMinutes = hour * 60 + minute;

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    dayOfWeek, // 0 = Sun, 1 = Mon, ..., 6 = Sat
    dateStr,   // YYYY-MM-DD in Dar es Salaam
    timeStr,   // HH:mm in Dar es Salaam
    timeMinutes,
  };
}

/**
 * Converts a Dar es Salaam local date and time string into a standard UTC ISO 8601 string.
 * Africa/Dar_es_Salaam is UTC+3 continuous year-round (no DST).
 */
export function darEsSalaamToUTC(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = (timeStr || '00:00').split(':').map(Number);

  // Explicit +03:00 offset ensures exact UTC conversion regardless of host system timezone
  const isoLocal = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00+03:00`;
  const dateObj = new Date(isoLocal);
  return dateObj.toISOString();
}

/**
 * Checks if a given timestamp falls within an operating schedule.
 */
export function isWithinSchedule(isoStringOrDate, schedule = DEFAULT_OPERATING_SCHEDULE) {
  const parts = getDarEsSalaamParts(isoStringOrDate);
  const sched = schedule || DEFAULT_OPERATING_SCHEDULE;

  // 1. Check special hours / single-day overrides
  let special = null;
  if (Array.isArray(sched.specialHours)) {
    special = sched.specialHours.find(s => s.date === parts.dateStr || s.dayOfWeek === parts.dayOfWeek);
  } else if (sched.specialHours && typeof sched.specialHours === 'object') {
    special = sched.specialHours[parts.dateStr] || sched.specialHours[String(parts.dayOfWeek)];
  }

  if (special) {
    if (special.closed) {
      return { isOpen: false, reason: 'special_closure', details: special.reason || 'Closed' };
    }
    const openMin = parseTime(special.open);
    const closeMin = parseTime(special.close);
    const inRange = parts.timeMinutes >= openMin && parts.timeMinutes < closeMin;
    return {
      isOpen: inRange,
      reason: inRange ? 'open_special' : (parts.timeMinutes < openMin ? 'before_opening' : 'after_closing'),
      openTime: special.open,
      closeTime: special.close,
    };
  }

  // 2. Check public holidays
  if (sched.holidays?.includes(parts.dateStr)) {
    return { isOpen: false, reason: 'holiday', details: 'Public / National Holiday' };
  }

  // 3. Check days off / closed days
  if (sched.daysOff?.includes(parts.dayOfWeek) || sched.daysOff?.includes(parts.dateStr)) {
    return { isOpen: false, reason: 'day_off', details: 'Weekend / Day Off' };
  }

  // 4. Check weekly hours for this day of week
  const dayHours = sched.weeklyHours ? sched.weeklyHours[parts.dayOfWeek] : null;
  if (!dayHours || !dayHours.open || !dayHours.close) {
    return { isOpen: false, reason: 'day_off', details: 'Closed on this day' };
  }

  const openMin = parseTime(dayHours.open);
  const closeMin = parseTime(dayHours.close);

  if (parts.timeMinutes < openMin) {
    return { isOpen: false, reason: 'before_opening', openTime: dayHours.open, closeTime: dayHours.close };
  }
  if (parts.timeMinutes >= closeMin) {
    return { isOpen: false, reason: 'after_closing', openTime: dayHours.open, closeTime: dayHours.close };
  }

  return {
    isOpen: true,
    reason: 'open',
    openTime: dayHours.open,
    closeTime: dayHours.close,
  };
}

/**
 * Returns current office status for MY DAY HQ or a given schedule.
 */
export function getCurrentOfficeStatus(now = new Date(), schedule = DEFAULT_OPERATING_SCHEDULE) {
  const parts = getDarEsSalaamParts(now);
  const check = isWithinSchedule(now, schedule);
  const nextWindow = calculateNextBusinessWindow(now, schedule);

  const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNamesEn[parts.dayOfWeek];

  return {
    isOpen: check.isOpen,
    reason: check.reason,
    currentTimeDar: `${parts.timeStr} EAT (${dayName})`,
    currentDateDar: parts.dateStr,
    nextOpeningIso: nextWindow,
    nextOpeningDar: formatDarEsSalaamDateTime(nextWindow),
    timezone: PLATFORM_TIMEZONE,
  };
}

/**
 * Returns the effective schedule for a vendor.
 * Vendors can configure their own hours, holidays, and special opening hours (Rule 2).
 */
export function getEffectiveVendorSchedule(vendor) {
  if (!vendor || !vendor.schedule || vendor.schedule.useDefault === true) {
    return {
      ...DEFAULT_OPERATING_SCHEDULE,
      isVendorCustom: false,
    };
  }

  const vs = vendor.schedule;
  const openingTime = vs.openingTime || vs.workingHours?.open || DEFAULT_OPERATING_SCHEDULE.openingTime;
  const closingTime = vs.closingTime || vs.workingHours?.close || DEFAULT_OPERATING_SCHEDULE.closingTime;
  const workingDays = vs.workingDays || DEFAULT_OPERATING_SCHEDULE.workingDays;

  // Compute daysOff if not explicitly given
  const daysOff = vs.daysOff !== undefined
    ? vs.daysOff
    : [0, 1, 2, 3, 4, 5, 6].filter(d => !workingDays.includes(d));

  // Compute weeklyHours
  const weeklyHours = { ...DEFAULT_OPERATING_SCHEDULE.weeklyHours, ...(vs.weeklyHours || {}) };
  for (let d = 0; d <= 6; d++) {
    if (workingDays.includes(d)) {
      if (!weeklyHours[d]) {
        weeklyHours[d] = { open: openingTime, close: closingTime };
      }
    } else {
      weeklyHours[d] = null;
    }
  }

  return {
    timezone: vs.timezone || PLATFORM_TIMEZONE,
    openingTime,
    closingTime,
    workingHours: { open: openingTime, close: closingTime },
    workingDays,
    daysOff,
    weeklyHours,
    holidays: vs.holidays !== undefined ? vs.holidays : DEFAULT_OPERATING_SCHEDULE.holidays,
    specialHours: vs.specialHours || {},
    notificationHours: vs.notificationHours || DEFAULT_OPERATING_SCHEDULE.notificationHours,
    isVendorCustom: true,
  };
}

/**
 * Server & Client appointment slot validator (Rules 3 & 6).
 * Enforces that appointments must fall within the relevant participant's availability
 * unless an explicit exception is granted.
 */
export function validateAppointmentSlot({
  vendorSchedule,
  schedule,
  startIso,
  endIso,
  dateStr,
  startTimeStr,
  endTimeStr,
  allowException = false,
  exceptionReason = '',
  existingAppointments = [],
  appointmentIdToExclude = null,
}) {
  const activeSched = vendorSchedule || schedule || DEFAULT_OPERATING_SCHEDULE;

  let resolvedStartIso = startIso;
  let resolvedEndIso = endIso;

  if (!resolvedStartIso && dateStr && startTimeStr) {
    resolvedStartIso = darEsSalaamToUTC(dateStr, startTimeStr);
  }
  if (!resolvedEndIso && dateStr && endTimeStr) {
    resolvedEndIso = darEsSalaamToUTC(dateStr, endTimeStr);
  }

  const start = new Date(resolvedStartIso);
  const end = new Date(resolvedEndIso);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid start or end timestamp' };
  }

  if (start >= end) {
    return { valid: false, error: 'Appointment end time must be strictly after start time' };
  }

  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  if (durationMinutes < 15) {
    return { valid: false, error: 'Appointment duration must be at least 15 minutes' };
  }
  if (durationMinutes > 480) {
    return { valid: false, error: 'Appointment duration cannot exceed 8 hours' };
  }

  const startParts = getDarEsSalaamParts(start);
  const endParts = getDarEsSalaamParts(end);

  // Appointments must start and finish within the same day
  if (startParts.dateStr !== endParts.dateStr) {
    return { valid: false, error: 'Appointments must start and end on the same calendar day' };
  }

  // Conflict / double-booking check
  const conflicting = existingAppointments.find(app => {
    if (appointmentIdToExclude && app.id === appointmentIdToExclude) return false;
    if (app.status === 'cancelled') return false;
    const appStart = new Date(app.startIso || darEsSalaamToUTC(app.date, app.startTime)).getTime();
    const appEnd = new Date(app.endIso || darEsSalaamToUTC(app.date, app.endTime)).getTime();
    return Math.max(start.getTime(), appStart) < Math.min(end.getTime(), appEnd);
  });

  if (conflicting && !allowException) {
    const conflictParts = getDarEsSalaamParts(conflicting.startIso || darEsSalaamToUTC(conflicting.date, conflicting.startTime));
    const conflictEndParts = getDarEsSalaamParts(conflicting.endIso || darEsSalaamToUTC(conflicting.date, conflicting.endTime));
    return {
      valid: false,
      error: `conflicts with another scheduled appointment: "${conflicting.title || 'Existing Appointment'}" (${conflictParts.timeStr} - ${conflictEndParts.timeStr} EAT)`,
      conflictId: conflicting.id,
    };
  }

  // If explicit exception is granted, bypass operating hours check (Rule 3)
  if (allowException) {
    return {
      valid: true,
      isException: true,
      hasException: true,
      exceptionReason: exceptionReason || 'Requested slot is outside standard business schedule with approved explicit exception',
      darDate: startParts.dateStr,
      darStartTime: startParts.timeStr,
      darEndTime: endParts.timeStr,
    };
  }

  // Check schedule availability
  // Check holiday
  if (activeSched.holidays?.includes(startParts.dateStr)) {
    return {
      valid: false,
      error: `Cannot schedule appointment on holiday (${startParts.dateStr}) without an explicit exception`,
    };
  }

  // Check days off
  if (activeSched.daysOff?.includes(startParts.dayOfWeek) || activeSched.daysOff?.includes(startParts.dateStr)) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      valid: false,
      error: `Cannot schedule appointment on ${dayNames[startParts.dayOfWeek]} (not an active working day / day off)`,
    };
  }

  // Check special hours or weekly hours
  let openMin, closeMin;
  let specialOverride = null;
  if (Array.isArray(activeSched.specialHours)) {
    specialOverride = activeSched.specialHours.find(s => s.date === startParts.dateStr || s.dayOfWeek === startParts.dayOfWeek);
  } else if (activeSched.specialHours && typeof activeSched.specialHours === 'object') {
    specialOverride = activeSched.specialHours[startParts.dateStr] || activeSched.specialHours[String(startParts.dayOfWeek)];
  }

  if (specialOverride) {
    if (specialOverride.closed) {
      return {
        valid: false,
        error: `Vendor is closed on ${startParts.dateStr} (${specialOverride.reason || 'Special closure'})`,
      };
    }
    openMin = parseTime(specialOverride.open);
    closeMin = parseTime(specialOverride.close);
  } else {
    // Normal weekly hours
    const dayHours = activeSched.weeklyHours ? activeSched.weeklyHours[startParts.dayOfWeek] : null;
    if (!dayHours) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return {
        valid: false,
        error: `Cannot schedule appointment on ${dayNames[startParts.dayOfWeek]} (Vendor is closed / day off)`,
      };
    }
    openMin = parseTime(dayHours.open);
    closeMin = parseTime(dayHours.close);
  }

  if (startParts.timeMinutes < openMin) {
    return {
      valid: false,
      error: `outside working hours: start time (${startParts.timeStr} EAT) is before opening time (${formatMinutesToTime(openMin)} EAT)`,
    };
  }

  if (endParts.timeMinutes > closeMin) {
    return {
      valid: false,
      error: `outside working hours: end time (${endParts.timeStr} EAT) exceeds closing time (${formatMinutesToTime(closeMin)} EAT)`,
    };
  }

  return {
    valid: true,
    isException: false,
    hasException: false,
    darDate: startParts.dateStr,
    darStartTime: startParts.timeStr,
    darEndTime: endParts.timeStr,
  };
}

/**
 * Calculates the next business window in UTC ISO format.
 */
export function calculateNextBusinessWindow(fromTimestamp = new Date(), schedule = DEFAULT_OPERATING_SCHEDULE) {
  const parts = getDarEsSalaamParts(fromTimestamp);
  const sched = schedule || DEFAULT_OPERATING_SCHEDULE;
  const notifHours = sched.notificationHours || DEFAULT_OPERATING_SCHEDULE.notificationHours;

  const startMin = parseTime(notifHours.start);
  const enabledDays = notifHours.enabledDays || [1, 2, 3, 4, 5];

  // Check if today is an enabled day and we are currently before start time
  if (enabledDays.includes(parts.dayOfWeek) && parts.timeMinutes < startMin && !sched.holidays?.includes(parts.dateStr)) {
    return darEsSalaamToUTC(parts.dateStr, notifHours.start);
  }

  // Iterate forward day by day up to 14 days
  let testDate = new Date(fromTimestamp);
  for (let i = 1; i <= 14; i++) {
    testDate = new Date(testDate.getTime() + 24 * 60 * 60 * 1000);
    const testParts = getDarEsSalaamParts(testDate);

    if (enabledDays.includes(testParts.dayOfWeek) && !sched.holidays?.includes(testParts.dateStr)) {
      return darEsSalaamToUTC(testParts.dateStr, notifHours.start);
    }
  }

  // Fallback: 24h later at opening
  return darEsSalaamToUTC(parts.dateStr, notifHours.start);
}

/**
 * Evaluates whether a notification can be delivered right now (Rule 4).
 * Security alerts & essential booking updates delivered immediately (24/7).
 * Routine business notifications queued for next business opening window.
 */
export function canDeliverNotification(typeOrOptions, timestamp = new Date(), schedule = DEFAULT_OPERATING_SCHEDULE) {
  let type = typeOrOptions;
  let targetTime = timestamp;
  let sched = schedule;

  if (typeof typeOrOptions === 'object' && typeOrOptions !== null) {
    type = typeOrOptions.type;
    targetTime = typeOrOptions.currentTime || typeOrOptions.timestamp || timestamp;
    sched = typeOrOptions.schedule || schedule;
  }

  const criticality = NOTIFICATION_CRITICALITY[type] || 'routine';
  if (criticality === 'essential') {
    return {
      canDeliver: true,
      deliverNow: true,
      immediate: true,
      queueForLater: false,
      reason: 'essential_notification',
      scheduledFor: null,
    };
  }

  // Routine notification check
  const parts = getDarEsSalaamParts(targetTime);
  const notifHours = sched.notificationHours || DEFAULT_OPERATING_SCHEDULE.notificationHours;

  const isEnabledDay = notifHours.enabledDays.includes(parts.dayOfWeek);
  const isHoliday = sched.holidays?.includes(parts.dateStr);
  const startMin = parseTime(notifHours.start);
  const endMin = parseTime(notifHours.end);
  const isWithinHours = parts.timeMinutes >= startMin && parts.timeMinutes < endMin;

  if (isEnabledDay && !isHoliday && isWithinHours) {
    return {
      canDeliver: true,
      deliverNow: true,
      immediate: true,
      queueForLater: false,
      reason: 'within_business_hours',
      scheduledFor: null,
    };
  }

  const nextWindow = calculateNextBusinessWindow(targetTime, sched);
  return {
    canDeliver: false,
    deliverNow: false,
    immediate: false,
    queueForLater: true,
    reason: isHoliday ? 'public_holiday' : (!isEnabledDay ? 'outside_business_days' : 'outside_business_hours'),
    scheduledFor: nextWindow,
  };
}

/**
 * Rule 5: Couples 24/7 Wedding Planning Guarantee.
 * Couples can plan weddings, set wedding dates on weekends, browse vendors, and manage budgets 24/7.
 */
export function isPlatformPlanningRestricted() {
  return false;
}

/**
 * Formatting helpers for displaying timestamps in Africa/Dar_es_Salaam.
 */
export function formatDarEsSalaamDateTime(isoString, lang = 'en') {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;

  const options = {
    timeZone: PLATFORM_TIMEZONE,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };

  const locale = lang === 'sw' ? 'sw-TZ' : 'en-US';
  try {
    return `${new Intl.DateTimeFormat(locale, options).format(d)} EAT`;
  } catch {
    return `${new Intl.DateTimeFormat('en-US', options).format(d)} EAT`;
  }
}

export function formatDarEsSalaamTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;

  return `${new Intl.DateTimeFormat('en-US', {
    timeZone: PLATFORM_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d)} EAT`;
}

export function formatDarEsSalaamDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;

  return new Intl.DateTimeFormat('en-US', {
    timeZone: PLATFORM_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}
