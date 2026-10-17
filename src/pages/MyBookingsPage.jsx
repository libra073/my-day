import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import PaymentModal from '../components/PaymentModal';
import { Calendar, Phone, MapPin, CheckCircle2, Download, PlusCircle } from 'lucide-react';

function MyBookingsPage() {
  const { bookings, providers, wedding, t } = useAppContext();
  const [activePayment, setActivePayment] = useState(null);

  const activeBookings = bookings.map(b => ({ ...b, provider: providers.find(p => p.id === b.providerId) }));

  const handleDownloadReceipt = (booking) => {
    const vendorName = booking.provider?.name || 'Vendor';
    const alertMsg = t('nav_browse') === 'Tafuta Huduma'
      ? `Inapakua Risiti Rasmi ya MY DAY & Uthibitisho wa Uhifadhi kwa ${vendorName} (Kumbukumbu: ${booking.id})`
      : `Downloading Official MY DAY Receipt & Booking Confirmation for ${vendorName} (Ref: ${booking.id})`;
    alert(alertMsg);
  };

  const glassCard = { background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-text)', marginBottom: '0.25rem', fontWeight: 800 }}>{t('bookings_title')}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{t('bookings_subtitle')} {wedding?.title || (user?.name ? `${user.name}'s Wedding` : 'Your Wedding')}</p>
        </div>
        <Link to="/marketplace" style={{
          background: 'var(--color-primary)',
          color: '#FFFFFF', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-pill)',
          fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          boxShadow: 'var(--shadow-glow)',
        }}>
          <PlusCircle size={16} /> {t('book_more_btn')}
        </Link>
      </div>

      {activeBookings.length === 0 ? (
        <div style={{ ...glassCard, padding: '3rem 1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💒</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-text)', fontWeight: 700 }}>{t('no_bookings_title')}</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>{t('no_bookings_desc')}</p>
          <Link to="/marketplace" className="button">{t('nav_browse')}</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeBookings.map(b => (
            <div key={b.id} style={{
              ...glassCard,
              padding: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{
                    background: 'var(--color-primary-light)', color: 'var(--color-primary-hover)',
                    padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase',
                    border: '1px solid rgba(255, 157, 59, 0.3)',
                  }}>
                    {t(`cat_${b.category}_title`) ? t(`cat_${b.category}_title`).split(' ')[0] : b.category}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', fontWeight: 600 }}>Ref: {b.id}</span>
                </div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--color-text)', marginBottom: '0.35rem', fontWeight: 700 }}>{b.provider?.name || 'Vendor'}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                  <MapPin size={14} color="var(--color-primary)" /> {b.provider?.location}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={14} color="var(--color-primary)" /> Contact: {b.provider?.contact || '+255 700 000 000'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem', fontWeight: 500 }}>{t('reserved_date')}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  <Calendar size={16} color="var(--color-primary)" /> {b.date}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-pill)' }}>
                  <CheckCircle2 size={13} /> {t('booking_status')} {b.status === 'confirmed' ? (t('nav_browse') === 'Tafuta Huduma' ? 'IMEKUBALIWA' : 'CONFIRMED') : b.status.toUpperCase()}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{t('total_cost')}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary-hover)', marginBottom: '0.25rem' }}>TSh {b.price.toLocaleString()}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  {t('paid_cost')} <strong style={{ color: 'var(--color-success)' }}>TSh {(b.paidAmount || 0).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button onClick={() => handleDownloadReceipt(b)} style={{
                    background: 'var(--color-surface-soft)', color: 'var(--color-text)',
                    fontSize: '0.8rem', padding: '0.5rem 0.85rem', display: 'inline-flex',
                    alignItems: 'center', gap: '0.35rem', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-pill)', boxShadow: 'none'
                  }}>
                    <Download size={14} /> {t('download_receipt')}
                  </button>
                  {b.price > (b.paidAmount || 0) && (
                    <button onClick={() => setActivePayment({ bookingId: b.id, amount: b.price - (b.paidAmount || 0) })} style={{
                      background: 'var(--color-primary)',
                      color: '#FFFFFF', fontSize: '0.8rem', padding: '0.5rem 0.85rem',
                      borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-glow)'
                    }}>
                      {t('pay_remaining')} (TSh {(b.price - (b.paidAmount || 0)).toLocaleString()})
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activePayment && (
        <PaymentModal bookingId={activePayment.bookingId} amount={activePayment.amount} isFullPayment={true} onClose={() => setActivePayment(null)} onSuccess={() => setActivePayment(null)} />
      )}
    </div>
  );
}

export default MyBookingsPage;
