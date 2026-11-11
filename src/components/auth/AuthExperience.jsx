import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import api from '../../services/api';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { friendlyAuthError } from '../../services/authErrors';
import {
  Heart, Mail, Lock, User, Eye, EyeOff, ShieldCheck, Phone,
  ArrowLeft, Store, CheckCircle2, AlertCircle, Loader2, ArrowRight,
  KeyRound, MailCheck, X, Building2, Palette, Music, UtensilsCrossed, Scissors, Car,
} from 'lucide-react';
import GlassSelect from '../ui/GlassSelect';
import GlassCombobox from '../ui/GlassCombobox';
import '../../styles/auth-experience.css';

const VENDOR_CATEGORIES = [
  { id: 'kumbi', label: 'Venues', swLabel: 'Kumbi', icon: Building2 },
  { id: 'wapambaji', label: 'Decorators', swLabel: 'Wapambaji', icon: Palette },
  { id: 'entertainment', label: 'MCs & Entertainment', swLabel: 'MCs & Burudani', icon: Music },
  { id: 'catering', label: 'Catering', swLabel: 'Catering', icon: UtensilsCrossed },
  { id: 'saloon', label: 'Saloon & Beauty', swLabel: 'Saluni & Urembo', icon: Scissors },
  { id: 'transport', label: 'Transport', swLabel: 'Usafiri', icon: Car },
];

