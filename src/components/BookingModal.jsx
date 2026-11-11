import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { X } from 'lucide-react';
import GlassDatePicker from './ui/GlassDatePicker';
import GlassSelect from './ui/GlassSelect';
import { getTodayDarEsSalaam, validateBookingDate } from '../services/businessSchedule';

function BookingModal({ provider, selectedPackage, initialDate, onClose, onSuccess }) {
  const { wedding, createBooking, isLoggedIn, openAuthPrompt, language = 'en' } = useAppContext();
  const todayStr = getTodayDarEsSalaam();

  // Ensure default date is valid and strictly not in the past
  const [date, setDate] = useState(() => {
    if (initialDate && typeof initialDate === 'string' && initialDate >= todayStr) {
      return initialDate;
    }
    if (wedding?.date && typeof wedding.date === 'string' && wedding.date >= todayStr) {
      return wedding.date;
    }
    return '';
  });

  const [guests, setGuests] = useState(wedding?.guests || 300);
  const [notes, setNotes] = useState('');
  const [pkgId, setPkgId] = useState(selectedPackage ? selectedPackage.id : (provider.packages ? provider.packages[0]?.id : ''));
  const [dateError, setDateError] = useState('');

  // Calculate pricing based on category
  let unitPrice = 0;
  let calculationLabel = '';

  if (provider.category === 'kumbi') {
    unitPrice = provider.pricePerDay || 2000000;
    calculationLabel = language === 'sw' ? 'Gharama ya Ukumbi kwa Siku' : 'Venue Day Rate';
  } else if (provider.category === 'catering') {
    const ppp = provider.pricePerPerson || 25000;
    unitPrice = ppp * guests;
    calculationLabel = language === 'sw' ? `Wageni ${guests} × TSh ${ppp.toLocaleString()}/mtu` : `${guests} Guests × TSh ${ppp.toLocaleString()}/person`;
  } else if (provider.category === 'transport') {
    unitPrice = provider.pricePerDay || 500000;
    calculationLabel = language === 'sw' ? 'Kodi ya Magari kwa Siku' : 'Daily Rental Rate';
  } else if (provider.category === 'entertainment') {
    unitPrice = provider.pricePerEvent || 500000;
    calculationLabel = language === 'sw' ? 'Ada ya Burudani ya Sherehe' : 'Event Performance Fee';
  } else if (provider.packages && provider.packages.length) {
    const curPkg = provider.packages.find(p => p.id === pkgId) || provider.packages[0];
    unitPrice = curPkg ? curPkg.price : 500000;
    calculationLabel = curPkg ? curPkg.name : (language === 'sw' ? 'Kifurushi Kilichochaguliwa' : 'Selected Package');
  }

  const depositAmount = Math.round(unitPrice * 0.3);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (!newDate) {
      setDateError(language === 'sw' ? 'Tafadhali chagua tarehe ya uhifadhi.' : 'Please select a booking date.');
      return;
    }
    const validation = validateBookingDate(newDate, language);
    if (!validation.valid) {
      setDateError(validation.error);
    } else {
      setDateError('');
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    // Re-validate date immediately before booking creation
    const validation = validateBookingDate(date, language);
    if (!validation.valid) {
      setDateError(validation.error);
      alert(validation.error);
      return;
    }

    if (provider.unavailableDates && provider.unavailableDates.includes(date)) {
      const busyMsg = language === 'sw'
        ? 'Mtoa huduma huyu tayari amehifadhiwa kwa tarehe iliyochaguliwa. Tafadhali chagua tarehe nyingine.'
        : 'This provider is already booked for the selected date. Please choose another date.';
      alert(busyMsg);
      return;
    }

    if (!isLoggedIn) {
      onClose();
      openAuthPrompt({
        onAuthenticated: () => {
          try {
            const bookingId = createBooking(
              provider.category,
              provider.id,
              pkgId || 'standard',
              unitPrice,
              date,
              depositAmount
            );
            if (onSuccess) {
              onSuccess(bookingId, depositAmount);
            }
          } catch (err) {
            alert(err.message);
          }
        }
      });
      return;
    }

    try {
      const bookingId = createBooking(
        provider.category,
        provider.id,
        pkgId || 'standard',
        unitPrice,
        date,
        depositAmount
      );

      if (onSuccess) {
        onSuccess(bookingId, depositAmount);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const isDateInvalid = Boolean(dateError || !date || date < todayStr);

  return createPortal(
    <div
      className="modal-backdrop motion-modal-backdrop"
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div
        className="modal-card clay-card motion-modal-card"
        style={{
          background: 'var(--clay-cream-2, #ffffff)',
          borderRadius: '36px',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: 'clamp(1.5rem, 4vw, 2.25rem)',
          boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.28), 0 0 40px rgba(0, 102, 238, 0.12)',
          border: '1.5px solid var(--clay-line)',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          className="modal-close-btn"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'var(--app-surface-elevated, rgba(255, 255, 255, 0.85))',
            border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
            color: 'var(--app-text-muted, #64748b)',
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            padding: 0,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--app-text-primary, #0f172a)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--app-text-muted, #64748b)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <X size={18} />
        </button>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--app-text-primary, #0f172a)', fontWeight: 850 }}>
          {language === 'sw' ? `Weka Nafasi: ${provider.name}` : `Reserve ${provider.name}`}
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--app-text-muted, #64748b)', marginBottom: '1.35rem' }}>
          {provider.location} • {language === 'sw' ? 'Kategoria:' : 'Category:'} <strong style={{ textTransform: 'capitalize', color: 'var(--app-text-primary, #0f172a)' }}>{provider.category}</strong>
        </p>

        <form onSubmit={handleBookingSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--app-text-primary, #0f172a)' }}>
              {language === 'sw' ? 'Tarehe ya Harusi / Tukio' : 'Wedding Event Date'}
            </label>
            <GlassDatePicker
              value={date}
              min={todayStr}
              onChange={handleDateChange}
              ariaLabel={language === 'sw' ? 'Tarehe ya Harusi / Tukio' : 'Wedding Event Date'}
              placeholder={language === 'sw' ? 'Chagua tarehe' : 'Select a date'}
            />
            {dateError && (
              <p style={{
                color: 'var(--color-error, #DC2626)',
                fontSize: '0.78rem',
                marginTop: '0.35rem',
                marginBottom: 0,
                fontWeight: 600
              }}>
                {dateError}
              </p>
            )}
          </div>

          {provider.category === 'catering' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--app-text-primary, #0f172a)' }}>
                {language === 'sw' ? 'Idadi ya Wageni Wanaotarajiwa' : 'Estimated Guest Count'}
              </label>
              <input
                type="number"
                min="10"
                max="5000"
                value={guests}
                onChange={e => setGuests(parseInt(e.target.value, 10) || 0)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 0.95rem',
                  borderRadius: '12px',
                  border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
                  background: 'var(--app-surface-elevated, rgba(255, 255, 255, 0.85))',
                  color: 'var(--app-text-primary, #0f172a)',
                  fontSize: '0.92rem'
                }}
              />
            </div>
          )}

          {provider.packages && provider.packages.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--app-text-primary, #0f172a)' }}>
                {language === 'sw' ? 'Chagua Kifurushi' : 'Select Package'}
              </label>
              <GlassSelect
                value={pkgId}
                onChange={setPkgId}
                ariaLabel={language === 'sw' ? 'Chagua Kifurushi' : 'Select Package'}
                options={provider.packages.map((p) => ({
                  value: p.id,
                  label: `${p.name} — TSh ${p.price.toLocaleString()}`,
                }))}
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--app-text-primary, #0f172a)' }}>
              {language === 'sw' ? 'Maelezo Maalum / Maagizo kwa Mtoa Huduma' : 'Special Notes / Instructions for Vendor'}
            </label>
            <textarea
              rows="2"
              placeholder={language === 'sw' ? 'Mfano: Rangi inayopendekezwa, chakula maalum, muda wa kufika...' : 'E.g. Color theme preference, dietary restrictions, arrival time...'}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.95rem',
                borderRadius: '12px',
                border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
                background: 'var(--app-surface-elevated, rgba(255, 255, 255, 0.85))',
                color: 'var(--app-text-primary, #0f172a)',
                fontSize: '0.9rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{
            background: 'var(--app-surface-secondary, rgba(245, 238, 255, 0.72))',
            border: '1.5px solid var(--app-border, rgba(142, 98, 248, 0.2))',
            borderRadius: '20px',
            padding: '1.1rem 1.25rem',
            marginBottom: '1.35rem',
            boxShadow: 'var(--clay-shadow-tile)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--app-text-secondary, #53417D)', marginBottom: '0.35rem' }}>
              <span>{language === 'sw' ? 'Msingi wa Bei:' : 'Rate Basis:'}</span>
              <span style={{ fontWeight: 600, color: 'var(--app-text-primary, #21143D)' }}>{calculationLabel}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: 'var(--app-text-primary, #21143D)', marginBottom: '0.35rem' }}>
              <span>{language === 'sw' ? 'Jumla ya Gharama:' : 'Total Service Cost:'}</span>
              <span style={{ color: 'var(--app-text-primary, #21143D)' }}>TSh {unitPrice.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 850, color: 'var(--color-primary, #0071E3)', paddingTop: '0.45rem', borderTop: '1px dashed var(--app-border, rgba(168, 101, 62, 0.2))' }}>
              <span>{language === 'sw' ? 'Malipo ya Awali ya 30%:' : 'Initial 30% Deposit Required:'}</span>
              <span>TSh {depositAmount.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              disabled={isDateInvalid}
              className="btn-primary btn-sweep"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 800,
                opacity: isDateInvalid ? 0.6 : 1,
                cursor: isDateInvalid ? 'not-allowed' : 'pointer'
              }}
            >
              {language === 'sw' ? 'Hifadhi & Endelea na Malipo' : 'Reserve & Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default BookingModal;
