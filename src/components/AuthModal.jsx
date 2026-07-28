import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { X, Heart, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const VENDOR_CATEGORIES = [
  { id: 'kumbi', name: 'Kumbi (Venues)' },
  { id: 'wapambaji', name: 'Wapambaji (Decorators)' },
  { id: 'entertainment', name: 'MCs & Entertainment' },
  { id: 'catering', name: 'Catering' },
  { id: 'saloon', name: 'Saloon & Beauty' },
  { id: 'transport', name: 'Transport' },
];

function AuthModal({ onClose, onSuccess }) {
  const { loginUser, registerUser, switchRole } = useAppContext();

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

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loginUser({ email, role: selectedRole, name });
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match. Please verify your password.');
      return;
    }
    if (!agreeTerms) {
      alert('Please agree to the Terms and Conditions to proceed.');
      return;
    }

    registerUser({
      name: name || (selectedRole === 'customer' ? 'John & Sarah' : 'New Vendor'),
      email,
      phone,
      role: selectedRole
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  const handleQuickDemoLogin = (roleKey) => {
    switchRole(roleKey);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(11, 37, 28, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
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
            background: 'var(--color-muted)',
            color: 'var(--color-dark)',
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
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Heart size={24} />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-dark)', marginBottom: '0.2rem' }}>
            {activeTab === 'login' ? 'Welcome Back to MY DAY' : 'Join MY DAY Wedding Platform'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {activeTab === 'login'
              ? 'Access your wedding profile, bookings, and budget dashboard'
              : 'Create an account as a Couple or Partner Vendor'}
          </p>
        </div>

        {/* Tab Toggle Control */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'var(--color-muted)',
          padding: '0.25rem',
          borderRadius: 'var(--radius)',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            style={{
              background: activeTab === 'login' ? '#ffffff' : 'transparent',
              color: activeTab === 'login' ? 'var(--color-dark)' : 'var(--color-text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              padding: '0.55rem',
              borderRadius: '0.5rem',
              boxShadow: activeTab === 'login' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            style={{
              background: activeTab === 'register' ? '#ffffff' : 'transparent',
              color: activeTab === 'register' ? 'var(--color-dark)' : 'var(--color-text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              padding: '0.55rem',
              borderRadius: '0.5rem',
              boxShadow: activeTab === 'register' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Account Role Selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
            Account Role
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => setSelectedRole('customer')}
              style={{
                background: selectedRole === 'customer' ? 'var(--color-primary)' : 'var(--color-muted)',
                color: selectedRole === 'customer' ? '#ffffff' : 'var(--color-text)',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.5rem 0.25rem',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'none'
              }}
            >
              💍 Couple
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('provider')}
              style={{
                background: selectedRole === 'provider' ? 'var(--color-dark)' : 'var(--color-muted)',
                color: selectedRole === 'provider' ? '#ffffff' : 'var(--color-text)',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.5rem 0.25rem',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'none'
              }}
            >
              🏰 Vendor
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              style={{
                background: selectedRole === 'admin' ? '#C62828' : 'var(--color-muted)',
                color: selectedRole === 'admin' ? '#ffffff' : 'var(--color-text)',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.5rem 0.25rem',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'none'
              }}
            >
              ⚡ Admin
            </button>
          </div>
        </div>

        {/* SIGN IN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Email Address or Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#888" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
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
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
                <a href="#forgot" onClick={e => { e.preventDefault(); alert('Password reset link sent to your email address!'); }} style={{ fontSize: '0.78rem', color: 'var(--color-primary-dark)' }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#888" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
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
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', padding: 0, boxShadow: 'none' }}
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
                marginBottom: '1.25rem'
              }}
            >
              Sign In to MY DAY
            </button>

            {/* Quick Demo Login Presets */}
            <div style={{ borderTop: '1px solid #EAE7E1', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Demo Presets
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('customer')}
                  style={{ flex: 1, background: '#FAF9F6', border: '1px solid #DDD', color: '#333', fontSize: '0.75rem', padding: '0.4rem', boxShadow: 'none' }}
                >
                  Demo Couple
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('provider')}
                  style={{ flex: 1, background: '#FAF9F6', border: '1px solid #DDD', color: '#333', fontSize: '0.75rem', padding: '0.4rem', boxShadow: 'none' }}
                >
                  Demo Vendor
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  style={{ flex: 1, background: '#FAF9F6', border: '1px solid #DDD', color: '#333', fontSize: '0.75rem', padding: '0.4rem', boxShadow: 'none' }}
                >
                  Demo Admin
                </button>
              </div>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                {selectedRole === 'customer' ? 'Couple / Full Name' : selectedRole === 'provider' ? 'Business Name' : 'Administrator Name'}
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#888" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder={selectedRole === 'customer' ? 'E.g. John & Sarah' : 'E.g. Imperial Floral & Decor'}
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
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Category</label>
                  <select value={vendorCategory} onChange={e => setVendorCategory(e.target.value)}>
                    {VENDOR_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>City</label>
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Phone Number</label>
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Confirm Password</label>
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
              <label htmlFor="terms">I agree to MY DAY's Terms of Service and Privacy Policy</label>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                background: 'var(--color-primary)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '0.85rem'
              }}
            >
              Create Account & Launch Profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