const CITY_OPTIONS = [
  'Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Zanzibar', 'Tanga',
  'Mbeya', 'Morogoro', 'Moshi', 'Iringa', 'Kigoma', 'Bukoba', 'Musoma',
  'Songea', 'Sumbawanga', 'Shinyanga', 'Tabora', 'Singida', 'Bagamoyo',
  'Lindi', 'Mtwara', 'Njombe', 'Babati', 'Geita', 'Kahama', 'Korogwe',
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function AuthExperience({
  initialTab = 'login',
  isModal = false,
  onClose,
  onSuccess,
  initialEmail = '',
  contextNote = '',
  resetTokenFromUrl = '',
  onNavigate,
}) {
  const { loginUser, registerUser, requestPasswordReset, completePasswordReset, language } = useAppContext();
  const supabaseAuth = isSupabaseConfigured;
  const isSw = language === 'sw';

  const [mode, setMode] = useState(
    resetTokenFromUrl ? 'reset' : (['login', 'register', 'forgot', 'reset', 'verify'].includes(initialTab) ? initialTab : 'login')
  );
  const [role, setRole] = useState('customer');

  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [vendorCategory, setVendorCategory] = useState('kumbi');
  const [vendorLocation, setVendorLocation] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { text, kind }
  const [notice, setNotice] = useState('');
  const [sent, setSent] = useState({ message: '', token: '' });
  const [resetToken, setResetToken] = useState(resetTokenFromUrl);
  const [showTokenInput, setShowTokenInput] = useState(false);

  const [verificationCode, setVerificationCode] = useState('');
  const [demoVerificationCode, setDemoVerificationCode] = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const t = setTimeout(() => firstFieldRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [mode]);

  useEffect(() => {
    if (!isModal) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isModal, onClose]);

  useEffect(() => {
    if (!isModal) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isModal]);

  const guideLine = {
    login: isSw ? 'Karibu tena — nikuingize.' : "Welcome back — let's get you in.",
    register: isSw ? 'Mgeni? Nitakupitisha hatua kwa hatua.' : "New here? I'll walk you through.",
    forgot: isSw ? 'Hutokea kwa kila mtu. Tuanze upya.' : 'Happens to everyone. Let us reset it.',
    reset: isSw ? 'Karibu mwisho — chagua nenosiri jipya.' : 'Almost done — pick a new password.',
    sent: isSw ? 'Angalia barua pepe — nitakusubiri.' : "Check your inbox — I'll wait.",
    verify: isSw ? 'Hatua ya mwisho — thibitisha barua pepe yako.' : "Almost there — let's verify your email.",
  }[mode];

  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;
  const strongEnough = password.length >= 6;
  const emailValid = EMAIL_RE.test(email.trim());

  const go = (nextMode, patch = {}) => {
    setMode(nextMode);
    setError(null);
    setNotice('');
    if (patch.email !== undefined) setEmail(patch.email);
    if (patch.role !== undefined) setRole(patch.role);
    setTouched({});
  };

  const finish = (path) => {
    if (onSuccess) onSuccess();
    if (onClose) onClose();
    if (isModal) return;
    if (onNavigate) onNavigate(path);
    else window.location.assign(path);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setNotice('');

    if (!email.trim()) return setError({ text: isSw ? 'Weka barua pepe yako.' : 'Enter your email address.', kind: 'field' });
    if (!emailValid) return setError({ text: isSw ? 'Barua pepe hii haionekani sahihi.' : "That email address doesn't look right.", kind: 'field' });
    if (!password) return setError({ text: isSw ? 'Weka nenosiri lako.' : 'Enter your password.', kind: 'field' });

    setLoading(true);
    try {
      await loginUser({ email: email.trim(), password, role });
      setLoading(false);
      setNotice(isSw ? 'Umefanikiwa kuingia. Tunakupeleka…' : 'Signed in. Taking you in…');
      setTimeout(() => finish(role === 'provider' ? '/provider' : '/dashboard'), 500);
    } catch (err) {
      setLoading(false);
      if (supabaseAuth) {
        setError(friendlyAuthError(err, isSw));
      } else if (err?.status === 401) {
        setError({
          text: isSw
            ? 'Barua pepe na nenosiri hivi havilingani na akaunti yoyote.'
            : "That email and password don't match an account.",
          kind: 'credentials',
        });
      } else {
        setError({
          text: err?.message || (isSw ? 'Kuingia kumeshindikana. Jaribu tena.' : 'We could not sign you in. Please try again.'),
          kind: 'generic',
        });
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setNotice('');

    if (!name.trim()) return setError({ text: isSw ? 'Weka jina lako au jina la biashara.' : 'Add your name or business name.', kind: 'field' });
    if (!emailValid) return setError({ text: isSw ? 'Barua pepe hii haionekani sahihi.' : "That email address doesn't look right.", kind: 'field' });
    if (!strongEnough) return setError({ text: isSw ? 'Nenosiri lihitaji herufi 6 au zaidi.' : 'Use at least 6 characters for your password.', kind: 'field' });
    if (password !== confirmPassword) return setError({ text: isSw ? 'Manenosiri hayalingani.' : 'Those passwords do not match.', kind: 'field' });
    if (role === 'provider' && !vendorLocation.trim()) {
    return setError({ text: isSw ? 'Andika jiji au mji wako.' : 'Enter your city or town.', kind: 'field' });
  }
  if (!agreeTerms) return setError({ text: isSw ? 'Kubali vigezo ili kuendelea.' : 'Please accept the terms to continue.', kind: 'field' });

    setLoading(true);
    try {
      const res = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role,
        vendorCategory: role === 'provider' ? vendorCategory : undefined,
        vendorLocation: role === 'provider' ? vendorLocation : undefined,
      });
      setLoading(false);
      if (res?.needsEmailConfirmation) {
        setVerificationCode('');
        setMode('verify');
        setNotice(isSw
          ? 'Tumekutumia kiungo cha kuthibitisha. Fungua barua pepe yako ili kuamilisha akaunti.'
          : 'We sent a confirmation link. Open your inbox to activate your account.');
        return;
      }
        if (res?.verificationCode) setDemoVerificationCode(res.verificationCode);
        // Supabase projects with "Confirm email" turned off return a session
        // straight away, so there is nothing to wait for — go right in.
        if (supabaseAuth) {
          setNotice(isSw ? 'Akaunti yako imeundwa. Tunakupeleka ndani…' : 'Your account is ready. Taking you in…');
          setTimeout(() => finish(role === 'provider' ? '/provider' : '/dashboard'), 500);
          return;
        }
        setVerificationCode('');
        setMode('verify');
        setNotice(isSw ? 'Msimbo wa kuthibitisha umetumwa kwa barua pepe yako.' : 'A verification code has been sent to your email.');
    } catch (err) {
      setLoading(false);
      if (supabaseAuth) {
        setError(friendlyAuthError(err, isSw));
      } else if (err?.status === 409) {
        setError({
          text: isSw ? 'Barua pepe hii tayari ina akaunti ya MY DAY.' : 'That email already has a MY DAY account.',
          kind: 'exists',
        });
      } else {
        setError({
          text: err?.message || (isSw ? 'Usajili umeshindikana. Jaribu tena.' : 'We could not create your account. Please try again.'),
          kind: 'generic',
        });
      }
    }
  };

  const handleVerifyEmail = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setError(null);
    setNotice('');
    const targetEmail = (email || initialEmail || '').trim();
    if (!targetEmail) {
      return setError({ text: isSw ? 'Barua pepe inahitajika.' : 'Email is required.', kind: 'field' });
    }
    if (!verificationCode.trim() || verificationCode.trim().length < 6) {
      return setError({ text: isSw ? 'Weka msimbo kamili wa tarakimu 6.' : 'Please enter the complete 6-digit code.', kind: 'field' });
    }

    setLoading(true);
    try {
      await api.verifyEmail(targetEmail, verificationCode.trim());
      setLoading(false);
      setNotice(isSw ? 'Barua pepe yako imethibitishwa kikamilifu!' : 'Your email has been verified successfully!');
      setTimeout(() => finish(role === 'provider' ? '/provider' : '/dashboard'), 700);
    } catch (err) {
      setLoading(false);
      setError({
        text: err?.message || (isSw ? 'Msimbo huu si sahihi au umeisha muda.' : 'Invalid or expired verification code.'),
        kind: 'generic',
      });
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = (email || initialEmail || '').trim();
    if (!targetEmail) {
      return setError({ text: isSw ? 'Barua pepe inahitajika.' : 'Email is required.', kind: 'field' });
    }
    setResending(true);
    setError(null);
    try {
      const res = await api.sendVerificationEmail(targetEmail);
      setResending(false);
      if (res?.verificationCode) {
        setDemoVerificationCode(res.verificationCode);
      }
      setNotice(isSw ? 'Msimbo mpya umetumwa kwenye barua pepe yako.' : 'A new verification code has been sent to your email.');
      setResendCooldown(30);
    } catch (err) {
      setResending(false);
      setError({
        text: err?.message || (isSw ? 'Imeshindikana kutuma msimbo. Jaribu tena.' : 'Could not resend verification code.'),
        kind: 'generic',
      });
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(null);
    setNotice('');
    if (!emailValid) {
      return setError({ text: isSw ? 'Weka barua pepe iliyosajiliwa.' : 'Enter the email you registered with.', kind: 'field' });
    }

    setLoading(true);
    try {
      if (supabaseAuth) {
        await requestPasswordReset(email.trim());
        setLoading(false);
        setSent({
          message: isSw
            ? 'Kama akaunti ipo, tumekutumia kiungo cha kubadilisha nenosiri. Angalia barua pepe yako.'
            : 'If that account exists, we sent a password-reset link. Check your inbox.',
          token: '',
        });
        setMode('sent');
        return;
      }
      const res = await api.forgotPassword(email.trim());
      setLoading(false);
      setSent({
        message: res?.message || (isSw
          ? 'Kama barua pepe hii ipo kwenye mfumo, tumetuma maelekezo ya kubadilisha nenosiri.'
          : 'If that email is registered, we have sent password reset instructions.'),
        token: res?.resetToken || '',
      });
      setMode('sent');
    } catch (err) {
      setLoading(false);
      setError(supabaseAuth ? friendlyAuthError(err, isSw) : {
        text: err?.message || (isSw ? 'Imeshindikana kutuma maelekezo. Jaribu tena.' : 'We could not send reset instructions. Try again.'),
        kind: 'generic',
      });
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    if (!supabaseAuth && !resetToken.trim()) return setError({ text: isSw ? 'Weka msimbo wa kubadilisha nenosiri.' : 'Enter your reset code.', kind: 'field' });
    if (!strongEnough) return setError({ text: isSw ? 'Nenosiri lihitaji herufi 6 au zaidi.' : 'Use at least 6 characters for your new password.', kind: 'field' });
    if (password !== confirmPassword) return setError({ text: isSw ? 'Manenosiri hayalingani.' : 'Those passwords do not match.', kind: 'field' });

    setLoading(true);
    try {
      if (supabaseAuth) {
        try {
          await completePasswordReset(password);
        } catch (e) {
          throw new Error(/session/i.test(e?.message || '')
            ? (isSw ? 'Kiungo cha kubadilisha nenosiri kimeisha. Omba kiungo kipya.' : 'That reset link has expired. Request a fresh one.')
            : e.message);
        }
        setLoading(false);
        setPassword('');
        setConfirmPassword('');
        setNotice(isSw ? 'Nenosiri lako limebadilishwa. Ingia na nenosiri jipya.' : 'Your password is updated. Sign in with your new password.');
        setMode('login');
        return;
      }
      await api.resetPassword(resetToken.trim(), password);
      setLoading(false);
      setPassword('');
      setConfirmPassword('');
      setShowTokenInput(false);
      setNotice(isSw ? 'Nenosiri lako limebadilishwa. Ingia na nenosiri jipya.' : 'Your password is updated. Sign in with your new password.');
      setMode('login');
    } catch (err) {
      setLoading(false);
      setError(supabaseAuth ? friendlyAuthError(err, isSw) : {
        text: err?.message || (isSw ? 'Msimbo huu si sahihi au umeisha muda.' : 'That reset code is invalid or has expired.'),
        kind: 'generic',
      });
    }
  };

  const titles = useMemo(() => ({
    login: {
      title: isSw ? 'Karibu tena' : 'Welcome back',
      sub: isSw ? 'Ingia ili kuendelea na mipango yako.' : 'Sign in to pick up where you left off.',
      cta: isSw ? 'Ingia' : 'Sign in',
    },
    register: {
      title: isSw ? 'Unda akaunti yako' : 'Create your account',
      sub: isSw ? 'Dakika moja tu, kisha anza kupanga.' : 'It takes a minute, then you can start planning.',
      cta: isSw ? 'Unda akaunti' : 'Create account',
    },
    forgot: {
      title: isSw ? 'Umesahau nenosiri?' : 'Forgot your password?',
      sub: isSw ? 'Weka barua pepe yako na tutakutumia maelekezo.' : 'Enter your email and we will send reset instructions.',
      cta: isSw ? 'Tuma maelekezo' : 'Send reset instructions',
    },
    reset: {
      title: isSw ? 'Weka nenosiri jipya' : 'Set a new password',
      sub: isSw ? 'Weka msimbo tuliokutumia kisha chagua nenosiri jipya.' : 'Enter the code we sent you, then choose a new password.',
      cta: isSw ? 'Hifadhi nenosiri' : 'Save new password',
    },
    sent: {
      title: isSw ? 'Angalia barua pepe yako' : 'Check your email',
      sub: isSw ? 'Maelekezo ya kubadilisha nenosiri yametumwa.' : 'Password reset instructions are on their way.',
      cta: '',
    },
    verify: {
      title: supabaseAuth
        ? (isSw ? 'Angalia barua pepe yako' : 'Check your email')
        : (isSw ? 'Thibitisha barua pepe yako' : 'Verify your email'),
      sub: supabaseAuth
        ? (isSw
            ? 'Tumekutumia kiungo cha kuthibitisha. Bonyeza kiungo hicho kuamilisha akaunti, kisha ingia.'
            : 'We sent you a confirmation link. Click it to activate your account, then sign in.')
        : (isSw
            ? 'Weka msimbo wa tarakimu 6 tuliokutumia kwa barua pepe.'
            : 'Enter the 6-digit verification code we sent to your email.'),
      cta: supabaseAuth ? '' : (isSw ? 'Thibitisha barua pepe' : 'Verify email'),
    },
  }[mode]), [mode, isSw, supabaseAuth]);

  const roleSwitch = (mode === 'login' || mode === 'register') && (
    <div className="ax-role" role="group" aria-label={isSw ? 'Aina ya akaunti' : 'Account type'}>
      <button
        type="button"
        aria-pressed={role === 'customer'}
        className={`ax-role__btn ${role === 'customer' ? 'is-active' : ''}`}
        onClick={() => { setRole('customer'); setError(null); }}
      >
        <Heart size={14} /> {isSw ? 'Mwanandoa' : 'Couple'}
      </button>
      <button
        type="button"
        aria-pressed={role === 'provider'}
        className={`ax-role__btn ${role === 'provider' ? 'is-active' : ''}`}
        onClick={() => { setRole('provider'); setError(null); }}
      >
        <Store size={14} /> {isSw ? 'Mtoa huduma' : 'Vendor'}
      </button>
    </div>
  );

  return (
    <div className={`ax ${isModal ? 'ax--modal' : 'ax--page'}`}>
      {!isModal && (
        <a href="/" className="ax-back">
          <ArrowLeft size={15} />
          <span>{isSw ? 'Rudi nyumbani' : 'Back to home'}</span>
        </a>
      )}

      {!isModal && (
        <figure className="ax-companion" aria-hidden="true">
          <span className="ax-companion__shadow" />
          <img src="/images/ebony-character.png" alt="" />
        </figure>
      )}

      <section className={`ax-card ${mode === 'register' ? 'ax-card--tall' : ''}`} aria-labelledby="ax-title">
        <header className="ax-card__head">
          <a href="/" className="ax-brand" aria-label="MY DAY home">
            <span className="ax-brand__mark"><Heart size={15} fill="currentColor" stroke="none" /></span>
            <span className="ax-brand__name">MY DAY</span>
          </a>

          {isModal && (
            <button type="button" className="ax-close" onClick={onClose} aria-label={isSw ? 'Funga' : 'Close'}>
              <X size={17} />
            </button>
          )}
        </header>

        {contextNote && <p className="ax-context">{contextNote}</p>}

        <div className="ax-guide" aria-hidden="true">
          <span className="ax-guide__avatar" />
          <span className="ax-guide__say">{guideLine}</span>
        </div>

        <h1 id="ax-title" className="ax-title">{titles.title}</h1>
        <p className="ax-sub">{titles.sub}</p>

        {roleSwitch}

        {notice && (
          <div className="ax-alert ax-alert--success" role="status">
            <CheckCircle2 size={16} />
            <span>{notice}</span>
          </div>
        )}

        {error && (
          <div className={`ax-alert ax-alert--error ax-alert--${error.kind}`} role="alert">
            <AlertCircle size={16} />
            <div className="ax-alert__body">
              <span>{error.text}</span>
              {error.kind === 'credentials' && (
                <div className="ax-alert__actions">
                  <button type="button" className="ax-inline-link" onClick={() => go('register', { email })}>
                    {isSw ? 'Unda akaunti na barua pepe hii' : 'Create an account with this email'}
                  </button>
                  <button type="button" className="ax-inline-link" onClick={() => go('forgot', { email })}>
                    {isSw ? 'Badilisha nenosiri' : 'Reset my password'}
                  </button>
                </div>
              )}
              {error.kind === 'exists' && (
                <div className="ax-alert__actions">
                  <button type="button" className="ax-inline-link" onClick={() => go('login', { email })}>
                    {isSw ? 'Ingia kwenye akaunti hii' : 'Sign in to this account instead'}
                  </button>
                  <button type="button" className="ax-inline-link" onClick={() => go('forgot', { email })}>
                    {isSw ? 'Umesahau nenosiri?' : 'I forgot my password'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- LOGIN ---------------- */}
        {mode === 'login' && (
          <form className="ax-form" onSubmit={handleLogin} noValidate>
            <div className="ax-field">
              <label htmlFor="ax-email">{isSw ? 'Barua pepe' : 'Email address'}</label>
              <div className={`ax-input ${touched.email && !emailValid ? 'is-invalid' : ''}`}>
                <Mail size={16} aria-hidden="true" />
                <input
                  ref={firstFieldRef}
                  id="ax-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  aria-invalid={touched.email && !emailValid}
                  required
                />
              </div>
            </div>

            <div className="ax-field">
              <div className="ax-label-row">
                <label htmlFor="ax-password">{isSw ? 'Nenosiri' : 'Password'}</label>
                <button type="button" className="ax-inline-link" onClick={() => go('forgot', { email })}>
                  {isSw ? 'Umesahau?' : 'Forgot?'}
                </button>
              </div>
              <div className="ax-input">
                <Lock size={16} aria-hidden="true" />
                <input
                  id="ax-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder={isSw ? 'Nenosiri lako' : 'Your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="ax-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? (isSw ? 'Ficha nenosiri' : 'Hide password') : (isSw ? 'Onyesha nenosiri' : 'Show password')}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="ax-submit" disabled={loading}>
              {loading ? <><Loader2 size={17} className="ax-spin" /> {isSw ? 'Inaingia…' : 'Signing in…'}</> : <>{titles.cta} <ArrowRight size={16} /></>}
            </button>

            <p className="ax-switch">
              {isSw ? 'Mgeni MY DAY?' : 'New to MY DAY?'}{' '}
              <button type="button" onClick={() => go('register', { email })}>
                {isSw ? 'Unda akaunti bure' : 'Create a free account'}
              </button>
            </p>
          </form>
        )}

        {/* ---------------- REGISTER ---------------- */}
        {mode === 'register' && (
          <form className="ax-form" onSubmit={handleRegister} noValidate>
            <div className="ax-field">
              <label htmlFor="ax-name">
                {role === 'provider'
                  ? (isSw ? 'Jina la biashara' : 'Business name')
                  : (isSw ? 'Majina yenu' : 'Your names')}
              </label>
              <div className="ax-input">
                <User size={16} aria-hidden="true" />
                <input
                  ref={firstFieldRef}
                  id="ax-name"
                  type="text"
                  autoComplete={role === 'provider' ? 'organization' : 'name'}
                  placeholder={role === 'provider'
                    ? (isSw ? 'Mf. Imperial Floral' : 'e.g. Imperial Floral')
                    : (isSw ? 'Mf. Baraka & Rehema' : 'e.g. Baraka & Rehema')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="ax-field">
              <label htmlFor="ax-reg-email">{isSw ? 'Barua pepe' : 'Email address'}</label>
              <div className="ax-input">
                <Mail size={16} aria-hidden="true" />
                <input
                  id="ax-reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="ax-field">
              <label htmlFor="ax-phone">{isSw ? 'Simu / WhatsApp (hiari)' : 'Phone / WhatsApp (optional)'}</label>
              <div className="ax-input ax-input--prefix">
                <Phone size={16} aria-hidden="true" />
                <span>+255</span>
                <input
                  id="ax-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="700 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/^\s*\+?255\s*/, ''))}
                  aria-describedby="ax-phone-hint"
                />
              </div>
              <span id="ax-phone-hint" className="ax-hint">
                {isSw ? 'Inatumika kwa arifa za uhifadhi.' : 'Used for booking alerts.'}
              </span>
            </div>

            {role === 'provider' && (
              <div className="ax-grid2">
                <div className="ax-field">
                  <label htmlFor="ax-category">{isSw ? 'Aina ya huduma' : 'Service category'}</label>
                  <div className="ax-input ax-input--select">
                    <Store size={16} aria-hidden="true" />
                    <GlassSelect
                      id="ax-category"
                      value={vendorCategory}
                      onChange={setVendorCategory}
                      ariaLabel={isSw ? 'Aina ya huduma' : 'Service category'}
                      options={VENDOR_CATEGORIES.map((c) => ({ value: c.id, label: isSw ? c.swLabel : c.label }))}
                    />
                  </div>
                </div>
                <div className="ax-field">
                  <label htmlFor="ax-city">{isSw ? 'Jiji' : 'City'}</label>
                  <div className="ax-input ax-input--combo">
                    <Building2 size={16} aria-hidden="true" />
                    <GlassCombobox
                      id="ax-city"
                      value={vendorLocation}
                      onChange={setVendorLocation}
                      options={CITY_OPTIONS}
                      ariaLabel={isSw ? 'Jiji' : 'City'}
                      placeholder={isSw ? 'Andika jiji lako' : 'Type your city'}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="ax-grid2">
              <div className="ax-field">
                <label htmlFor="ax-reg-password">{isSw ? 'Nenosiri' : 'Password'}</label>
                <div className={`ax-input ${password && !strongEnough ? 'is-invalid' : ''}`}>
                  <Lock size={16} aria-hidden="true" />
                  <input
                    id="ax-reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={isSw ? 'Herufi 6+' : 'Min. 6'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-describedby="ax-pw-hint"
                    required
                  />
                  <button
                    type="button"
                    className="ax-eye"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span id="ax-pw-hint" className={`ax-hint ${password && !strongEnough ? 'is-bad' : ''}`}>
                  {isSw ? 'Angalau herufi 6' : 'At least 6 characters'}
                </span>
              </div>

              <div className="ax-field">
                <label htmlFor="ax-confirm">{isSw ? 'Rudia nenosiri' : 'Confirm password'}</label>
                <div className={`ax-input ${!passwordsMatch ? 'is-invalid' : ''}`}>
                  <Lock size={16} aria-hidden="true" />
                  <input
                    id="ax-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={isSw ? 'Rudia' : 'Repeat it'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-invalid={!passwordsMatch}
                    required
                  />
                  <button
                    type="button"
                    className="ax-eye"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <span className={`ax-hint ${!passwordsMatch ? 'is-bad' : ''}`}>
                    {passwordsMatch
                      ? (isSw ? 'Manenosiri yanalingana' : 'Passwords match')
                      : (isSw ? 'Hayalingani bado' : 'Not matching yet')}
                  </span>
                )}
              </div>
            </div>

            <label className="ax-terms">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                {isSw ? 'Ninakubali ' : 'I agree to the '}
                <a href="/contact">{isSw ? 'vigezo na masharti' : 'terms of service'}</a>
                {isSw ? ' na sera ya faragha.' : ' and privacy policy.'}
              </span>
            </label>

            <button type="submit" className="ax-submit" disabled={loading}>
              {loading ? <><Loader2 size={17} className="ax-spin" /> {isSw ? 'Inaunda akaunti…' : 'Creating your account…'}</> : <>{titles.cta} <ArrowRight size={16} /></>}
            </button>

            <p className="ax-switch">
              {isSw ? 'Tayari una akaunti?' : 'Already have an account?'}{' '}
              <button type="button" onClick={() => go('login', { email })}>{isSw ? 'Ingia' : 'Sign in'}</button>
            </p>
          </form>
        )}

        {/* ---------------- FORGOT ---------------- */}
        {mode === 'forgot' && (
          <form className="ax-form" onSubmit={handleForgot} noValidate>
            <div className="ax-field">
              <label htmlFor="ax-forgot-email">{isSw ? 'Barua pepe uliyosajili nayo' : 'Registered email address'}</label>
              <div className="ax-input">
                <Mail size={16} aria-hidden="true" />
                <input
                  ref={firstFieldRef}
                  id="ax-forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="ax-submit" disabled={loading}>
              {loading ? <><Loader2 size={17} className="ax-spin" /> {isSw ? 'Inatuma…' : 'Sending…'}</> : <>{titles.cta} <ArrowRight size={16} /></>}
            </button>

            <p className="ax-switch">
              <button type="button" onClick={() => go('login', { email })}>
                <ArrowLeft size={13} /> {isSw ? 'Rudi kwenye kuingia' : 'Back to sign in'}
              </button>
            </p>
          </form>
        )}

        {/* ---------------- SENT ---------------- */}
        {mode === 'sent' && (
          <div className="ax-sent">
            <span className="ax-sent__icon"><MailCheck size={26} /></span>
            <p className="ax-sent__text">{sent.message}</p>

            {sent.token && (
              <div className="ax-dev">
                <p>
                  {isSw
                    ? 'Msimbo wako wa kubadilisha nenosiri umeundwa. Unaweza kuendelea hapa:'
                    : 'Your reset code was generated. You can continue right here:'}
                </p>
                <button
                  type="button"
                  className="ax-submit ax-submit--soft"
                  onClick={() => { setResetToken(sent.token); setMode('reset'); setError(null); }}
                >
                  <KeyRound size={16} /> {isSw ? 'Weka nenosiri jipya' : 'Set a new password'}
                </button>
              </div>
            )}

            <button
              type="button"
              className="ax-inline-link ax-inline-link--center"
              onClick={() => { setShowTokenInput(true); setMode('reset'); }}
            >
              {isSw ? 'Nina msimbo wa kubadilisha' : 'I have a reset code'}
            </button>

            <p className="ax-switch">
              <button type="button" onClick={() => go('login', { email })}>
                <ArrowLeft size={13} /> {isSw ? 'Rudi kwenye kuingia' : 'Back to sign in'}
              </button>
            </p>
          </div>
        )}

        {/* ---------------- RESET ---------------- */}
        {mode === 'reset' && (
          <form className="ax-form" onSubmit={handleReset} noValidate>
            {!supabaseAuth && (showTokenInput || !resetToken) && (
              <div className="ax-field">
                <label htmlFor="ax-token">{isSw ? 'Msimbo wa kubadilisha' : 'Reset code'}</label>
                <div className="ax-input">
                  <KeyRound size={16} aria-hidden="true" />
                  <input
                    ref={firstFieldRef}
                    id="ax-token"
                    type="text"
                    placeholder="rst-…"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    autoComplete="one-time-code"
                    required
                  />
                </div>
              </div>
            )}

            <div className="ax-field">
              <label htmlFor="ax-new-password">{isSw ? 'Nenosiri jipya' : 'New password'}</label>
              <div className={`ax-input ${password && !strongEnough ? 'is-invalid' : ''}`}>
                <Lock size={16} aria-hidden="true" />
                <input
                  id="ax-new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder={isSw ? 'Herufi 6+' : '6+ characters'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="ax-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="ax-field">
              <label htmlFor="ax-new-confirm">{isSw ? 'Rudia nenosiri' : 'Confirm new password'}</label>
              <div className={`ax-input ${!passwordsMatch ? 'is-invalid' : ''}`}>
                <Lock size={16} aria-hidden="true" />
                <input
                  id="ax-new-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder={isSw ? 'Rudia' : 'Repeat it'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="ax-eye"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="ax-submit" disabled={loading}>
              {loading ? <><Loader2 size={17} className="ax-spin" /> {isSw ? 'Inahifadhi…' : 'Saving…'}</> : <>{titles.cta} <ArrowRight size={16} /></>}
            </button>

            <p className="ax-switch">
              <button type="button" onClick={() => go('login', { email })}>
                <ArrowLeft size={13} /> {isSw ? 'Rudi kwenye kuingia' : 'Back to sign in'}
              </button>
            </p>
          </form>
        )}

        {/* ---------------- VERIFY EMAIL (Supabase sends the link) ---------------- */}
        {mode === 'verify' && supabaseAuth && (
          <div className="ax-verify-email-link">
            <div className="ax-verify-hero">
              <span className="ax-verify-hero__icon">
                <MailCheck size={28} />
              </span>
              <div className="ax-verify-hero__badge">
                <Mail size={13} />
                <span>{email || initialEmail}</span>
              </div>
            </div>

            <p className="ax-sent__text">
              {isSw
                ? 'Tumekutumia kiungo cha kuthibitisha. Bonyeza kiungo hicho kuamilisha akaunti, kisha ingia.'
                : 'We sent a confirmation link to that address. Click it to activate your account, then sign in.'}
            </p>

            <button
              type="button"
              className="ax-submit ax-submit--soft"
              onClick={async () => {
                setError(null);
                try {
                  await sendVerificationEmail((email || initialEmail).trim());
                  setNotice(isSw ? 'Kiungo kipya kimetumwa.' : 'A new confirmation link has been sent.');
                } catch (err) {
                  setError({ text: err?.message || 'Could not resend the email.', kind: 'generic' });
                }
              }}
            >
              <Mail size={16} /> {isSw ? 'Tuma kiungo tena' : 'Resend confirmation link'}
            </button>

            <p className="ax-switch">
              <button type="button" onClick={() => go('login', { email })}>
                {isSw ? 'Nina akaunti — ingia' : 'I have an account — sign in'}
              </button>
            </p>
          </div>
        )}

        {/* ---------------- VERIFY EMAIL ---------------- */}
        {mode === 'verify' && !supabaseAuth && (
          <form className="ax-form ax-form--verify" onSubmit={handleVerifyEmail} noValidate>
            <div className="ax-verify-hero">
              <span className="ax-verify-hero__icon">
                <ShieldCheck size={28} />
              </span>
              <div className="ax-verify-hero__badge">
                <Mail size={13} />
                <span>{email || initialEmail}</span>
              </div>
            </div>

            <div className="ax-field">
              <label htmlFor="ax-verify-code">
                {isSw ? 'Msimbo wa uthibitisho (tarakimu 6)' : '6-digit verification code'}
              </label>
              <div className="ax-input ax-input--code">
                <KeyRound size={16} aria-hidden="true" />
                <input
                  ref={firstFieldRef}
                  id="ax-verify-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoComplete="one-time-code"
                  required
                />
              </div>
            </div>

            {demoVerificationCode && (
              <div className="ax-dev ax-dev--verify">
                <p>
                  {isSw
                    ? 'Msimbo wa majaribio uliotengenezwa kwa ajili yako:'
                    : 'Simulated verification code for quick testing:'}
                </p>
                <button
                  type="button"
                  className="ax-submit ax-submit--soft"
                  onClick={() => {
                    setVerificationCode(demoVerificationCode);
                    setError(null);
                  }}
                >
                  <KeyRound size={15} />
                  <span>{isSw ? 'Jaza msimbo:' : 'Use code:'} <strong>{demoVerificationCode}</strong></span>
                </button>
              </div>
            )}

            <button
              type="submit"
              className="ax-submit"
              disabled={loading || verificationCode.trim().length < 6}
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="ax-spin" />
                  {isSw ? 'Inathibitisha…' : 'Verifying…'}
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  {titles.cta}
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="ax-verify-actions">
              <button
                type="button"
                className="ax-inline-link"
                onClick={handleResendVerification}
                disabled={resending || resendCooldown > 0}
              >
                {resending ? (
                  <>
                    <Loader2 size={13} className="ax-spin" /> {isSw ? 'Inatuma tena…' : 'Resending…'}
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    {isSw ? `Tuma tena baada ya ${resendCooldown}s` : `Resend in ${resendCooldown}s`}
                  </>
                ) : (
                  <>
                    {isSw ? 'Hukuipata? Tuma tena msimbo' : 'Didn’t receive it? Resend code'}
                  </>
                )}
              </button>

              <button
                type="button"
                className="ax-inline-link ax-inline-link--muted"
                onClick={() => finish(role === 'provider' ? '/provider' : '/dashboard')}
              >
                {isSw ? 'Nitatibitisha baadaye →' : 'I’ll verify later (Skip) →'}
              </button>
            </div>

            <p className="ax-switch">
              <button type="button" onClick={() => go('login', { email })}>
                <ArrowLeft size={13} /> {isSw ? 'Rudi kwenye kuingia' : 'Back to sign in'}
              </button>
            </p>
          </form>
        )}

        <p className="ax-legal">
          <ShieldCheck size={13} />
          {isSw ? 'Taarifa zako zinalindwa. Malipo yako yanalindwa na escrow.' : 'Your details stay private. Payments are protected by escrow.'}
        </p>
      </section>
    </div>
  );
}
