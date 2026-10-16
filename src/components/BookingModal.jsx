import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { X } from 'lucide-react';

function BookingModal({ provider, selectedPackage, onClose, onSuccess }) {
  const { wedding, createBooking } = useAppContext();

  const [date, setDate] = useState(wedding.date || '2026-12-25');
  const [guests, setGuests] = useState(wedding.guests || 300);
  const [notes, setNotes] = useState('');
  const [pkgId, setPkgId] = useState(selectedPackage ? selectedPackage.id : (provider.packages ? provider.packages[0]?.id : ''));

  // Calculate pricing based on category
  let unitPrice = 0;
  let calculationLabel = '';

  if (provider.category === 'kumbi') {
    unitPrice = provider.pricePerDay || 2000000;
    calculationLabel = 'Venue Day Rate';
  } else if (provider.category === 'catering') {
    const ppp = provider.pricePerPerson || 25000;
    unitPrice = ppp * guests;
    calculationLabel = `${guests} Guests × TSh ${ppp.toLocaleString()}/person`;
  } else if (provider.category === 'transport') {
    unitPrice = provider.pricePerDay || 500000;
    calculationLabel = 'Daily Rental Rate';
  } else if (provider.category === 'entertainment') {
    unitPrice = provider.pricePerEvent || 500000;
    calculationLabel = 'Event Performance Fee';
  } else if (provider.packages && provider.packages.length) {
    const curPkg = provider.packages.find(p => p.id === pkgId) || provider.packages[0];
    unitPrice = curPkg ? curPkg.price : 500000;
    calculationLabel = curPkg ? curPkg.name : 'Selected Package';
  }

  const depositAmount = Math.round(unitPrice * 0.3);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!date) {
      alert('Please select a booking date.');
      return;
    }
    if (provider.unavailableDates && provider.unavailableDates.includes(date)) {
      alert('This provider is already booked for the selected date. Please choose another date.');
      return;
    }

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
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(59, 43, 31, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div
        className="modal-card glass-card"
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: 'clamp(1.2rem, 3.5vw, 1.75rem)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'var(--color-surface-soft)',
            color: 'var(--color-text)',
            padding: '0.4rem',
            borderRadius: '50%',
            boxShadow: 'none'
          }}
        >
          <X size={18} />
        </button>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--color-text)', fontWeight: 800 }}>
          Reserve {provider.name}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
          {provider.location} • Category: <strong style={{ textTransform: 'capitalize', color: 'var(--color-text)' }}>{provider.category}</strong>
        </p>

        <form onSubmit={handleBookingSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>
              Wedding Event Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          {provider.category === 'catering' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>
                Estimated Guest Count
              </label>
              <input
                type="number"
                min="10"
                max="5000"
                value={guests}
                onChange={e => setGuests(parseInt(e.target.value) || 0)}
                required
              />
            </div>
          )}

          {provider.packages && provider.packages.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>
                Select Package
              </label>
              <select
                value={pkgId}
                onChange={e => setPkgId(e.target.value)}
              >
                {provider.packages.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — TSh {p.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>
              Special Notes / Instructions for Vendor
            </label>
            <textarea
              rows="2"
              placeholder="E.g. Color theme preference, dietary restrictions, arrival time..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div style={{
            background: 'var(--color-surface-soft)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
              <span>Rate Basis:</span>
              <span style={{ fontWeight: 600 }}>{calculationLabel}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
              <span>Total Service Cost:</span>
              <span style={{ color: 'var(--color-primary-hover)' }}>TSh {unitPrice.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-success)', paddingTop: '0.35rem', borderTop: '1px dashed var(--color-border)' }}>
              <span>Initial 30% Deposit Required:</span>
              <span>TSh {depositAmount.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                background: 'var(--color-primary)',
                color: '#ffffff',
                fontWeight: 700,
                padding: '0.85rem',
                borderRadius: 'var(--radius-pill)',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              Reserve & Proceed to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;
