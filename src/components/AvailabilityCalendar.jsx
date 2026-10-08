import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

function AvailabilityCalendar({ unavailableDates = [], selectedDate, onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 11, 1)); // Default to Dec 2026

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formattedSelectedDate = selectedDate;

  const totalDays = daysInMonth(month, year);
  const startDay = startDayOfMonth(month, year);

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--color-border)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
          <CalendarIcon size={18} color="var(--color-primary)" />
          <span>{monthNames[month]} {year}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={handlePrevMonth}
            style={{ padding: '0.4rem 0.6rem', background: 'var(--color-surface-soft)', color: 'var(--color-text)', borderRadius: 'var(--radius-pill)', boxShadow: 'none' }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNextMonth}
            style={{ padding: '0.4rem 0.6rem', background: 'var(--color-surface-soft)', color: 'var(--color-text)', borderRadius: 'var(--radius-pill)', boxShadow: 'none' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.25rem',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '0.75rem',
        color: 'var(--color-text-muted)',
        marginBottom: '0.5rem'
      }}>
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem' }}>
        {[...Array(startDay)].map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {[...Array(totalDays)].map((_, i) => {
          const dayNum = i + 1;
          const monthStr = String(month + 1).padStart(2, '0');
          const dayStr = String(dayNum).padStart(2, '0');
          const dateISO = `${year}-${monthStr}-${dayStr}`;

          const isUnavailable = unavailableDates.includes(dateISO);
          const isSelected = formattedSelectedDate === dateISO;

          let bg = 'var(--color-surface-soft)';
          let border = '1px solid var(--color-border)';
          let textColor = 'var(--color-text)';
          let cursor = 'pointer';

          if (isUnavailable) {
            bg = 'var(--color-error-bg)';
            border = '1px solid #FED7D7';
            textColor = 'var(--color-error)';
            cursor = 'not-allowed';
          } else if (isSelected) {
            bg = 'var(--color-primary)';
            border = '1px solid var(--color-primary)';
            textColor = '#ffffff';
          }

          return (
            <button
              key={dateISO}
              disabled={isUnavailable}
              onClick={() => onSelectDate && onSelectDate(dateISO)}
              title={isUnavailable ? 'Fully Booked' : 'Available for Booking'}
              style={{
                background: bg,
                border: border,
                color: textColor,
                borderRadius: 'var(--radius-pill)',
                padding: '0.5rem 0',
                fontSize: '0.85rem',
                fontWeight: isSelected ? 800 : 600,
                cursor: cursor,
                boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)' }}></span> Selected
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-surface-soft)', border: '1px solid var(--color-border)' }}></span> Available
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-error-bg)', border: '1px solid #FED7D7' }}></span> Booked
        </div>
      </div>
    </div>
  );
}

export default AvailabilityCalendar;
