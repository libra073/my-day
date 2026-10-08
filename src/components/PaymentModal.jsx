import React, { useState } from 'react';
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
  const { recordPayment, bookings, providers } = useAppContext();

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
      alert('Please enter a valid 4-digit PIN');
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

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(59, 43, 31, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        maxWidth: '480px',
        width: '100%',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative'
      }}>
        {step !== 'processing' && (
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
        )}

        {step === 'input' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={24} color="var(--color-primary)" />
              <h2 style={{ fontSize: '1.3rem', color: 'var(--color-text)', fontWeight: 800 }}>MY DAY Mobile Money Checkout</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Secure payment for {provider?.name || 'Wedding Booking'}
            </p>

            <div style={{
              background: 'var(--color-surface-soft)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              marginBottom: '1.25rem',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                <span>Booking Reference:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-text)' }}>{bookingId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                <span>Payment Type:</span>
                <span>{isFullPayment ? 'Full Payment' : '30% Deposit Guarantee'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', paddingTop: '0.35rem', borderTop: '1px solid var(--color-border)' }}>
                <span>Amount to Pay:</span>
                <span style={{ color: 'var(--color-primary-hover)' }}>TSh {amount.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--color-text)' }}>
                  Select Mobile Money / Payment Channel
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {PAYMENT_PROVIDERS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedGateway(p.id)}
                      style={{
                        background: selectedGateway === p.id ? p.color : 'var(--color-surface-soft)',
                        color: selectedGateway === p.id ? '#ffffff' : 'var(--color-text)',
                        border: selectedGateway === p.id ? `2px solid ${p.color}` : '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '0.6rem 0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        boxShadow: 'none'
                      }}
                    >
                      {p.id === 'card' ? <CreditCard size={14} /> : <Smartphone size={14} />}
                      {p.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {selectedGateway !== 'card' ? (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>
                      Registered Mobile Number ({selectedMethodObj?.name})
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="E.g. 0754 123 456"
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>
                      Enter PIN for USSD Prompt Simulator
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
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>
                    Card Number
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
                style={{
                  width: '100%',
                  background: selectedMethodObj?.color || 'var(--color-primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  borderRadius: 'var(--radius-pill)',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                Pay TSh {amount.toLocaleString()} Now
              </button>
            </form>
          </div>
        )}

        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div className="spinner" style={{ width: 48, height: 48, marginBottom: '1.5rem', margin: '0 auto 1.5rem', border: '4px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-text)', fontWeight: 700 }}>Processing Payment...</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Sending push prompt to <strong>{phoneNumber}</strong> via {selectedMethodObj?.name}
            </p>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={56} color="var(--color-success)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-text)', marginBottom: '0.25rem', fontWeight: 800 }}>
              Payment Confirmed!
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Your transaction of <strong>TSh {amount.toLocaleString()}</strong> has been verified.
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
                <span>Transaction Ref:</span>
                <strong style={{ fontFamily: 'monospace' }}>{txnRef}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Vendor:</span>
                <strong>{provider?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Channel:</span>
                <span>{selectedMethodObj?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Status:</span>
                <strong style={{ color: 'var(--color-success)' }}>CONFIRMED</strong>
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
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;
