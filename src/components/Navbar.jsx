import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal';
import { Heart, Sparkles, User, Bookmark, LogOut } from 'lucide-react';

const roles = [
  { id: 'customer', label: 'Couple (John & Sarah)', icon: '💍' },
  { id: 'provider', label: 'Vendor (Grand Imperial)', icon: '🏰' },
  { id: 'admin', label: 'MY DAY Admin', icon: '⚡' },
];

function Navbar() {
  const { role, switchRole, user, isLoggedIn, logoutUser, bookings } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    switchRole(newRole);
    if (newRole === 'customer') navigate('/dashboard');
    if (newRole === 'provider') navigate('/provider');
    if (newRole === 'admin') navigate('/admin');
  };

  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #EAE7E1',
      position: 'sticky',
      top: 0,
      zIndex: 900
    }}>
      {/* Top Notification & Role Switcher Banner */}
      <div style={{
        background: 'var(--color-dark)',
        color: '#FAF9F6',
        fontSize: '0.8rem',
        padding: '0.35rem 1rem'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} color="var(--color-primary)" />
            <span>MY DAY — Tanzania's Premier All-in-One Wedding Services Marketplace</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ opacity: 0.85 }}>Demo Role Switcher:</span>
            <select
              value={role}
              onChange={handleRoleChange}
              style={{
                background: '#ffffff',
                color: '#212121',
                border: 'none',
                borderRadius: '0.25rem',
                padding: '0.15rem 0.4rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.icon} {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 72 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800
          }}>
            <Heart size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.45rem', fontWeight: 900, fontFamily: 'var(--font-header)', color: 'var(--color-dark)', letterSpacing: '0.05em' }}>
              MY DAY
            </span>
            <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '-4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Wedding Marketplace
            </div>
          </div>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.88rem', fontWeight: 600 }}>
          <Link to="/" style={{ color: location.pathname === '/' ? 'var(--color-primary-dark)' : '#444' }}>
            Home
          </Link>
          <Link to="/marketplace" style={{ color: location.pathname === '/marketplace' ? 'var(--color-primary-dark)' : '#444' }}>
            Browse Services
          </Link>
          <Link to="/wedding" style={{ color: location.pathname === '/wedding' ? 'var(--color-primary-dark)' : '#444' }}>
            Wedding Profile
          </Link>

          {role === 'customer' && (
            <>
              <Link to="/dashboard" style={{ color: location.pathname === '/dashboard' ? 'var(--color-primary-dark)' : '#444' }}>
                Event Dashboard
              </Link>
              <Link to="/bookings" style={{ color: location.pathname === '/bookings' ? 'var(--color-primary-dark)' : '#444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Bookmark size={14} /> My Bookings ({bookings.length})
              </Link>
            </>
          )}

          <Link to="/become-vendor" style={{ color: location.pathname === '/become-vendor' ? 'var(--color-primary-dark)' : '#444' }}>
            Become a Vendor
          </Link>
          <Link to="/contact" style={{ color: location.pathname === '/contact' ? 'var(--color-primary-dark)' : '#444' }}>
            Contact Us
          </Link>

          {role === 'provider' && (
            <Link to="/provider" style={{ background: 'var(--color-dark)', color: '#fff', padding: '0.45rem 0.85rem', borderRadius: '0.5rem' }}>
              Provider Portal
            </Link>
          )}

          {role === 'admin' && (
            <Link to="/admin" style={{ background: '#C62828', color: '#fff', padding: '0.45rem 0.85rem', borderRadius: '0.5rem' }}>
              Admin Console
            </Link>
          )}

          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-muted)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-pill)' }}>
              <User size={15} color="var(--color-primary-dark)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark)' }}>{user.name}</span>
              <button
                onClick={logoutUser}
                title="Log Out"
                style={{ background: 'none', border: 'none', color: '#888', padding: '0.2rem', boxShadow: 'none', display: 'inline-flex' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                background: 'var(--color-primary)',
                color: '#ffffff',
                padding: '0.45rem 0.9rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <User size={15} /> Login / Register
            </button>
          )}
        </div>
      </nav>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </header>
  );
}

export default Navbar;
