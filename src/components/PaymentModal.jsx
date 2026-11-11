import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { X, Smartphone, CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

const PAYMENT_PROVIDERS = [
  { id: 'mpesa', name: 'M-Pesa (Vodacom)', color: '#E60000', code: '*150*00#' },
  { id: 'tigopesa', name: 'Tigo Pesa (MixByYas)', color: '#0033A0', code: '*150*01#' },
  { id: 'airtelmoney', name: 'Airtel Money', color: '#FF0000', code: '*150*60#' },
  { id: 'halopesa', name: 'HaloPesa (Halotel)', color: '#FF6600', code: '*150*88#' },
  { id: 'card', name: 'Visa / Mastercard', color: '#1A1F71', code: 'Card Online' },
];

function PaymentModal({ bookingId, amount, isFullPayment = false, onClose, onSuccess }) {
  const { recordPayment, bookings, providers, language = 'en' } = useAppContext();

  const booking = bookings.find(b => b.id === bookingId);
  const provider = booking ? providers.find(p => p.id === booking.providerId) : null;

  const [selectedGateway, setSelectedGateway] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('0754 123 456');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'processing' | 'success'
  const [txnRef, setTxnRef] = useState('');

  const triggerSuccessEffects = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (selectedGateway !== 'card' && pin.length < 4) {
      alert(language === 'sw' ? 'Tafadhali weka PIN halali ya tarakimu 4' : 'Please enter a valid 4-digit PIN');
      return;
    }

    setStep('processing');

    setTimeout(() => {
      const generatedRef = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      setTxnRef(generatedRef);
      recordPayment(bookingId, amount, isFullPayment);
      setStep('success');
      triggerSuccessEffects();
    }, 1800);
  };

  const selectedMethodObj = PAYMENT_PROVIDERS.find(p => p.id === selectedGateway);

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
        zIndex: 1100,
        padding: '1rem'
      }}
    >
      <div
        className="modal-card clay-card motion-modal-card"
        style={{
          background: 'var(--clay-cream-2, #ffffff)',
          borderRadius: '36px',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: 'clamp(1.5rem, 3.5vw, 2.25rem)',
          boxShadow: 'var(--clay-shadow-soft)',
          border: '1.5px solid var(--clay-line)',
          position: 'relative'
        }}
      >
        {step !== 'processing' && (
          <button
            onClick={onClose}
            className="modal-close-btn"
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
        )}

        {step === 'input' && (
          <div>
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
              <h2 style={{ fontSize: '1.35rem', color: 'var(--app-text-primary, #0f172a)', fontWeight: 850, letterSpacing: '-0.02em', margin: 0 }}>
                {language === 'sw' ? 'Malipo ya Mtandao ya MY DAY' : 'MY DAY Mobile Money Checkout'}
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--app-text-muted, #64748b)', marginBottom: '1.25rem' }}>
              {language === 'sw' ? `Malipo salama kwa ajili ya ${provider?.name || 'Huduma ya Harusi'}` : `Secure payment for ${provider?.name || 'Wedding Booking'}`}
            </p>

            <div style={{
              background: 'var(--app-surface-elevated, rgba(255, 255, 255, 0.72))',
              borderRadius: 'var(--radius-lg)',
              padding: '1.15rem',
              marginBottom: '1.25rem',
              border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--app-text-muted, #64748b)', marginBottom: '0.35rem' }}>
                <span>{language === 'sw' ? 'Kumbukumbu ya Nafasi:' : 'Booking Reference:'}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--app-text-primary, #0f172a)' }}>{bookingId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--app-text-muted, #64748b)', marginBottom: '0.45rem' }}>
                <span>{language === 'sw' ? 'Aina ya Malipo:' : 'Payment Type:'}</span>
                <span style={{ fontWeight: 700, color: 'var(--app-text-primary, #0f172a)' }}>{isFullPayment ? (language === 'sw' ? 'Malipo Kamili' : 'Full Payment') : (language === 'sw' ? 'Dhamana ya Awali 30%' : '30% Deposit Guarantee')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 850, color: 'var(--app-text-primary, #0f172a)', paddingTop: '0.45rem', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <span>{language === 'sw' ? 'Kiasi cha Kulipa:' : 'Amount to Pay:'}</span>
                <span style={{ color: 'var(--color-primary, #0071E3)' }}>TSh {amount.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 750, marginBottom: '0.45rem', color: 'var(--app-text-primary, #0f172a)' }}>
                  {language === 'sw' ? 'Chagua Njia ya Malipo / Mtandao' : 'Select Mobile Money / Payment Channel'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                  {PAYMENT_PROVIDERS.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedGateway(p.id)}
                      className={`motion-payment-option ${selectedGateway === p.id ? 'is-selected' : ''}`}
                      style={{
                        '--idx': idx,
                        background: selectedGateway === p.id
                          ? 'var(--clay-selected-bg, linear-gradient(145deg, rgba(10, 132, 255, 0.15) 0%, rgba(240, 248, 255, 0.95) 100%))'
                          : 'var(--app-card-bg, #ffffff)',
                        color: selectedGateway === p.id ? 'var(--clay-selected-text, var(--color-primary, #0071E3))' : 'var(--app-text-secondary, #475569)',
                        border: selectedGateway === p.id
                          ? '2px solid var(--clay-selected-border, var(--color-primary, #0071E3))'
                          : '1.5px solid var(--clay-line)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '0.7rem 0.6rem',
                        fontSize: '0.85rem',
                        fontWeight: 750,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: selectedGateway === p.id
                          ? '0 6px 18px -2px rgba(10, 132, 255, 0.35)'
                          : '0 2px 6px rgba(15, 23, 42, 0.04)',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: p.color,
                        boxShadow: `0 0 8px ${p.color}`,
                        display: 'inline-block'
                      }} />
                      {p.id === 'card' ? <CreditCard size={14} color="var(--color-primary, #0071E3)" /> : null}
                      <span>{p.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedGateway !== 'card' ? (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 750, marginBottom: '0.35rem', color: 'var(--app-text-primary, #0f172a)' }}>
                      {language === 'sw' ? `Nambari ya Simu Iliyosajiliwa (${selectedMethodObj?.name})` : `Registered Mobile Number (${selectedMethodObj?.name})`}
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder={language === 'sw' ? 'Mfano: 0754 123 456' : 'E.g. 0754 123 456'}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '1.35rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 750, marginBottom: '0.35rem', color: 'var(--app-text-primary, #0f172a)' }}>
                      {language === 'sw' ? 'Weka PIN kwa Uigaji wa Muamala wa USSD' : 'Enter PIN for USSD Prompt Simulator'}
                    </label>
                    <input
                      type="password"
                      maxLength="4"
                      placeholder="••••"
                      value={pin}
                      onChange={e => setPin(e.target.value)}
                      style={{ letterSpacing: '0.2rem' }}
                      required
                    />
                  </div>
                </>
              ) : (
                <div style={{ marginBottom: '1.35rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 750, marginBottom: '0.35rem', color: 'var(--app-text-primary, #0f172a)' }}>
                    {language === 'sw' ? 'Nambari ya Kadi' : 'Card Number'}
                  </label>
                  <input
                    type="text"
                    placeholder="4000 1234 5678 9010"
                    style={{ marginBottom: '0.5rem' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input type="text" placeholder="MM/YY" />
                    <input type="password" placeholder="CVV" maxLength="3" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary btn-sweep"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.95rem'
                }}
              >
                {language === 'sw' ? `Lipa TSh ${amount.toLocaleString()} Sasa` : `Pay TSh ${amount.toLocaleString()} Now`}
              </button>
            </form>
          </div>
        )}

        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <div style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: 'var(--p3d-grad-champagne-btn, linear-gradient(135deg, #FFFFFF 0%, #F0F6FF 100%))',
              border: '2px solid var(--color-primary, #0071E3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              animation: 'aiAmbientGlow 2.5s infinite'
            }}>
              <Smartphone size={28} color="var(--color-primary, #0071E3)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.65rem', color: 'var(--color-text)', fontWeight: 800 }}>
              {language === 'sw' ? 'Inashughulikia Malipo ya Amana...' : 'Processing Escrow Deposit...'}
            </h3>
            <div className="motion-payment-progress-bar" style={{ maxWidth: 280, margin: '0 auto 1rem' }}>
              <div className="motion-payment-progress-fill" />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--app-text-muted, #64748b)' }}>
              {selectedGateway === 'card'
                ? (language === 'sw' ? 'Inathibitisha kadi na mtandao wa benki...' : 'Verifying card authorization with 3D Secure...')
                : (language === 'sw' ? `Tafadhali kagua simu yako (${phoneNumber}) kuthibitisha kwa PIN ya ${selectedMethodObj?.name}` : `Please check your phone (${phoneNumber}) to enter your ${selectedMethodObj?.name} PIN`)}
            </p>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div className="motion-success-pulse" style={{ display: 'inline-flex', borderRadius: '50%', marginBottom: '1rem' }}>
              <CheckCircle2 size={64} color="#10B981" />
            </div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-text)', marginBottom: '0.25rem', fontWeight: 800 }}>
              {language === 'sw' ? 'Malipo Yamethibitishwa!' : 'Payment Confirmed!'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              {language === 'sw' ? (
                <>Muamala wako wa <strong>TSh {amount.toLocaleString()}</strong> umethibitishwa kikamilifu.</>
              ) : (
                <>Your transaction of <strong>TSh {amount.toLocaleString()}</strong> has been verified.</>
              )}
            </p>

            <div style={{
              background: 'var(--color-success-bg)',
              border: '1px solid rgba(56, 161, 105, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              textAlign: 'left',
              marginBottom: '1.25rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>{language === 'sw' ? 'Kumbukumbu ya Muamala:' : 'Transaction Ref:'}</span>
                <strong style={{ fontFamily: 'monospace' }}>{txnRef}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>{language === 'sw' ? 'Mtoa Huduma:' : 'Vendor:'}</span>
                <strong>{provider?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>{language === 'sw' ? 'Njia ya Malipo:' : 'Channel:'}</span>
                <span>{selectedMethodObj?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{language === 'sw' ? 'Hali:' : 'Status:'}</span>
                <strong style={{ color: 'var(--color-success)' }}>
                  {language === 'sw' ? 'IMETHIBITISHWA' : 'CONFIRMED'}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  onClose();
                  if (onSuccess) onSuccess();
                }}
                style={{
                  flex: 1,
                  background: 'var(--color-primary)',
                  color: '#fff',
                  borderRadius: 'var(--radius-pill)',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                {language === 'sw' ? 'Rudi kwenye Dashibodi' : 'Return to Dashboard'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default PaymentModal;
