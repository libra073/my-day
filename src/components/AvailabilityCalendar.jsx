import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  canNavigatePrevMonth,
  getDarEsSalaamCalendarNow
} from '../services/businessSchedule';
import { useAppContext } from '../context/AppContext';

function AvailabilityCalendar({ unavailableDates = [], selectedDate, onSelectDate }) {
  let language = 'en';
  try {
    const ctx = useAppContext();
    if (ctx?.language) language = ctx.language;
  } catch {
    // Context unavailable in isolated renders/tests
  }

  const [darNow, setDarNow] = useState(() => getDarEsSalaamCalendarNow());

  // Keep today's date accurate if the page remains open across midnight in Dar es Salaam
  useEffect(() => {
    const checkMidnight = () => {
      const latest = getDarEsSalaamCalendarNow();
      setDarNow(prev => {
        if (prev.todayStr !== latest.todayStr) {
          return latest;
        }
        return prev;
      });
    };

    const interval = setInterval(checkMidnight, 30000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') checkMidnight();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const getInitialDate = () => {
    const { year: curY, month: curM, todayStr } = getDarEsSalaamCalendarNow();
    if (selectedDate && typeof selectedDate === 'string' && selectedDate >= todayStr) {
      const [y, m] = selectedDate.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        return new Date(y, m - 1, 1);
      }
    }
    return new Date(curY, curM, 1);
  };

  const [currentDate, setCurrentDate] = useState(getInitialDate);

  const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const startDayOfMonth = (m, y) => new Date(y, m, 1).getDay();

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesSw = [
    'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni',
    'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'
  ];
  const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdaysSw = ['Jpi', 'Jtt', 'Jnn', 'Tnn', 'Alh', 'Ijm', 'Jms'];

  const monthNames = language === 'sw' ? monthNamesSw : monthNamesEn;
  const weekdays = language === 'sw' ? weekdaysSw : weekdaysEn;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const isCurrentMonthOrPast = !canNavigatePrevMonth(year, month);

  const handlePrevMonth = () => {
    if (isCurrentMonthOrPast) return;
    const prevMonth = month - 1;
    const targetYear = prevMonth < 0 ? year - 1 : year;
    const targetMonth = prevMonth < 0 ? 11 : prevMonth;
    // Guard against navigating before current month
    if (!canNavigatePrevMonth(targetYear, targetMonth + 1)) {
      setCurrentDate(new Date(darNow.year, darNow.month, 1));
      return;
    }
    setCurrentDate(new Date(targetYear, targetMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const totalDays = daysInMonth(month, year);
  const startDay = startDayOfMonth(month, year);

  return (
    <div className="avail-calendar" style={{
      background: 'var(--app-card-bg, rgba(255, 255, 255, 0.72))',
      borderRadius: '24px',
      padding: 'clamp(0.75rem, 2.5vw, 1.35rem)',
      boxShadow: 'var(--clay-shadow)',
      border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)' }}>
          <CalendarIcon size={18} color="var(--color-primary, #0071E3)" />
          <span>{monthNames[month]} {year}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isCurrentMonthOrPast}
            aria-disabled={isCurrentMonthOrPast}
            aria-label={language === 'sw' ? 'Mwezi Uliopita' : 'Previous Month'}
            style={{
              padding: '0.4rem 0.65rem',
              background: 'var(--app-surface-elevated, rgba(255, 255, 255, 0.85))',
              color: isCurrentMonthOrPast ? 'var(--app-text-muted, #A8A29E)' : 'var(--app-text-primary, #334155)',
              borderRadius: 'var(--radius-pill)',
              boxShadow: isCurrentMonthOrPast ? 'none' : 'var(--clay-shadow-tile)',
              cursor: isCurrentMonthOrPast ? 'not-allowed' : 'pointer',
              opacity: isCurrentMonthOrPast ? 0.35 : 1,
              border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
              pointerEvents: isCurrentMonthOrPast ? 'none' : 'auto',
              transition: 'all 0.15s ease'
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label={language === 'sw' ? 'Mwezi Ujao' : 'Next Month'}
            style={{
              padding: '0.4rem 0.65rem',
              background: 'var(--app-surface-elevated, rgba(255, 255, 255, 0.85))',
              color: 'var(--app-text-primary, #334155)',
              borderRadius: 'var(--radius-pill)',
              boxShadow: 'var(--clay-shadow-tile)',
              cursor: 'pointer',
              border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
              transition: 'all 0.15s ease'
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="avail-calendar__weekdays" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.25rem',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '0.75rem',
        color: 'var(--color-text-muted)',
        marginBottom: '0.5rem'
      }}>
        {weekdays.map((wd, i) => (
          <div key={i}>{wd}</div>
        ))}
      </div>

      <div className="avail-calendar__grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem' }}>
        {[...Array(startDay)].map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {[...Array(totalDays)].map((_, i) => {
          const dayNum = i + 1;
          const monthStr = String(month + 1).padStart(2, '0');
          const dayStr = String(dayNum).padStart(2, '0');
          const dateISO = `${year}-${monthStr}-${dayStr}`;

          const isPast = dateISO < darNow.todayStr;
          const isToday = dateISO === darNow.todayStr;
          const isUnavailable = unavailableDates.includes(dateISO);
          const isSelected = selectedDate === dateISO;
          const isDisabled = isPast || isUnavailable;

          let bg = 'var(--app-surface-elevated, rgba(255, 255, 255, 0.82))';
          let border = '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))';
          let textColor = 'var(--app-text-primary, #1e293b)';
          let cursor = 'pointer';
          let customShadow = 'var(--clay-shadow-tile)';
          let title = isUnavailable
            ? (language === 'sw' ? 'Imeshachukuliwa' : 'Fully Booked')
            : (language === 'sw' ? 'Inapatikana kwa Uhifadhi' : 'Available for Booking');

          if (isPast) {
            bg = 'rgba(255, 255, 255, 0.04)';
            border = '1px solid var(--app-border, rgba(226, 232, 240, 0.6))';
            textColor = 'var(--app-text-muted, #94a3b8)';
            cursor = 'not-allowed';
            customShadow = 'none';
            title = language === 'sw' ? 'Tarehe iliyopita haichaguliwi' : 'Past date cannot be selected';
          } else if (isUnavailable) {
            bg = 'rgba(254, 226, 226, 0.25)';
            border = '1px solid rgba(252, 165, 165, 0.5)';
            textColor = '#dc2626';
            cursor = 'not-allowed';
            customShadow = 'none';
          } else if (isSelected) {
            bg = 'var(--p3d-grad-primary, linear-gradient(135deg, #0A84FF 0%, #0071E3 55%, #004085 100%))';
            border = '1px solid rgba(255, 255, 255, 0.45)';
            textColor = '#ffffff';
            customShadow = '0 6px 16px rgba(110, 56, 28, 0.45)';
          } else if (isToday) {
            border = '2px solid var(--color-primary, #0071E3)';
            textColor = 'var(--color-primary, #0071E3)';
            bg = 'var(--app-surface-elevated, rgba(255, 255, 255, 0.95))';
            customShadow = '0 0 12px rgba(0, 102, 238, 0.25)';
          }

          return (
            <button
              key={dateISO}
              type="button"
              className={`cal-day ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`.trim()}
              disabled={isDisabled}
              aria-disabled={isDisabled}
              tabIndex={isDisabled ? -1 : 0}
              onClick={() => {
                if (isDisabled) return;
                if (onSelectDate) onSelectDate(dateISO);
              }}
              title={title}
              aria-label={`${dayNum} ${monthNames[month]} ${year}${isToday ? ' (Today)' : ''}${isPast ? ' (Past date)' : isUnavailable ? ' (Fully booked)' : ''}`}
              style={{
                background: bg,
                border: border,
                color: textColor,
                borderRadius: 'var(--radius-pill)',
                padding: '0.5rem 0',
                fontSize: '0.85rem',
                fontWeight: isSelected || isToday ? 800 : 650,
                cursor: cursor,
                boxShadow: customShadow,
                opacity: isPast ? 0.45 : 1,
                transition: 'all 0.15s ease'
              }}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)' }}></span>
          {language === 'sw' ? 'Iliyochaguliwa' : 'Selected'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-surface-soft)', border: '1px solid var(--color-border)' }}></span>
          {language === 'sw' ? 'Inapatikana' : 'Available'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-error-bg)', border: '1px solid #FED7D7' }}></span>
          {language === 'sw' ? 'Imehifadhiwa' : 'Booked'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--app-surface-elevated, #F3F4F6)', border: '1px solid var(--app-border, #D1D5DB)' }}></span>
          {language === 'sw' ? 'Iliyopita' : 'Past Date'}
        </div>
      </div>
    </div>
  );
}

export default AvailabilityCalendar;
