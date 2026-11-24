import React from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { X, ShieldCheck, Phone, Info, CheckCircle2 } from 'lucide-react';
import { useBodyScrollLock } from '../lib/overlayLock';

// Online checkout is intentionally not enabled for launch. This modal never
// collects card/PIN data and never marks a booking paid — it explains how to
// settle the deposit directly with the vendor. Payment status only changes
// server-side after a verified provider callback.
function PaymentModal({ bookingId, amount, isFullPayment = false, onClose, onSuccess }) {
  const { bookings, providers, language = 'en' } = useAppContext();
  const isSw = language === 'sw';

  const booking = bookings.find(b => b.id === bookingId);
  const provider = booking ? providers.find(p => p.id === booking.providerId) : null;
  const vendorPhone = provider?.contact || '+255 700 000 000';

  useBodyScrollLock(true, onClose);

  const finish = () => {
    onClose?.();
    onSuccess?.();
  };

  const steps = isSw
    ? [
        `Wasiliana na ${provider?.name || 'mtoa huduma'} kwa ${vendorPhone} kuthibitisha upatikanaji na bei ya mwisho.`,
        'Lipa kiasi kilichoonyeshwa moja kwa moja kwa mtoa huduma kupitia M-Pesa, Tigo Pesa, Airtel Money, HaloPesa au uhamisho wa benki kwenda akaunti yake rasmi.',
        'Mtoa huduma atathibitisha nafasi yako mara tu dhamana itakapopokelewa. Hifadhi kumbukumbu yako ya malipo.',
      ]
    : [
        `Contact ${provider?.name || 'the vendor'} on ${vendorPhone} to confirm availability and final pricing.`,
        'Pay the amount shown directly to the vendor via M-Pesa, Tigo Pesa, Airtel Money, HaloPesa or bank transfer to their official account.',
        'The vendor confirms your reservation once the deposit is received. Keep your payment reference.',
      ];

  return createPortal(
    <div
      className="modal-backdrop motion-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1350,
        padding: '1rem'
      }}
    >
      <div
        className="modal-card clay-card motion-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--clay-cream-2, #ffffff)',
          borderRadius: '36px',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90dvh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: 'clamp(1.5rem, 3.5vw, 2.25rem)',
          boxShadow: 'var(--clay-shadow-soft)',
          border: '1.5px solid var(--clay-line)',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          className="modal-close-btn"
          aria-label={isSw ? 'Funga' : 'Close'}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'var(--app-surface-elevated, rgba(255, 255, 255, 0.85))',
            border: '1px solid var(--app-border, rgba(255, 255, 255, 0.95))',
            color: 'var(--app-text-muted, #64748b)',
            width: 34,
            height: 34,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.15) 0%, rgba(0, 199, 190, 0.15) 100%)',
            border: '1.5px solid var(--app-border, rgba(10, 132, 255, 0.25))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={20} color="var(--color-primary, #0071E3)" />
          </div>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--app-text-primary, #0f172a)', fontWeight: 850, letterSpacing: '-0.02em', margin: 0 }}>
            {isSw ? 'Maelekezo ya Dhamana na Malipo' : 'Deposit & Payment Instructions'}
          </h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--app-text-muted, #64748b)', marginBottom: '1.25rem' }}>
          {isSw
            ? 'Nafasi yako imehifadhiwa. Kamilisha dhamana moja kwa moja na mtoa huduma.'
            : 'Your reservation is held. Complete the deposit directly with the vendor.'}
        </p>

        <div style={{
          background: 'var(--app-surface-elevated, rgba(255, 255, 255, 0.72))',
          borderRadius: 'var(--radius-lg)',
          padding: '1.15rem',
          marginBottom: '1rem',
          border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--app-text-muted, #64748b)', marginBottom: '0.35rem' }}>
            <span>{isSw ? 'Kumbukumbu ya Nafasi:' : 'Booking Reference:'}</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--app-text-primary, #0f172a)' }}>{bookingId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--app-text-muted, #64748b)', marginBottom: '0.35rem' }}>
            <span>{isSw ? 'Mtoa Huduma:' : 'Vendor:'}</span>
            <span style={{ fontWeight: 700, color: 'var(--app-text-primary, #0f172a)' }}>{provider?.name || (isSw ? 'Huduma ya Harusi' : 'Wedding Vendor')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--app-text-muted, #64748b)', marginBottom: '0.45rem' }}>
            <span>{isSw ? 'Aina ya Malipo:' : 'Payment Type:'}</span>
            <span style={{ fontWeight: 700, color: 'var(--app-text-primary, #0f172a)' }}>
              {isFullPayment ? (isSw ? 'Salio Kamili' : 'Full Balance') : (isSw ? 'Dhamana ya Awali 30%' : '30% Deposit')}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 850, color: 'var(--app-text-primary, #0f172a)', paddingTop: '0.45rem', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
            <span>{isSw ? 'Kiasi cha Kulipa:' : 'Amount Due:'}</span>
            <span style={{ color: 'var(--color-primary, #0071E3)' }}>TSh {Number(amount || 0).toLocaleString()}</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.6rem',
          alignItems: 'flex-start',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1.5px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.9rem 1rem',
          marginBottom: '1.15rem'
        }}>
          <Info size={18} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: '0.82rem', color: 'var(--app-text-secondary, #475569)', margin: 0, lineHeight: 1.55 }}>
            {isSw
              ? 'Malipo ya mtandaoni bado hayajawashwa. Kwa sasa, lipa mtoa huduma moja kwa moja — MY DAY haichukui nambari za kadi wala PIN za pesa za simu.'
              : 'Online checkout is not yet enabled. For now, pay the vendor directly — MY DAY never collects card numbers or mobile-money PINs.'}
          </p>
        </div>

        <ol style={{ margin: '0 0 1.15rem', paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {steps.map((s, i) => (
            <li key={i} style={{ fontSize: '0.85rem', color: 'var(--app-text-secondary, #475569)', lineHeight: 1.55 }}>{s}</li>
          ))}
        </ol>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--app-surface-secondary, rgba(245, 238, 255, 0.72))',
          border: '1.5px solid var(--app-border, rgba(142, 98, 248, 0.2))',
          borderRadius: 'var(--radius-pill)',
          padding: '0.7rem 1rem',
          marginBottom: '1.35rem'
        }}>
          <Phone size={16} color="var(--color-primary, #0071E3)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 750, color: 'var(--app-text-primary, #0f172a)' }}>
            {isSw ? 'Simu ya Mtoa Huduma:' : 'Vendor Contact:'} {vendorPhone}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--app-text-muted, #64748b)' }}>
          <CheckCircle2 size={15} color="#D97706" />
          <span>{isSw ? 'Hali ya nafasi: Inasubiri Dhamana' : 'Reservation status: Awaiting Deposit'}</span>
        </div>

        <button
          type="button"
          onClick={finish}
          className="btn-primary btn-sweep"
          style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
        >
          {isSw ? 'Rudi kwenye Dashibodi' : 'Return to Dashboard'}
        </button>
      </div>
    </div>,
    document.body
  );
}

export default PaymentModal;
