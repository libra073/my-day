import React, { useState, useEffect } from 'react';
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
  const { role, switchRole, user, isLoggedIn, logoutUser, bookings, language, setLanguage, t } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY === 0) {
        setIsBannerVisible(true);
        lastScrollY = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollY;

      if (Math.abs(diff) > 15) {
        if (diff > 0) {
          setIsBannerVisible(false);
        } else {
          setIsBannerVisible(true);
        }
        lastScrollY = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    switchRole(newRole);
    if (newRole === 'customer') navigate('/dashboard');
    if (newRole === 'provider') navigate('/provider');
    if (newRole === 'admin') navigate('/admin');
  };

  const navLinkStyle = (path) => ({
    color: location.pathname === path ? 'var(--color-text)' : 'var(--color-text-inverse)',
    fontSize: '0.88rem',
    fontWeight: location.pathname === path ? 700 : 500,
    padding: '0.45rem 0.9rem',
    borderRadius: 'var(--radius-pill)',
    background: location.pathname === path ? '#FFFFFF' : 'transparent',
    boxShadow: location.pathname === path ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
    transition: 'var(--transition)',
  });

  return (
    <header
      style={{
        background: 'var(--color-header-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'sticky',
        top: isBannerVisible ? 0 : -40,
        zIndex: 900,
        transition: 'top 300ms ease-in-out',
        willChange: 'top',
      }}
    >
      {/* Top Notification & Role Switcher Banner */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.15)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          color: 'var(--color-text-inverse)',
          fontSize: '0.8rem',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center',
          opacity: isBannerVisible ? 1 : 0,
          overflow: 'hidden',
          transition: 'opacity 300ms ease-in-out',
          boxSizing: 'border-box',
          padding: '4px 0',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <Sparkles size={14} color="var(--color-accent)" />
            <span>{t('hero_badge')}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ opacity: 0.8, fontWeight: 500 }}>{t('quick_demo')}</span>
            <select
              value={role}
              onChange={handleRoleChange}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--color-text-inverse)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.35rem',
                padding: '0.15rem 0.4rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {roles.map(r => (
                <option key={r.id} value={r.id} style={{ background: '#FFFFFF', color: '#3B2B1F' }}>
                  {r.icon} {r.label}
                </option>
              ))}
            </select>

            <span style={{ opacity: 0.3 }}>|</span>

            {/* Language Selector Dropdown */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                background: 'transparent',
                color: 'var(--color-text-inverse)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.35rem',
                padding: '0.1rem 0.35rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="en" style={{ background: '#FFFFFF', color: '#3B2B1F' }}>🇬🇧 English</option>
              <option value="sw" style={{ background: '#FFFFFF', color: '#3B2B1F' }}>🇹🇿 Kiswahili</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 72, flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem 1.25rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            boxShadow: 'var(--shadow-glow)',
          }}>
            <Heart size={22} fill="#FFFFFF" />
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-header)', color: 'var(--color-text-inverse)', letterSpacing: '0.03em' }}>
              MY DAY
            </span>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-primary-light)', marginTop: '-4px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              {t('nav_browse') === 'Tafuta Huduma' ? 'Soko la Harusi' : 'Wedding Marketplace'}
            </div>
          </div>
        </Link>

        <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <Link to="/" style={navLinkStyle('/')}>
            {t('nav_home')}
          </Link>
          <Link to="/planner" style={{
            ...navLinkStyle('/planner'),
            color: location.pathname === '/planner' ? 'var(--color-accent)' : '#F5A623',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <Sparkles size={14} color="#F5A623" />
            <span>{t('ai_planner', 'AI Planner')}</span>
          </Link>
          <Link to="/marketplace" style={navLinkStyle('/marketplace')}>
            {t('nav_browse')}
          </Link>
          <Link to="/wedding" style={navLinkStyle('/wedding')}>
            {t('nav_profile')}
          </Link>

          {role === 'customer' && (
            <>
              <Link to="/dashboard" style={navLinkStyle('/dashboard')}>
                {t('nav_dashboard')}
              </Link>
              <Link to="/bookings" style={{ ...navLinkStyle('/bookings'), display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Bookmark size={14} /> {t('nav_bookings')} ({bookings.length})
              </Link>
            </>
          )}

          <Link to="/become-vendor" style={navLinkStyle('/become-vendor')}>
            {t('nav_become_vendor')}
          </Link>
          <Link to="/contact" style={navLinkStyle('/contact')}>
            {t('nav_contact')}
          </Link>

          {role === 'provider' && (
            <Link to="/provider" style={{
              background: 'var(--color-accent)',
              color: '#FFFFFF',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.85rem',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)',
            }}>
              {t('nav_provider_portal')}
            </Link>
          )}

          {role === 'admin' && (
            <Link to="/admin" style={{
              background: '#C53030',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}>
              {t('nav_admin_console')}
            </Link>
          )}

          {isLoggedIn ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#FFFFFF',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <User size={15} color="var(--color-primary)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>{user.name}</span>
              <button
                onClick={logoutUser}
                title={t('nav_logout')}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', padding: '0.2rem', boxShadow: 'none', display: 'inline-flex' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <User size={15} /> {t('nav_login_register')}
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
