import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import { X, Heart, Mail, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const VENDOR_CATEGORIES = [
  { id: 'kumbi', nameKey: 'cat_venues_title', defaultName: 'Kumbi (Venues)' },
  { id: 'wapambaji', nameKey: 'cat_decorators_title', defaultName: 'Wapambaji (Decorators)' },
  { id: 'entertainment', nameKey: 'cat_entertainment_title', defaultName: 'MCs & Entertainment' },
  { id: 'catering', nameKey: 'cat_catering_title', defaultName: 'Catering' },
  { id: 'saloon', nameKey: 'cat_saloon_title', defaultName: 'Saloon & Beauty' },
  { id: 'transport', nameKey: 'cat_transport_title', defaultName: 'Transport' },
];

function AuthModal({ onClose, onSuccess }) {
  const { loginUser, registerUser, t } = useAppContext();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState('customer'); // 'customer' | 'provider' | 'admin'
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vendorCategory, setVendorCategory] = useState('kumbi');
  const [vendorLocation, setVendorLocation] = useState('Dar es Salaam');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser({ email, password, role: selectedRole, name });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert(t('auth_validation_mismatch'));
      return;
    }
    if (!agreeTerms) {
      alert(t('auth_validation_terms'));
      return;
    }

    try {
      await registerUser({
        name: name.trim() || (selectedRole === 'customer' ? 'Wedding Account' : 'Partner Vendor'),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role: selectedRole
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(59, 43, 31, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '1rem'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        maxWidth: '480px',
        width: '100%',
        padding: '2rem',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Close Button */}
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

        {/* Modal Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--color-primary)',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Heart size={24} fill="#FFFFFF" />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-text)', marginBottom: '0.2rem', fontWeight: 800 }}>
            {activeTab === 'login' ? t('auth_welcome') : t('auth_join')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {activeTab === 'login'
              ? t('auth_access_profile')
              : t('auth_create_account')}
          </p>
        </div>

        {/* Tab Toggle Control */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'var(--color-surface-soft)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-pill)',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            style={{
              background: activeTab === 'login' ? '#ffffff' : 'transparent',
              color: activeTab === 'login' ? 'var(--color-text)' : 'var(--color-text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              padding: '0.55rem',
              borderRadius: 'var(--radius-pill)',
              boxShadow: activeTab === 'login' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            {t('auth_signin')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            style={{
              background: activeTab === 'register' ? '#ffffff' : 'transparent',
              color: activeTab === 'register' ? 'var(--color-text)' : 'var(--color-text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              padding: '0.55rem',
              borderRadius: 'var(--radius-pill)',
              boxShadow: activeTab === 'register' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            {t('auth_create_account_tab')}
          </button>
        </div>

        {/* Account Role Selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
            {t('auth_role_label')}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => setSelectedRole('customer')}
              style={{
                background: selectedRole === 'customer' ? 'var(--color-primary)' : 'var(--color-surface-soft)',
                color: selectedRole === 'customer' ? '#ffffff' : 'var(--color-text)',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.55rem 0.25rem',
                borderRadius: 'var(--radius-pill)',
                boxShadow: 'none'
              }}
            >
              {t('auth_role_couple')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('provider')}
              style={{
                background: selectedRole === 'provider' ? 'var(--color-accent)' : 'var(--color-surface-soft)',
                color: selectedRole === 'provider' ? '#ffffff' : 'var(--color-text)',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.55rem 0.25rem',
                borderRadius: 'var(--radius-pill)',
                boxShadow: 'none'
              }}
            >
              {t('auth_role_vendor')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              style={{
                background: selectedRole === 'admin' ? '#C53030' : 'var(--color-surface-soft)',
                color: selectedRole === 'admin' ? '#ffffff' : 'var(--color-text)',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.55rem 0.25rem',
                borderRadius: 'var(--radius-pill)',
                boxShadow: 'none'
              }}
            >
              {t('auth_role_admin')}
            </button>
          </div>
        </div>

        {/* SIGN IN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>
                {t('auth_email_or_phone')}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--color-text-dim)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{t('auth_password_label')}</label>
                <a
                  href="#forgot"
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!email) {
                      alert('Please enter your email address in the field above first.');
                      return;
                    }
                    try {
                      const res = await api.forgotPassword(email);
                      alert(res.message || t('auth_link_sent'));
                    } catch (err) {
                      alert(err.message || 'Could not process password reset request.');
                    }
                  }}
                  style={{ fontSize: '0.78rem', color: 'var(--color-primary-hover)' }}
                >
                  {t('auth_forgot')}
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--color-text-dim)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-dim)', padding: 0, boxShadow: 'none' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                background: 'var(--color-primary)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '0.85rem',
                borderRadius: 'var(--radius-pill)',
                boxShadow: 'var(--shadow-glow)',
                marginBottom: '1.25rem'
              }}
            >
              {t('auth_sign_in_btn')}
            </button>

            {/* Trust Assurance Badge */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                <ShieldCheck size={15} color="var(--color-primary)" />
                <span>256-bit Encrypted & Verified Escrow Protection</span>
              </div>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>
                {selectedRole === 'customer' ? t('auth_name_couple') : selectedRole === 'provider' ? t('auth_name_vendor') : t('auth_name_admin')}
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--color-text-dim)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder={selectedRole === 'customer' ? 'E.g. Baraka & Rehema' : 'E.g. Imperial Floral & Decor'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            {selectedRole === 'provider' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>{t('auth_category_label')}</label>
                  <select value={vendorCategory} onChange={e => setVendorCategory(e.target.value)}>
                    {VENDOR_CATEGORIES.map(c => <option key={c.id} value={c.id}>{t(c.nameKey)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>{t('auth_city_label')}</label>
                  <input
                    type="text"
                    value={vendorLocation}
                    onChange={e => setVendorLocation(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>{t('auth_email_label')}</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>{t('auth_phone_label')}</label>
                <input
                  type="text"
                  placeholder="+255 700 000 000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>{t('auth_password_label')}</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>{t('auth_confirm_password')}</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                style={{ width: 'auto' }}
              />
              <label htmlFor="terms">{t('auth_agree_terms')}</label>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                background: 'var(--color-primary)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '0.85rem',
                borderRadius: 'var(--radius-pill)',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              {t('auth_create_btn')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
