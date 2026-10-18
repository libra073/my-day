import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Heart, Sparkles, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AuthPromptModal({
  isOpen,
  title,
  message,
  onClose,
  onCreateAccount,
  onLogin,
}) {
  const { language, t } = useAppContext();
  const isSw = language === 'sw';

  if (!isOpen) return null;

  const displayTitle = title || t('auth_prompt_title', isSw ? 'Fungua akaunti yako ya MY DAY ili kuendelea.' : 'Create your free MY DAY account to continue.');
  const displayMessage = message || t('auth_prompt_desc', isSw ? 'Jiunge na MY DAY ili kuhifadhi mipango ya harusi yako, kusimamia bajeti, kuwasiliana na watoa huduma, na kupanga kila kitu sehemu moja.' : 'Join MY DAY to save your wedding plans, manage your budget, connect with vendors, and keep everything organized in one place.');

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-prompt-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(44, 30, 20, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        padding: '1.25rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '480px',
          width: '100%',
          padding: 'clamp(1.5rem, 4vw, 2.25rem)',
          boxShadow: '0 25px 60px rgba(61, 44, 31, 0.25)',
          position: 'relative',
          border: '1px solid #EFE4D6',
          textAlign: 'center',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t('auth_prompt_later_btn', isSw ? 'Baadaye' : 'Maybe Later')}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: '#FAF6F0',
            border: '1px solid #EAE0D3',
            color: '#7A6657',
            width: 34,
            height: 34,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            padding: 0
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#F2E8DC';
            e.currentTarget.style.color = '#3D2C1F';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#FAF6F0';
            e.currentTarget.style.color = '#7A6657';
          }}
        >
          <X size={17} />
        </button>

        {/* Brand Icon Header */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(245, 166, 35, 0.2) 0%, rgba(245, 166, 35, 0.06) 100%)',
          border: '1.5px solid rgba(245, 166, 35, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          color: '#F5A623',
          boxShadow: '0 8px 24px rgba(245, 166, 35, 0.15)'
        }}>
          <Heart size={32} fill="#F5A623" color="#F5A623" />
        </div>

        {/* Explorer Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: '#FFF8EE',
          border: '1px solid rgba(245, 166, 35, 0.4)',
          color: '#92400E',
          padding: '0.25rem 0.75rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '0.85rem'
        }}>
          <Sparkles size={13} color="#D97706" />
          <span>{t('auth_guest_badge', isSw ? 'Hali ya Mgeni' : 'Guest Explorer Mode')}</span>
        </div>

        {/* Title */}
        <h3
          id="auth-prompt-title"
          style={{
            fontSize: '1.45rem',
            fontWeight: 850,
            color: '#2C1E14',
            lineHeight: 1.3,
            marginBottom: '0.75rem'
          }}
        >
          {displayTitle}
        </h3>

        {/* Supporting Text */}
        <p style={{
          color: '#6E5A4B',
          fontSize: '0.94rem',
          lineHeight: 1.55,
          marginBottom: '1.5rem',
          padding: '0 0.5rem'
        }}>
          {displayMessage}
        </p>

        {/* Value Prop Micro-Checklist */}
        <div style={{
          background: '#FAF6F0',
          borderRadius: '16px',
          padding: '0.9rem 1.1rem',
          marginBottom: '1.75rem',
          textAlign: 'left',
          fontSize: '0.84rem',
          color: '#4A3B30',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
          border: '1px solid #EFE5D8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={15} color="#16A34A" />
            <span>{isSw ? 'Hifadhi wasifu na bajeti ya harusi yako' : 'Save your custom wedding profile & budget'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={15} color="#16A34A" />
            <span>{isSw ? 'Weka akiba na uunganishe watoa huduma waaminifu' : 'Reserve verified wedding vendors with escrow protection'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={15} color="#D97706" />
            <span>{isSw ? 'Ulinzi wa malipo 100% wa M-Pesa & Tigo Pesa' : '100% mobile money payment protection (M-Pesa, Tigo Pesa)'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onCreateAccount}
            className="btn-pill-amber"
            style={{
              width: '100%',
              padding: '0.85rem 1.25rem',
              fontSize: '1rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem'
            }}
          >
            <Sparkles size={17} />
            <span>{t('auth_prompt_create_btn', isSw ? 'Fungua Akaunti' : 'Create Account')}</span>
          </button>

          <button
            type="button"
            onClick={onLogin}
            style={{
              width: '100%',
              padding: '0.75rem 1.25rem',
              fontSize: '0.92rem',
              fontWeight: 750,
              background: '#FFFFFF',
              border: '1.5px solid #D8C7B5',
              borderRadius: '999px',
              color: '#4A3B30',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#F5A623';
              e.currentTarget.style.background = '#FFF8EE';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#D8C7B5';
              e.currentTarget.style.background = '#FFFFFF';
            }}
          >
            {t('auth_prompt_login_btn', isSw ? 'Ingia' : 'Log In')}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#8A7565',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0.4rem',
              marginTop: '0.25rem',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#3D2C1F'}
            onMouseLeave={e => e.currentTarget.style.color = '#8A7565'}
          >
            {t('auth_prompt_later_btn', isSw ? 'Baadaye' : 'Maybe Later')}
          </button>
        </div>
      </div>
    </div>
  );
}
