import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import PaymentModal from '../components/PaymentModal';
import { Calendar, Phone, MapPin, CheckCircle2, Download, PlusCircle } from 'lucide-react';

function MyBookingsPage() {
  const { bookings, providers, wedding, user, isLoggedIn, openAuthModal, language, t } = useAppContext();
  const [activePayment, setActivePayment] = useState(null);
  const isSw = language === 'sw';

  if (!isLoggedIn) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: 540,
          margin: '0 auto',
          background: 'var(--app-card-bg, #fffdfb)',
          padding: '3rem 2rem',
          borderRadius: '26px',
          border: '1px solid var(--app-border, #efe8f1)',
          boxShadow: '0 16px 38px -22px rgba(96, 74, 140, 0.32), 0 2px 6px rgba(96, 74, 140, 0.05)'
        }}>
          <div style={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            background: 'var(--p3d-grad-champagne-btn, linear-gradient(135deg, #FFFFFF 0%, #F0F6FF 100%))',
            border: '1px solid var(--app-border, rgba(10, 132, 255, 0.18))',
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}>
            <Calendar size={32} color="var(--color-primary, #0071E3)" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            {t('auth_prompt_title', isSw ? 'Fungua akaunti yako ya MY DAY ili kuendelea.' : 'Create your free MY DAY account to continue.')}
          </h1>
          <p style={{ color: 'var(--app-text-secondary, #475569)', lineHeight: 1.6, marginBottom: '2rem' }}>
            {t('auth_prompt_desc', isSw ? 'Jiunge na MY DAY ili kuhifadhi mipango ya harusi yako, kusimamia bajeti, kuwasiliana na watoa huduma, na kupanga kila kitu sehemu moja.' : 'Join MY DAY to save your wedding plans, manage your budget, connect with vendors, and keep everything organized in one place.')}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => openAuthModal({ initialTab: 'register' })}
              className="btn-primary"
              style={{ padding: '0.8rem 1.6rem' }}
            >
              {t('auth_prompt_create_btn', isSw ? 'Fungua Akaunti' : 'Create Account')}
            </button>
            <button
              type="button"
              onClick={() => openAuthModal({ initialTab: 'login' })}
              className="btn-liquid-white"
              style={{ padding: '0.8rem 1.6rem' }}
            >
              {t('auth_prompt_login_btn', isSw ? 'Ingia' : 'Log In')}
            </button>
            <Link to="/marketplace" className="button" style={{ background: 'transparent', border: '1.5px solid rgba(148, 163, 184, 0.25)', color: 'var(--app-text-secondary, #475569)', borderRadius: 'var(--radius-pill)', padding: '0.8rem 1.4rem' }}>
              {t('celebration_browse_cta', isSw ? 'Tazama Watoa Huduma' : 'Browse Vendors')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeBookings = (bookings || []).map(b => ({ ...b, provider: providers.find(p => p.id === b.providerId) }));

  const handleDownloadReceipt = (booking) => {
    const vendorName = booking.provider?.name || 'Vendor';
    const alertMsg = t('nav_browse') === 'Tafuta Huduma'
      ? `Inapakua Risiti Rasmi ya MY DAY & Uthibitisho wa Uhifadhi kwa ${vendorName} (Kumbukumbu: ${booking.id})`
      : `Downloading Official MY DAY Receipt & Booking Confirmation for ${vendorName} (Ref: ${booking.id})`;
    alert(alertMsg);
  };

  const glassCard = {
    background: 'var(--app-card-bg, rgba(255, 255, 255, 0.72))',
    backdropFilter: 'var(--liquid-glass-blur, blur(28px) saturate(190%))',
    borderRadius: '26px',
    border: '1px solid var(--app-border, rgba(255, 255, 255, 0.82))',
    boxShadow: 'var(--clay-shadow)',
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--app-text-primary, #0f172a)', marginBottom: '0.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{t('bookings_title')}</h1>
          <p style={{ color: 'var(--app-text-secondary, #475569)', fontSize: '0.95rem' }}>{t('bookings_subtitle')} {wedding?.title || (user?.name ? `${user.name}'s Wedding` : 'Your Wedding')}</p>
        </div>
        <Link to="/marketplace" className="btn-primary" style={{
          padding: '0.75rem 1.4rem',
          fontSize: '0.9rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
        }}>
          <PlusCircle size={16} /> {t('book_more_btn')}
        </Link>
      </div>

      {activeBookings.length === 0 ? (
        <div className="bk-empty-card" style={{ ...glassCard, padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <div className="bk-empty-badge" style={{
            width: 72,
            height: 72,
            margin: '0 auto 1.25rem',
            borderRadius: '50%',
            background: 'var(--clay-lav-soft)',
            border: '1px solid var(--app-border, #e3dbf7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }}>💒</div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--app-text-primary, #0f172a)', fontWeight: 800 }}>{t('no_bookings_title')}</h3>
          <p style={{ color: 'var(--app-text-secondary, #475569)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>{t('no_bookings_desc')}</p>
          <Link to="/marketplace" className="btn-primary" style={{ padding: '0.75rem 1.75rem' }}>{t('nav_browse')}</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeBookings.map(b => (
            <div key={b.id} style={{
              ...glassCard,
              padding: '1.75rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{
                    background: 'rgba(0, 102, 238, 0.12)',
                    color: 'var(--color-primary, #0071E3)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    border: '1px solid rgba(10, 132, 255, 0.22)',
                  }}>
                    {t(`cat_${b.category}`, b.category).split(' ')[0]}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--app-text-muted, #64748B)', fontFamily: 'monospace', fontWeight: 600 }}>Ref: {b.id}</span>
                </div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.35rem', fontWeight: 700 }}>{b.provider?.name || 'Vendor'}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--app-text-secondary, #475569)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                  <MapPin size={14} color="var(--color-primary, #0071E3)" /> {b.provider?.location}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--app-text-secondary, #475569)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={14} color="var(--color-primary, #0071E3)" /> Contact: {b.provider?.contact || '+255 700 000 000'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--app-text-muted, #64748B)', marginBottom: '0.2rem', fontWeight: 600 }}>{t('reserved_date')}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--app-text-primary, #0F172A)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  <Calendar size={16} color="var(--color-primary, #0071E3)" /> {b.date}
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#059669',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-pill)'
                }}>
                  <CheckCircle2 size={13} /> {t('booking_status')} {b.status === 'confirmed' ? (t('nav_browse') === 'Tafuta Huduma' ? 'IMEKUBALIWA' : 'CONFIRMED') : b.status.toUpperCase()}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--app-text-muted, #64748B)', fontWeight: 600 }}>{t('total_cost')}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary, #0071E3)', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>TSh {b.price.toLocaleString()}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--app-text-secondary, #475569)', marginBottom: '0.75rem' }}>
                  {t('paid_cost')} <strong style={{ color: '#059669' }}>TSh {(b.paidAmount || 0).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button onClick={() => handleDownloadReceipt(b)} className="btn-liquid-white" style={{
                    fontSize: '0.8rem', padding: '0.5rem 0.9rem', display: 'inline-flex',
                    alignItems: 'center', gap: '0.35rem'
                  }}>
                    <Download size={14} /> {t('download_receipt')}
                  </button>
                  {b.price > (b.paidAmount || 0) && (
                    <button onClick={() => setActivePayment({ bookingId: b.id, amount: b.price - (b.paidAmount || 0) })} className="btn-primary" style={{
                      fontSize: '0.8rem', padding: '0.5rem 0.95rem'
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
