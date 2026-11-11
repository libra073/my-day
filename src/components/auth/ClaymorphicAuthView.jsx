import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import api from '../../services/api';
import {
  Heart, Mail, Lock, User, Eye, EyeOff, ShieldCheck,
  Sparkles, Phone, ArrowLeft, Building2, Store, CheckCircle2
} from 'lucide-react';

const VENDOR_CATEGORIES = [
  { id: 'kumbi', nameKey: 'cat_venues_title', defaultName: 'Kumbi (Venues)' },
  { id: 'wapambaji', nameKey: 'cat_decorators_title', defaultName: 'Wapambaji (Decorators)' },
  { id: 'entertainment', nameKey: 'cat_entertainment_title', defaultName: 'MCs & Entertainment' },
  { id: 'catering', nameKey: 'cat_catering_title', defaultName: 'Catering' },
  { id: 'saloon', nameKey: 'cat_saloon_title', defaultName: 'Saloon & Beauty' },
  { id: 'transport', nameKey: 'cat_transport_title', defaultName: 'Transport' },
];

export default function ClaymorphicAuthView({
  initialTab = 'login',
  isModal = false,
  onClose,
  onSuccess
}) {
  const { loginUser, registerUser, t, language = 'en' } = useAppContext();
  const navigate = useNavigate();
  const isSw = language === 'sw';

  // Tabs: 'login' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState(initialTab || 'login');
  const [selectedRole, setSelectedRole] = useState('customer'); // 'customer' | 'provider' | 'admin'
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vendorCategory, setVendorCategory] = useState('kumbi');
  const [vendorLocation, setVendorLocation] = useState('Dar es Salaam');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', text: '' });
    setLoading(true);
    try {
      await loginUser({ email, password, role: selectedRole, name });
      setFeedback({ type: 'success', text: isSw ? 'Umefanikiwa kuingia!' : 'Login successful!' });
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
        if (!isModal) navigate('/dashboard');
      }, 400);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || (isSw ? 'Kuingia kumeshindikana. Tafadhali hakiki maelezo yako.' : 'Login failed. Please verify your credentials.') });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', text: '' });
    if (password !== confirmPassword) {
      setFeedback({ type: 'error', text: t('auth_validation_mismatch', 'Passwords do not match.') });
      return;
    }
    if (!agreeTerms) {
      setFeedback({ type: 'error', text: t('auth_validation_terms', 'Please agree to terms.') });
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: name.trim() || (selectedRole === 'customer' ? 'Wedding Couple' : 'Partner Vendor'),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role: selectedRole
      });
      setFeedback({ type: 'success', text: isSw ? 'Akaunti imeundwa kwa mafanikio!' : 'Account created successfully!' });
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
        if (!isModal) navigate(selectedRole === 'provider' ? '/provider' : '/dashboard');
      }, 500);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || (isSw ? 'Usajili umeshindikana. Tafadhali jaribu tena.' : 'Registration failed. Please try again.') });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', text: '' });
    if (!email) {
      setFeedback({ type: 'error', text: isSw ? 'Tafadhali weka barua pepe yako kwanza.' : 'Please enter your email address first.' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setFeedback({ type: 'success', text: res.message || t('auth_link_sent', 'Password reset instructions have been sent to your email!') });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || (isSw ? 'Hitilafu imetokea wakati wa kurejesha nenosiri.' : 'Could not process password reset request.') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clay-auth-backdrop">
      {/* 3D Scene Ambient Room Background */}
      <div className="clay-auth-scene">
        {/* Background 3D Hanging Pendant Lamp (Standalone Page Only) */}
        {!isModal && (
          <div className="clay-scene-lamp" aria-hidden="true">
            <div className="clay-lamp-cord" />
            <div className="clay-lamp-shade" />
            <div className="clay-lamp-glow" />
          </div>
        )}

        {/* Standalone Page Back Link */}
        {!isModal && (
          <Link to="/" className="clay-auth-back-link">
            <ArrowLeft size={16} />
            <span>{isSw ? 'Rudi Nyumbani' : 'Back to Home'}</span>
          </Link>
        )}

        {/* 3D Stage Composition (Ebony Girl + Giant Phone Card) */}
        <div className="clay-auth-stage">
          {/* ═════════════════════════════════════════════════════════════
              THE 3D EBONY CHARACTER (Only rendered on Auth views!)
              Pixar/Disney 3D styled friendly young Black woman with
              rich dark skin, afro-puff bun, lilac hoodie, white joggers
              and purple sneakers, leaning against the giant phone card.
              ═════════════════════════════════════════════════════════════ */}
          <div className="clay-ebony-character-wrap">
            <img
              src="/images/ebony-character.png"
              alt="MY DAY 3D Companion"
              className="clay-ebony-character-img"
              loading="eager"
            />
          </div>

          {/* ═════════════════════════════════════════════════════════════
              GIANT 3D SMARTPHONE MOCKUP CARD
              Exact claymorphic white phone body with soft pill inputs,
              3D icon, purple action button, and social pills.
              ═════════════════════════════════════════════════════════════ */}
          <div className="clay-phone-card">
            {/* Close Button for Modal Mode */}
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="clay-auth-close-btn"
                aria-label="Close"
              >
                <span className="clay-close-glyph" aria-hidden="true">×</span>
              </button>
            )}

            {/* Top 3D App Icon Badge */}
            <div className="clay-app-badge-box">
              <div className="clay-app-badge">
                {/* 3D Rings / Heart Icon */}
                <div className="clay-badge-emblem">
                  <Heart size={30} fill="var(--color-primary, #0071E3)" color="var(--color-primary, #0071E3)" />
                  <span className="clay-badge-sparkle sparkle-top">✨</span>
                  <span className="clay-badge-sparkle sparkle-right">⭐</span>
                </div>
              </div>
            </div>

            {/* Header Titles */}
            <div className="clay-phone-header">
              <h2 className="clay-phone-title">
                {activeTab === 'login' && (isSw ? 'Karibu Tena!' : 'Welcome Back!')}
                {activeTab === 'register' && (isSw ? 'Unda Akaunti!' : 'Create Account!')}
                {activeTab === 'forgot' && (isSw ? 'Umesahau Nenosiri?' : 'Reset Password')}
              </h2>
              <p className="clay-phone-subtitle">
                {activeTab === 'login' && (isSw ? 'Tafadhali ingia ili kuendelea' : 'Please login to continue')}
                {activeTab === 'register' && (isSw ? 'Jiunge na jukwaa nambari moja la harusi' : 'Join Tanzania’s #1 wedding platform')}
                {activeTab === 'forgot' && (isSw ? 'Weka barua pepe yako ili kubadilisha nenosiri' : 'Enter your email to receive recovery instructions')}
              </p>
            </div>

            {/* Role Switcher Pill: Couple vs Vendor (Available on Login & Register) */}
            {activeTab !== 'forgot' && (
              <div className="clay-role-pill-bar">
                <button
                  type="button"
                  onClick={() => setSelectedRole('customer')}
                  className={`clay-role-pill ${selectedRole === 'customer' ? 'is-active' : ''}`}
                >
                  <Heart size={14} />
                  <span>{isSw ? 'Mwanandoa (Couple)' : 'Couple'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('provider')}
                  className={`clay-role-pill ${selectedRole === 'provider' ? 'is-active' : ''}`}
                >
                  <Store size={14} />
                  <span>{isSw ? 'Mtoa Huduma (Vendor)' : 'Vendor'}</span>
                </button>
              </div>
            )}

            {/* Notification Feedback */}
            {feedback.text && (
              <div className={`clay-feedback-alert ${feedback.type}`}>
                {feedback.type === 'success' && <CheckCircle2 size={16} />}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                1. LOG IN VIEW
                ───────────────────────────────────────────────────────── */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="clay-form">
                {/* Username / Email Pill Input */}
                <div className="clay-input-pill-wrap">
                  <span className="clay-input-icon">
                    <User size={18} color="var(--color-primary, #0A84FF)" />
                  </span>
                  <input
                    type="text"
                    placeholder={isSw ? 'Barua Pepe / Nambari ya Simu' : 'Username / Email'}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="clay-input-pill"
                    required
                  />
                </div>

                {/* Password Pill Input */}
                <div className="clay-input-pill-wrap">
                  <span className="clay-input-icon">
                    <Lock size={18} color="var(--color-primary, #0A84FF)" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isSw ? 'Nenosiri' : 'Password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="clay-input-pill"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="clay-input-eye-btn"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                  </button>
                </div>

                {/* Forgot Password Link */}
                <div className="clay-forgot-row">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot'); setFeedback({ type: '', text: '' }); }}
                    className="clay-forgot-link"
                  >
                    {isSw ? 'Umesahau Nenosiri?' : 'Forgot Password?'}
                  </button>
                </div>

                {/* Soft 3D Purple Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="clay-btn-primary"
                >
                  {loading ? (isSw ? 'Inaingia...' : 'Logging in...') : (isSw ? 'Ingia' : 'Login')}
                </button>

                {/* Footer Switcher to Sign Up */}
                <div className="clay-footer-switcher">
                  <span>{isSw ? 'Huna akaunti?' : "Don't have an account?"}</span>{' '}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('register'); setFeedback({ type: '', text: '' }); }}
                    className="clay-switch-text-btn"
                  >
                    {isSw ? 'Unda Akaunti (Sign Up)' : 'Sign Up'}
                  </button>
                </div>
              </form>
            )}

            {/* ─────────────────────────────────────────────────────────
                2. CREATING ACCOUNT (SIGN UP) VIEW
                ───────────────────────────────────────────────────────── */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="clay-form">
                {/* Full Name / Couple Name */}
                <div className="clay-input-pill-wrap">
                  <span className="clay-input-icon">
                    <User size={18} color="var(--color-primary, #0A84FF)" />
                  </span>
                  <input
                    type="text"
                    placeholder={selectedRole === 'customer' ? (isSw ? 'Jina la Maharusi (Mfano: Baraka & Rehema)' : 'Couple Names (e.g. Baraka & Rehema)') : (isSw ? 'Jina la Biashara (Mfano: Imperial Floral)' : 'Business Name (e.g. Imperial Floral)')}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="clay-input-pill"
                    required
                  />
                </div>

                {/* Vendor Category & City when Vendor selected */}
                {selectedRole === 'provider' && (
                  <div className="clay-input-row-2">
                    <div className="clay-input-pill-wrap">
                      <select
                        value={vendorCategory}
                        onChange={e => setVendorCategory(e.target.value)}
                        className="clay-input-pill clay-select-pill"
                      >
                        {VENDOR_CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>
                            {t(c.nameKey, c.defaultName)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="clay-input-pill-wrap">
                      <input
                        type="text"
                        placeholder="Dar es Salaam"
                        value={vendorLocation}
                        onChange={e => setVendorLocation(e.target.value)}
                        className="clay-input-pill"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div className="clay-input-pill-wrap">
                  <span className="clay-input-icon">
                    <Mail size={18} color="var(--color-primary, #0A84FF)" />
                  </span>
                  <input
                    type="email"
                    placeholder={isSw ? 'Barua Pepe (email@example.com)' : 'Email (email@example.com)'}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="clay-input-pill"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="clay-input-pill-wrap">
                  <span className="clay-input-icon">
                    <Phone size={18} color="var(--color-primary, #0A84FF)" />
                  </span>
                  <input
                    type="tel"
                    placeholder="+255 700 000 000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="clay-input-pill"
                    required
                  />
                </div>

                {/* Password & Confirm Password */}
                <div className="clay-input-row-2">
                  <div className="clay-input-pill-wrap">
                    <span className="clay-input-icon">
                      <Lock size={16} color="var(--color-primary, #0A84FF)" />
                    </span>
                    <input
                      type="password"
                      placeholder={isSw ? 'Nenosiri' : 'Password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="clay-input-pill"
                      required
                    />
                  </div>
                  <div className="clay-input-pill-wrap">
                    <span className="clay-input-icon">
                      <Lock size={16} color="var(--color-primary, #0A84FF)" />
                    </span>
                    <input
                      type="password"
                      placeholder={isSw ? 'Rudia Nenosiri' : 'Confirm'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="clay-input-pill"
                      required
                    />
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="clay-terms-wrap">
                  <input
                    type="checkbox"
                    id="clayTerms"
                    checked={agreeTerms}
                    onChange={e => setAgreeTerms(e.target.checked)}
                    className="clay-checkbox"
                  />
                  <label htmlFor="clayTerms" className="clay-terms-label">
                    {isSw ? 'Ninakubali Vigezo na Masharti ya MY DAY' : 'I agree to the Terms of Service & Privacy Policy'}
                  </label>
                </div>

                {/* 3D Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="clay-btn-primary"
                >
                  {loading ? (isSw ? 'Inaunda akaunti...' : 'Creating account...') : (isSw ? 'Unda Akaunti Sasa' : 'Create Account')}
                </button>

                {/* Footer Switcher to Log In */}
                <div className="clay-footer-switcher">
                  <span>{isSw ? 'Tayari una akaunti?' : 'Already have an account?'}</span>{' '}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setFeedback({ type: '', text: '' }); }}
                    className="clay-switch-text-btn"
                  >
                    {isSw ? 'Ingia (Log In)' : 'Log In'}
                  </button>
                </div>
              </form>
            )}

            {/* ─────────────────────────────────────────────────────────
                3. FORGOT PASSWORD VIEW
                ───────────────────────────────────────────────────────── */}
            {activeTab === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="clay-form">
                <div className="clay-input-pill-wrap">
                  <span className="clay-input-icon">
                    <Mail size={18} color="var(--color-primary, #0A84FF)" />
                  </span>
                  <input
                    type="email"
                    placeholder={isSw ? 'Barua Pepe Yako Iliyosajiliwa' : 'Your Registered Email Address'}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="clay-input-pill"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="clay-btn-primary"
                >
                  {loading ? (isSw ? 'Inatuma maelezo...' : 'Sending instructions...') : (isSw ? 'Tuma Maelekezo ya Nenosiri' : 'Send Reset Link')}
                </button>

                <div className="clay-footer-switcher">
                  <span>{isSw ? 'Unakumbuka nenosiri lako?' : 'Remember your password?'}</span>{' '}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setFeedback({ type: '', text: '' }); }}
                    className="clay-switch-text-btn"
                  >
                    {isSw ? 'Rudi Kwenye Kuingia' : 'Back to Login'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* AURA Gold Security & Escrow Trust Bar */}
        <div className="aura-auth-trust-bar" aria-label="Security and Trust">
          <div className="aura-trust-subtext">
            <span>{isSw ? 'Inaendeshwa na Mfumo Salama wa MY DAY Escrow' : 'Powered by the MY DAY Security & Escrow Network.'}</span>
            <span className="aura-divider-pipe">|</span>
            <a href="mailto:support@myday.co.tz" className="aura-contact-link">{isSw ? 'Msaada kwa Wateja' : 'Contact Support'}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
