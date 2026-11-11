import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const WEEKDAYS = {
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  sw: ['Jp', 'Jt', 'Jn', 'Jt', 'Al', 'Ij', 'Jm'],
};
const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  sw: ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
};

const pad = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Glass date picker — the calendar is ours, not the operating system's.
 * Value in / out is an ISO `YYYY-MM-DD` string so it drops into existing forms.
 */
export default function GlassDatePicker({
  value,
  onChange,
  min,
  ariaLabel,
  placeholder,
  id,
}) {
  const { language } = useAppContext();
  const isSw = language === 'sw';
  const ariaLabelText = ariaLabel || (isSw ? 'Chagua tarehe' : 'Choose a date');
  const placeholderText = placeholder || (isSw ? 'Chagua tarehe' : 'Select a date');
  const listId = useId();
  const buttonId = id || `${listId}-button`;
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const gridRef = useRef(null);

  const selected = useMemo(() => fromISO(value), [value]);
  const minDate = useMemo(() => fromISO(min) || null, [min]);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const base = selected || minDate || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [active, setActive] = useState(() => selected || minDate || new Date());

  const close = useCallback((focusBack = true) => {
    setOpen(false);
    if (focusBack) buttonRef.current?.focus();
  }, []);

  const openPicker = useCallback(() => {
    const base = selected || minDate || new Date();
    setView(new Date(base.getFullYear(), base.getMonth(), 1));
    setActive(base);
    setOpen(true);
  }, [selected, minDate]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) gridRef.current?.focus();
  }, [open]);

  const isDisabled = (day) => Boolean(minDate && day < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()));

  const pick = (day) => {
    if (isDisabled(day)) return;
    onChange?.(toISO(day));
    close();
  };

  const shiftMonth = (delta) => {
    setView((v) => {
      const next = new Date(v.getFullYear(), v.getMonth() + delta, 1);
      const day = Math.min(active.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate());
      setActive(new Date(next.getFullYear(), next.getMonth(), day));
      return next;
    });
  };

  const moveActive = (deltaDays) => {
    const next = new Date(active.getFullYear(), active.getMonth(), active.getDate() + deltaDays);
    if (minDate && next < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return;
    setActive(next);
    if (next.getMonth() !== view.getMonth() || next.getFullYear() !== view.getFullYear()) {
      setView(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  const onGridKeyDown = (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); moveActive(-1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); moveActive(1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); moveActive(-7); }
    else if (event.key === 'ArrowDown') { event.preventDefault(); moveActive(7); }
    else if (event.key === 'Home') { event.preventDefault(); moveActive(-((active.getDay() + 7) % 7)); }
    else if (event.key === 'End') { event.preventDefault(); moveActive(6 - active.getDay()); }
    else if (event.key === 'PageUp') { event.preventDefault(); shiftMonth(-1); }
    else if (event.key === 'PageDown') { event.preventDefault(); shiftMonth(1); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); pick(active); }
    else if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.key === 'Tab') { setOpen(false); }
  };

  // six weeks so the layout never jumps between months
  const days = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [view]);

  const today = new Date();

  return (
    <div className={`gdp ${open ? 'is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        id={buttonId}
        ref={buttonRef}
        className="gdp__button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => (open ? close() : openPicker())}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (!open) openPicker();
          }
        }}
      >
        <span className={`gdp__value ${selected ? '' : 'is-placeholder'}`}>
          {selected
            ? selected.toLocaleDateString(isSw ? 'sw-TZ' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            : placeholderText}
        </span>
        <svg className="gdp__chevron" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M8 3v4M16 3v4M3 10h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <div className="gdp__panel" id={listId} role="dialog" aria-modal="false" aria-label={ariaLabelText}>
          <div className="gdp__head">
            <button type="button" className="gdp__nav" onClick={() => shiftMonth(-1)} aria-label={isSw ? 'Mwezi uliopita' : 'Previous month'}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span className="gdp__month" aria-live="polite">
              {MONTHS[isSw ? 'sw' : 'en'][view.getMonth()]} {view.getFullYear()}
            </span>
            <button type="button" className="gdp__nav" onClick={() => shiftMonth(1)} aria-label={isSw ? 'Mwezi ujao' : 'Next month'}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><polyline points="9 18 15 12 9 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>

          <div className="gdp__weekdays" aria-hidden="true">
            {WEEKDAYS[isSw ? 'sw' : 'en'].map((d) => <span key={d}>{d}</span>)}
          </div>

          <div className="gdp__grid" ref={gridRef} tabIndex={-1} role="grid" onKeyDown={onGridKeyDown}>
            {days.map((day) => {
              const outside = day.getMonth() !== view.getMonth();
              const disabled = isDisabled(day);
              const isSelected = sameDay(day, selected);
              const isActive = sameDay(day, active);
              const isToday = sameDay(day, today);
              return (
                <button
                  key={toISO(day)}
                  type="button"
                  role="gridcell"
                  tabIndex={-1}
                  disabled={disabled}
                  aria-selected={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                  className={[
                    'gdp__day',
                    outside ? 'is-outside' : '',
                    isSelected ? 'is-selected' : '',
                    isActive ? 'is-active' : '',
                    isToday ? 'is-today' : '',
                  ].join(' ').trim()}
                  onMouseEnter={() => !disabled && setActive(day)}
                  onClick={() => pick(day)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
