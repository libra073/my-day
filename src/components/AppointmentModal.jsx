// src/components/AppointmentModal.jsx
// Appointment and Meeting Scheduling Modal with Server-Side Business Hours Validation
// Configured for Africa/Dar_es_Salaam timezone

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { api } from '../services/api';
import {
  darEsSalaamToUTC,
  getEffectiveVendorSchedule,
  formatDarEsSalaamTime,
  DEFAULT_OPERATING_SCHEDULE
} from '../services/businessSchedule';
import { Calendar, Clock, X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function AppointmentModal({ provider, onClose, onSuccess }) {
  const { user, wedding, t, language } = useAppContext();

  // Tomorrow as default date in YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [title, setTitle] = useState(
    provider.category === 'catering'
      ? 'Food Tasting & Menu Selection'
      : provider.category === 'kumbi'
      ? 'Hall Walkthrough & Acoustics Check'
      : provider.category === 'wapambaji'
      ? 'Decor & Color Theme Consultation'
      : `Consultation with ${provider.name}`
  );
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
    setError(null);
    setLoading(true);

    try {
      // Convert Africa/Dar_es_Salaam date and time to ISO UTC string
      const startIso = darEsSalaamToUTC(dateStr, startTime);
      const endIso = darEsSalaamToUTC(dateStr, endTime);

      const res = await api.createAppointment({
        workspaceId: wedding.id || 'wed-1',
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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
        border: '1.5px solid #E8DCCF',
        padding: '2rem',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: '#FAF6F0',
            border: '1px solid #E8DCCF',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#5C4331'
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
              background: 'linear-gradient(135deg, #FFC857 0%, #F5A623 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 8px 24px rgba(245, 166, 35, 0.4)'
            }}>
              <CheckCircle size={36} color="#FFFFFF" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3D2C1F', marginBottom: '0.5rem' }}>
              {language === 'sw' ? 'Miadi Imethibitishwa!' : 'Appointment Confirmed!'}
            </h2>
            <p style={{ color: '#8C705B', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {language === 'sw'
                ? `Miadi yako na ${provider.name} imehifadhiwa kwa mafanikio.`
                : `Your meeting with ${provider.name} has been booked.`}
            </p>

            <div style={{
              background: '#FAF6F0',
              border: '1px solid #E8DCCF',
              borderRadius: '14px',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              <div style={{ marginBottom: '0.4rem' }}>
                <strong>{language === 'sw' ? 'Mada:' : 'Topic:'}</strong> {successApp.title}
              </div>
              <div style={{ marginBottom: '0.4rem' }}>
                <strong>{language === 'sw' ? 'Tarehe:' : 'Date:'}</strong> {successApp.darDate}
              </div>
              <div style={{ marginBottom: '0.4rem' }}>
                <strong>{language === 'sw' ? 'Muda:' : 'Time:'}</strong> {successApp.darStartTime} – {successApp.darEndTime} EAT (Africa/Dar_es_Salaam)
              </div>
              {successApp.allowException && (
                <div style={{ color: '#B86E00', marginTop: '0.5rem', fontSize: '0.82rem', fontWeight: 600 }}>
                  ⚠️ {language === 'sw' ? 'Ubaguzi Maalum wa Saa za Kazi Umekubaliwa' : 'Explicit Out-of-Hours Exception Granted'}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="button"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #F5A623 0%, #D98207 100%)',
                color: '#FFFFFF',
                fontWeight: 700,
                padding: '0.85rem',
                borderRadius: '999px'
              }}
            >
              {language === 'sw' ? 'Sawa, Funga' : 'Done'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{
                background: 'rgba(245, 166, 35, 0.15)',
                color: '#B86E00',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                Africa/Dar_es_Salaam (EAT)
              </span>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#3D2C1F', marginBottom: '0.35rem' }}>
              {language === 'sw' ? `Weka Miadi na ${provider.name}` : `Schedule Consultation with ${provider.name}`}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#8C705B', marginBottom: '1.25rem' }}>
              {language === 'sw'
                ? 'Panga muda wa kutembelea ukumbi, kuonja vyakula, au kupanga mandhari ya harusi yako.'
                : 'Book a site inspection, menu tasting, or coordination meeting in Dar es Salaam local time.'}
            </p>

            {/* Operating Hours Info Badge */}
            <div style={{
              background: '#FAF6F0',
              border: '1px solid #E8DCCF',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              color: '#5C4331'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#3D2C1F', marginBottom: '0.25rem' }}>
                <Clock size={15} color="#B86E00" />
                <span>{language === 'sw' ? 'Saa Rasmi za Kazi za Mtoa Huduma' : 'Vendor Operating Schedule'}</span>
              </div>
              <div>
                {vendorSchedule.isVendorCustom ? (
                  <span>
                    {language === 'sw' ? 'Ratiba Maalum:' : 'Custom Schedule:'} Mon–Fri: {vendorSchedule.weeklyHours[1]?.open} – {vendorSchedule.weeklyHours[1]?.close} EAT
                    {vendorSchedule.weeklyHours[6] && ` • Sat: ${vendorSchedule.weeklyHours[6].open} – ${vendorSchedule.weeklyHours[6].close}`}
                  </span>
                ) : (
                  <span>
                    Mon – Fri: 8:00 AM – 5:00 PM EAT • {language === 'sw' ? 'Jumamosi & Jumapili: Imefungwa' : 'Sat & Sun: Closed'}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D2C1F', marginBottom: '0.35rem' }}>
                  {language === 'sw' ? 'Mada ya Miadi' : 'Meeting Title / Purpose'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #D6C7B8',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D2C1F', marginBottom: '0.35rem' }}>
                    {language === 'sw' ? 'Tarehe' : 'Date'}
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={dateStr}
                    onChange={e => setDateStr(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #D6C7B8',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D2C1F', marginBottom: '0.35rem' }}>
                      {language === 'sw' ? 'Kuanzia' : 'Start (EAT)'}
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.5rem',
                        borderRadius: '10px',
                        border: '1px solid #D6C7B8',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D2C1F', marginBottom: '0.35rem' }}>
                      {language === 'sw' ? 'Hadi' : 'End (EAT)'}
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.5rem',
                        borderRadius: '10px',
                        border: '1px solid #D6C7B8',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D2C1F', marginBottom: '0.35rem' }}>
                  {language === 'sw' ? 'Maelezo / Maswali kwa Mtoa Huduma' : 'Meeting Notes / Agenda'}
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={language === 'sw' ? 'Mf. Tungependa kuangalia mpangilio wa viti na mfumo wa sauti...' : 'E.g. We want to inspect acoustics, generator backup, and buffet space...'}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #D6C7B8',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Explicit Exception Request Checkbox (Rule 3) */}
              <div style={{
                background: '#FFF9ED',
                border: '1px solid #FFE4A0',
                borderRadius: '10px',
                padding: '0.85rem',
                marginBottom: '1.25rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#8C5E00' }}>
                  <input
                    type="checkbox"
                    checked={allowException}
                    onChange={e => setAllowException(e.target.checked)}
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
                        borderRadius: '8px',
                        border: '1px solid #FFE4A0',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '999px',
                    background: '#FAF6F0',
                    border: '1px solid #E8DCCF',
                    color: '#5C4331',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {language === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="button"
                  style={{
                    padding: '0.75rem 1.75rem',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #F5A623 0%, #D98207 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(245, 166, 35, 0.4)'
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
    </div>
  );
}
