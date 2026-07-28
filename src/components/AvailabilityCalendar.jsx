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
      borderRadius: 'var(--radius)',
      padding: '1.25rem',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid #EAE7E1'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--color-dark)' }}>
          <CalendarIcon size={18} color="var(--color-primary)" />
          <span>{monthNames[month]} {year}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={handlePrevMonth}
            style={{ padding: '0.4rem 0.6rem', background: '#F4F2EE', color: '#333', borderRadius: '0.375rem' }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNextMonth}
            style={{ padding: '0.4rem 0.6rem', background: '#F4F2EE', color: '#333', borderRadius: '0.375rem' }}
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
        fontWeight: 600,
        fontSize: '0.75rem',
        color: '#777',
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

          let bg = '#FAF9F6';
          let border = '1px solid #E5E0D8';
          let textColor = '#212121';
          let cursor = 'pointer';

          if (isUnavailable) {
            bg = '#FFEBEE';
            border = '1px solid #FFCDD2';
            textColor = '#C62828';
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
                borderRadius: '0.375rem',
                padding: '0.5rem 0',
                fontSize: '0.85rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: cursor,
                transition: 'all 0.15s ease'
              }}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)' }}></span> Selected
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FAF9F6', border: '1px solid #ccc' }}></span> Available
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFEBEE', border: '1px solid #FFCDD2' }}></span> Booked
        </div>
      </div>
    </div>
  );
}

export default AvailabilityCalendar;
