import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DEFAULT_OPERATING_SCHEDULE, PLATFORM_TIMEZONE } from '../services/businessSchedule';
import { Clock, Calendar, Save, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';

const DAYS_OF_WEEK = [
  { day: 1, label: 'Monday' },
  { day: 2, label: 'Tuesday' },
  { day: 3, label: 'Wednesday' },
  { day: 4, label: 'Thursday' },
  { day: 5, label: 'Friday' },
  { day: 6, label: 'Saturday' },
  { day: 0, label: 'Sunday' },
];

export default function VendorScheduleSettings({ vendorId }) {
  const [schedule, setSchedule] = useState({
    workingDays: [...DEFAULT_OPERATING_SCHEDULE.workingDays],
    workingHours: { ...DEFAULT_OPERATING_SCHEDULE.workingHours },
    specialHours: {},
    daysOff: [],
    holidays: [],
  });

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [newDayOff, setNewDayOff] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [schedRes, apptsRes] = await Promise.all([
          api.getVendorSchedule(vendorId).catch(() => null),
          api.getAppointments({ vendorId }).catch(() => []),
        ]);

        if (isMounted) {
          if (schedRes?.schedule) {
            setSchedule({
              workingDays: schedRes.schedule.workingDays || [1, 2, 3, 4, 5],
              workingHours: schedRes.schedule.workingHours || { open: '08:00', close: '17:00' },
              specialHours: schedRes.schedule.specialHours || {},
              daysOff: schedRes.schedule.daysOff || [],
              holidays: schedRes.schedule.holidays || [],
            });
          }
          if (Array.isArray(apptsRes)) {
            setAppointments(apptsRes);
          }
        }
      } catch (err) {
        console.error('Failed to load vendor schedule:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [vendorId]);

  const handleToggleDay = (dayNum) => {
    setSchedule(prev => {
      const exists = prev.workingDays.includes(dayNum);
      const updated = exists
        ? prev.workingDays.filter(d => d !== dayNum)
        : [...prev.workingDays, dayNum].sort();
      return { ...prev, workingDays: updated };
    });
  };

  const handleTimeChange = (field, val) => {
    setSchedule(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: val,
      },
    }));
  };

  const handleSpecialHourChange = (dayNum, field, val) => {
    setSchedule(prev => {
      const dayKey = String(dayNum);
      const existing = prev.specialHours[dayKey] || { open: '09:00', close: '13:00' };
      return {
        ...prev,
        specialHours: {
          ...prev.specialHours,
          [dayKey]: {
            ...existing,
            [field]: val,
          },
        },
      };
    });
  };

  const handleAddDayOff = (e) => {
    e.preventDefault();
    if (!newDayOff) return;
    if (schedule.daysOff.includes(newDayOff)) return;
    setSchedule(prev => ({
      ...prev,
      daysOff: [...prev.daysOff, newDayOff].sort(),
    }));
    setNewDayOff('');
  };

  const handleRemoveDayOff = (dateStr) => {
    setSchedule(prev => ({
      ...prev,
      daysOff: prev.daysOff.filter(d => d !== dateStr),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await api.updateVendorSchedule(vendorId, schedule);
      setMessage({ type: 'success', text: 'Schedule and consultation hours saved successfully!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save schedule.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateApptStatus = async (apptId, status) => {
    try {
      await api.updateAppointment(apptId, { status });
      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status } : a));
    } catch (err) {
      alert(err.message || 'Failed to update appointment');
    }
  };

  const glassCard = {
    background: '#FFFFFF',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm)',
    padding: '1.5rem',
  };

  if (loading) {
    return <div style={{ ...glassCard, textAlign: 'center', padding: '2rem' }}>Loading schedule settings...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Operating Schedule Form */}
      <div style={glassCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--color-primary)" /> Working Hours & Business Schedule
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              Configure your consultation hours, regular days off, and custom opening times.
            </p>
          </div>

          <div style={{
            fontSize: '0.75rem',
            background: 'var(--color-surface-soft)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-border)',
            fontWeight: 700,
            color: 'var(--color-primary-hover)',
          }}>
            Timezone: {PLATFORM_TIMEZONE} (EAT, UTC+3)
          </div>
        </div>

        {message && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: message.type === 'success' ? 'var(--color-success-bg)' : 'rgba(239, 68, 68, 0.12)',
            color: message.type === 'success' ? 'var(--color-success)' : '#b91c1c',
          }}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        {/* Standard Working Hours */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Standard Working Hours
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
                Default Opening Time
              </label>
              <input
                type="time"
                value={schedule.workingHours.open}
                onChange={e => handleTimeChange('open', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
                Default Closing Time
              </label>
              <input
                type="time"
                value={schedule.workingHours.close}
                onChange={e => handleTimeChange('close', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>
        </div>

        {/* Working Days */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Active Working Days
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {DAYS_OF_WEEK.map(({ day, label }) => {
              const isActive = schedule.workingDays.includes(day);
              const isWeekend = day === 0 || day === 6;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleToggleDay(day)}
                  style={{
                    padding: '0.5rem 0.9rem',
                    borderRadius: 'var(--radius)',
                    border: `1.5px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: isActive ? 'var(--color-primary-light)' : '#FFFFFF',
                    color: isActive ? 'var(--color-primary-hover)' : 'var(--color-text-muted)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'var(--transition)',
                  }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: isActive ? 'var(--color-primary)' : 'var(--color-border)'
                  }} />
                  {label} {isWeekend && <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>(Weekend)</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Special Hours for Open Weekend Days */}
        {schedule.workingDays.includes(6) && (
          <div style={{
            background: 'var(--color-surface-soft)',
            padding: '1rem',
            borderRadius: 'var(--radius)',
            marginBottom: '1.5rem',
            border: '1px solid var(--color-border)'
          }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
              Special Saturday Hours
            </h4>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>From:</span>
                <input
                  type="time"
                  value={schedule.specialHours?.['6']?.open || '09:00'}
                  onChange={e => handleSpecialHourChange(6, 'open', e.target.value)}
                  style={{ padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>To:</span>
                <input
                  type="time"
                  value={schedule.specialHours?.['6']?.close || '13:00'}
                  onChange={e => handleSpecialHourChange(6, 'close', e.target.value)}
                  style={{ padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Custom Days Off / Vacation */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Specific Days Off & Holidays
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
            Appointments cannot be booked on these dates unless the couple requests an explicit exception.
          </p>

          <form onSubmit={handleAddDayOff} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', maxWidth: 360 }}>
            <input
              type="date"
              value={newDayOff}
              onChange={e => setNewDayOff(e.target.value)}
              style={{
                flex: 1,
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
              }}
            />
            <button
              type="submit"
              disabled={!newDayOff}
              style={{
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius)',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Plus size={14} /> Add Day Off
            </button>
          </form>

          {schedule.daysOff.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {schedule.daysOff.map(dateStr => (
                <span
                  key={dateStr}
                  style={{
                    background: 'var(--color-surface-soft)',
                    border: '1px solid var(--color-border)',
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Calendar size={13} color="var(--color-primary)" /> {dateStr}
                  <button
                    type="button"
                    onClick={() => handleRemoveDayOff(dateStr)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-error)' }}
                    title="Remove"
                  >
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>No specific days off scheduled.</div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.9rem',
              padding: '0.65rem 1.5rem',
              borderRadius: 'var(--radius-pill)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: 'var(--shadow-glow)',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Business Schedule'}
          </button>
        </div>
      </div>

      {/* Appointments Management */}
      <div style={glassCard}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text)', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} color="var(--color-primary)" /> Client Consultations & Tasting Meetings ({appointments.length})
        </h2>

        {appointments.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            No appointments scheduled yet. When couples book a consultation or tasting meeting within your working hours, they will appear here.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {appointments.map(appt => (
              <div
                key={appt.id}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                  background: 'var(--color-surface-soft)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                      {appt.title || 'Client Consultation'}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-pill)',
                      textTransform: 'uppercase',
                      background: appt.status === 'confirmed' ? 'var(--color-success-bg)' : appt.status === 'cancelled' ? 'rgba(239, 68, 68, 0.12)' : 'var(--color-warning-bg)',
                      color: appt.status === 'confirmed' ? 'var(--color-success)' : appt.status === 'cancelled' ? '#b91c1c' : 'var(--color-warning)',
                    }}>
                      {appt.status}
                    </span>
                    {appt.allowException && (
                      <span style={{ fontSize: '0.7rem', background: '#fef08a', color: '#854d0e', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-pill)', fontWeight: 700 }}>
                        Special Exception
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    📅 <strong>{appt.formattedTime || `${appt.date} at ${appt.startTime}`}</strong> • Type: {appt.type}
                  </div>
                  {appt.notes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text)', marginTop: '0.3rem', fontStyle: 'italic' }}>
                      "{appt.notes}"
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {appt.status !== 'confirmed' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateApptStatus(appt.id, 'confirmed')}
                      style={{
                        background: 'var(--color-success)',
                        color: '#FFFFFF',
                        fontSize: '0.8rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-pill)',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      Confirm
                    </button>
                  )}
                  {appt.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateApptStatus(appt.id, 'cancelled')}
                      style={{
                        background: 'var(--color-error)',
                        color: '#FFFFFF',
                        fontSize: '0.8rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-pill)',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
