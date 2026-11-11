// src/components/AppointmentModal.jsx
// Appointment and Meeting Scheduling Modal with Server-Side Business Hours Validation
// Configured for Africa/Dar_es_Salaam timezone

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { api } from '../services/api';
import {
  darEsSalaamToUTC,
  getEffectiveVendorSchedule,
  formatDarEsSalaamTime,
  DEFAULT_OPERATING_SCHEDULE,
  getTodayDarEsSalaam,
  getDarEsSalaamParts,
} from '../services/businessSchedule';
import { Calendar, Clock, X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import GlassDatePicker from './ui/GlassDatePicker';
import { useBodyScrollLock } from '../lib/overlayLock';

export default function AppointmentModal({ provider, onClose, onSuccess }) {
  const { user, wedding, t, language, isLoggedIn, openAuthPrompt } = useAppContext();
  useBodyScrollLock(true, onClose);

  const todayStr = getTodayDarEsSalaam();
  // Tomorrow in Africa/Dar_es_Salaam as default date
  const defaultDateStr = (() => {
    const parts = getDarEsSalaamParts(new Date());
    const next = new Date(parts.year, parts.month - 1, parts.day + 1);
    return getDarEsSalaamParts(next).dateStr;
  })();

  const [title, setTitle] = useState(() => {
    if (language === 'sw') {
      return provider.category === 'catering'
        ? 'Kuonja Chakula & Kuchagua Menyu'
        : provider.category === 'kumbi'
        ? 'Kukagua Ukumbi & Ubora wa Sauti'
        : provider.category === 'wapambaji'
        ? 'Ushauri wa Mapambo & Rangi'
        : `Kikao cha Ushauri na ${provider.name}`;
    }
    return provider.category === 'catering'
      ? 'Food Tasting & Menu Selection'
      : provider.category === 'kumbi'
      ? 'Hall Walkthrough & Acoustics Check'
      : provider.category === 'wapambaji'
      ? 'Decor & Color Theme Consultation'
      : `Consultation with ${provider.name}`;
  });
  const [dateStr, setDateStr] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [notes, setNotes] = useState('');
  const [allowException, setAllowException] = useState(false);
  const [exceptionReason, setExceptionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successApp, setSuccessApp] = useState(null);

  const vendorSchedule = getEffectiveVendorSchedule(provider);

  const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNamesSw = ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onClose();
      openAuthPrompt();
      return;
    }
    setError(null);

    // Validate that the appointment date is not in the past
    if (dateStr < todayStr) {
      setError(language === 'sw' ? 'Huwezi kuweka miadi ya tarehe iliyopita.' : 'Cannot schedule an appointment for a past date.');
      return;
    }

    setLoading(true);

    try {
      // Convert Africa/Dar_es_Salaam date and time to ISO UTC string
      const startIso = darEsSalaamToUTC(dateStr, startTime);
      const endIso = darEsSalaamToUTC(dateStr, endTime);

      const res = await api.createAppointment({
        workspaceId: wedding?.id || null,
        vendorId: provider.id,
        title,
        startIso,
        endIso,
        allowException,
        exceptionReason: allowException ? exceptionReason : '',
        notes
      });

      setSuccessApp(res.appointment);
      if (onSuccess) onSuccess(res.appointment);
    } catch (err) {
      console.error('Appointment booking error:', err);
      setError(err.message || 'Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }} onClick={onClose}>
      <div className="modal-card glass-frosted-optical" style={{
        background: 'var(--slab-bg)',
        backdropFilter: 'var(--slab-blur, blur(28px) saturate(190%))',
        WebkitBackdropFilter: 'var(--slab-blur, blur(28px) saturate(190%))',
        borderRadius: '32px',
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90dvh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        boxShadow: 'var(--slab-shadow)',
        border: 'var(--slab-border, 1px solid rgba(255, 255, 255, 0.35))',
        padding: 'clamp(1.5rem, 4vw, 2.25rem)',
        position: 'relative',
        animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="modal-close-btn"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.2s ease',
          }}
        >
          <X size={18} />
        </button>

        {successApp ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(0, 199, 190, 0.18) 100%)',
              border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: 'inset 0 1.5px 2px #fff, 0 8px 24px rgba(16, 185, 129, 0.25)'
            }}>
              <CheckCircle size={36} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 850, color: 'var(--app-text-primary, #0f172a)', marginBottom: '0.5rem' }}>
              {language === 'sw' ? 'Miadi Imethibitishwa!' : 'Appointment Confirmed!'}
            </h2>
            <p style={{ color: 'var(--app-text-secondary, #475569)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {language === 'sw'
                ? `Miadi yako na ${provider.name} imehifadhiwa kwa mafanikio.`
                : `Your meeting with ${provider.name} has been booked.`}
            </p>

            <div style={{
              background: 'var(--app-surface-secondary, rgba(255, 255, 255, 0.72))',
              border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
              borderRadius: '16px',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              color: 'var(--app-text-primary, #0f172a)',
              boxShadow: 'var(--clay-shadow-tile)'
            }}>
              <div style={{ marginBottom: '0.4rem' }}>
                <strong style={{ color: 'var(--app-text-primary, #0f172a)' }}>{language === 'sw' ? 'Mada:' : 'Topic:'}</strong> {successApp.title}
              </div>
              <div style={{ marginBottom: '0.4rem' }}>
                <strong style={{ color: 'var(--app-text-primary, #0f172a)' }}>{language === 'sw' ? 'Tarehe:' : 'Date:'}</strong> {successApp.darDate}
              </div>
              <div style={{ marginBottom: '0.4rem' }}>
                <strong style={{ color: 'var(--app-text-primary, #0f172a)' }}>{language === 'sw' ? 'Muda:' : 'Time:'}</strong> {successApp.darStartTime} – {successApp.darEndTime} EAT (Africa/Dar_es_Salaam)
              </div>
              {successApp.allowException && (
                <div style={{ color: '#d97706', marginTop: '0.5rem', fontSize: '0.82rem', fontWeight: 700 }}>
                  ⚠️ {language === 'sw' ? 'Ubaguzi Maalum wa Saa za Kazi Umekubaliwa' : 'Explicit Out-of-Hours Exception Granted'}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 800
              }}
            >
              {language === 'sw' ? 'Sawa, Funga' : 'Done'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{
                background: 'rgba(0, 102, 238, 0.12)',
                border: '1px solid rgba(0, 102, 238, 0.22)',
                color: 'var(--color-primary, #0071E3)',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.9)'
              }}>
                Africa/Dar_es_Salaam (EAT)
              </span>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 850, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.35rem' }}>
              {language === 'sw' ? `Weka Miadi na ${provider.name}` : `Schedule Consultation with ${provider.name}`}
            </h2>
            <p className="appointment-modal-sub" style={{ fontSize: '0.88rem', color: 'var(--app-text-secondary, #475569)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              {language === 'sw'
                ? 'Panga muda wa kutembelea ukumbi, kuonja vyakula, au kupanga mandhari ya harusi yako.'
                : 'Book a site inspection, menu tasting, or coordination meeting in Dar es Salaam local time.'}
            </p>

            {/* Operating Hours Info Badge */}
            <div style={{
              background: 'var(--lens-bg)',
              border: 'var(--lens-border, 1px solid rgba(255, 255, 255, 0.35))',
              backdropFilter: 'var(--lens-blur, blur(16px))',
              WebkitBackdropFilter: 'var(--lens-blur, blur(16px))',
              borderRadius: '16px',
              padding: '0.9rem 1.1rem',
              marginBottom: '1.25rem',
              fontSize: '0.84rem',
              color: 'var(--app-text-secondary, #475569)',
              boxShadow: 'var(--lens-highlight)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.25rem' }}>
                <Clock size={15} color="var(--color-primary, #0071E3)" />
                <span>{language === 'sw' ? 'Saa Rasmi za Kazi za Mtoa Huduma' : 'Vendor Operating Schedule'}</span>
              </div>
              <div>
                {vendorSchedule.isVendorCustom ? (
                  <span>
                    {language === 'sw' ? 'Ratiba Maalum:' : 'Custom Schedule:'} {language === 'sw' ? 'Jumatatu–Ijumaa' : 'Mon–Fri'}: {vendorSchedule.weeklyHours[1]?.open} – {vendorSchedule.weeklyHours[1]?.close} EAT
                    {vendorSchedule.weeklyHours[6] && ` • ${language === 'sw' ? 'Jumamosi' : 'Sat'}: ${vendorSchedule.weeklyHours[6].open} – ${vendorSchedule.weeklyHours[6].close}`}
                  </span>
                ) : (
                  <span>
                    {language === 'sw' ? 'Jumatatu – Ijumaa: 8:00 Asubuhi – 11:00 Jioni EAT' : 'Mon – Fri: 8:00 AM – 5:00 PM EAT'} • {language === 'sw' ? 'Jumamosi & Jumapili: Imefungwa' : 'Sat & Sun: Closed'}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 750, color: 'var(--app-text-primary, #0f172a)', marginBottom: '0.35rem' }}>
                  {language === 'sw' ? 'Mada ya Miadi' : 'Meeting Title / Purpose'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="glass-control"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.95rem',
                    borderRadius: '12px',
                    border: 'var(--control-border, 1px solid rgba(255, 255, 255, 0.32))',
                    background: 'var(--app-input-bg, var(--control-bg))',
                    color: 'var(--app-text-primary, #0f172a)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 750, color: 'var(--app-text-primary, #0f172a)', marginBottom: '0.35rem' }}>
                    {language === 'sw' ? 'Tarehe' : 'Date'}
                  </label>
                  <GlassDatePicker
                    value={dateStr}
                    min={todayStr}
                    onChange={setDateStr}
                    ariaLabel={language === 'sw' ? 'Tarehe' : 'Date'}
                    placeholder={language === 'sw' ? 'Chagua tarehe' : 'Pick a date'}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 750, color: 'var(--app-text-primary, #0f172a)', marginBottom: '0.35rem' }}>
                      {language === 'sw' ? 'Kuanzia' : 'Start (EAT)'}
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      required
                      className="glass-control"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.65rem',
                        borderRadius: '12px',
                        border: 'var(--control-border, 1px solid rgba(255, 255, 255, 0.32))',
                        background: 'var(--app-input-bg, var(--control-bg))',
                        color: 'var(--app-text-primary, #0f172a)',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 750, color: 'var(--app-text-primary, #0f172a)', marginBottom: '0.35rem' }}>
                      {language === 'sw' ? 'Hadi' : 'End (EAT)'}
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      required
                      className="glass-control"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.65rem',
                        borderRadius: '12px',
                        border: 'var(--control-border, 1px solid rgba(255, 255, 255, 0.32))',
                        background: 'var(--app-input-bg, var(--control-bg))',
                        color: 'var(--app-text-primary, #0f172a)',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 750, color: 'var(--app-text-primary, #0f172a)', marginBottom: '0.35rem' }}>
                  {language === 'sw' ? 'Maelezo / Maswali kwa Mtoa Huduma' : 'Meeting Notes / Agenda'}
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={language === 'sw' ? 'Mf. Tungependa kuangalia mpangilio wa viti na mfumo wa sauti...' : 'E.g. We want to inspect acoustics, generator backup, and buffet space...'}
                  className="glass-control"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.95rem',
                    borderRadius: '12px',
                    border: 'var(--control-border, 1px solid rgba(255, 255, 255, 0.32))',
                    background: 'var(--app-input-bg, var(--control-bg))',
                    color: 'var(--app-text-primary, #0f172a)',
                    fontSize: '0.88rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Explicit Exception Request Checkbox (Rule 3) */}
              <div className="appointment-exception-box" style={{
                background: 'rgba(245, 158, 11, 0.10)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(245, 158, 11, 0.32)',
                color: 'var(--app-warning-text, #B45309)',
                borderRadius: '14px',
                padding: '0.85rem 1rem',
                marginBottom: '1.35rem',
                boxShadow: 'inset 0 1px 1.5px rgba(255, 255, 255, 0.35), 0 4px 14px rgba(245, 158, 11, 0.08)'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 750, color: 'inherit' }}>
                  <input
                    type="checkbox"
                    checked={allowException}
                    onChange={e => setAllowException(e.target.checked)}
                    style={{ accentColor: 'var(--color-primary, #0071E3)' }}
                  />
                  <span>
                    {language === 'sw'
                      ? 'Omba ubaguzi maalum nje ya saa za kazi (kwa idhini ya mtoa huduma)'
                      : 'Request off-hours exception (requires explicit vendor approval)'}
                  </span>
                </label>
                {allowException && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder={language === 'sw' ? 'Sababu ya ubaguzi wa saa za kazi...' : 'Reason for off-hours appointment (e.g. evening flight, emergency tasting)...'}
                      value={exceptionReason}
                      onChange={e => setExceptionReason(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '10px',
                        border: '1px solid var(--app-border, rgba(245, 158, 11, 0.4))',
                        background: 'var(--app-input-bg, #ffffff)',
                        color: 'var(--app-text-primary, #0f172a)',
                        fontSize: '0.82rem'
                      }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-liquid-white"
                  style={{
                    padding: '0.75rem 1.35rem',
                    color: 'var(--app-text-primary, #0f172a)',
                    fontWeight: 750
                  }}
                >
                  {language === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    padding: '0.75rem 1.85rem',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading
                    ? (language === 'sw' ? 'Inathibitisha...' : 'Verifying...')
                    : (language === 'sw' ? 'Thibitisha Miadi' : 'Confirm Appointment')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
