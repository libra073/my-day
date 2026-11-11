import React from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, Sparkles, X, ShieldCheck, ArrowRight, LogIn } from 'lucide-react';
import { useBodyScrollLock } from '../lib/overlayLock';

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
  useBodyScrollLock(Boolean(isOpen), onClose);

  if (!isOpen) return null;

  const displayTitle = title || t('auth_prompt_title', isSw ? 'Fungua akaunti yako ya MY DAY ili kuendelea.' : 'Create your free MY DAY account to continue.');
  const displayMessage = message || t('auth_prompt_desc', isSw ? 'Jiunge na MY DAY ili kuhifadhi mipango ya harusi yako, kusimamia bajeti, kuwasiliana na watoa huduma, na kupanga kila kitu sehemu moja.' : 'Join MY DAY to save your wedding plans, manage your budget, connect with vendors, and keep everything organized in one place.');

  const steps = [
    isSw ? 'Unda akaunti yako ya bure' : 'Create your free account',
    isSw ? 'Thibitisha barua pepe yako' : 'Confirm your email',
    isSw ? 'Anza kupanga — kila kitu kinahifadhiwa' : 'Start planning — everything is saved',
  ];

  return createPortal(
    <div className="axp-backdrop" role="dialog" aria-modal="true" aria-labelledby="auth-prompt-title" onClick={onClose}>
      <div className="axp-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="axp-close" onClick={onClose} aria-label={isSw ? 'Funga' : 'Close'}>
          <X size={16} />
        </button>

        <span className="axp-icon" aria-hidden="true">
          <Heart size={26} fill="currentColor" stroke="none" />
        </span>

        <span className="axp-badge">
          <Sparkles size={12} />
          {t('auth_guest_badge', isSw ? 'Hali ya Mgeni' : 'Guest explorer')}
        </span>

        <h2 id="auth-prompt-title" className="axp-title">{displayTitle}</h2>
        <p className="axp-text">{displayMessage}</p>

        <ol className="axp-steps">
          {steps.map((step, i) => (
            <li key={step}>
              <span className="axp-step-num">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="axp-actions">
          <button type="button" className="ax-submit" onClick={() => onCreateAccount?.(displayTitle)}>
            <Sparkles size={16} />
            {t('auth_prompt_create_btn', isSw ? 'Fungua Akaunti' : 'Create my free account')}
            <ArrowRight size={15} />
          </button>

          <button type="button" className="axp-secondary" onClick={() => onLogin?.(displayTitle)}>
            <LogIn size={15} />
            {t('auth_prompt_login_btn', isSw ? 'Ingia' : 'I already have an account')}
          </button>

          <button type="button" className="axp-later" onClick={onClose}>
            {t('auth_prompt_later_btn', isSw ? 'Baadaye' : 'Maybe later')}
          </button>
        </div>

        <p className="axp-note">
          <ShieldCheck size={13} />
          {isSw ? 'Bure kujiunga. Hakuna ada ya kila mwezi.' : 'Free to join. No monthly fees.'}
        </p>
      </div>
    </div>,
    document.body
  );
}
