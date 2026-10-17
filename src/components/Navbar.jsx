import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal';
import NotificationBell from './NotificationBell';
import { Heart, Sparkles, User, LogOut, Menu, X, ChevronRight, Phone, ShieldCheck } from 'lucide-react';

function Navbar() {
  const { role, user, isLoggedIn, logoutUser, bookings, language, setLanguage, t } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef(null);
  const progressRef = useRef(null);
  const isHiddenRef = useRef(false);
  const isScrolledRef = useRef(false);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Stable, zero-shake scroll behaviour:
  // - Top safe-zone (y <= 120): Always fully visible, never hides
  // - Hysteresis on isScrolled (scrolled at > 40px, unscrolled at < 15px)
  // - Accumulated delta buffer prevents micro-scroll flapping and trackpad vibration
  useEffect(() => {
    let lastY = typeof window !== 'undefined' ? window.scrollY : 0;
    let accumulatedDelta = 0;
    let ticking = false;

    const update = () => {
      const y = Math.max(0, window.scrollY);
      const diff = y - lastY;

      // 1. Scrolled state with 25px hysteresis gap to eliminate bouncing
      const nextScrolled = y > 40 ? true : (y < 15 ? false : isScrolledRef.current);
      if (nextScrolled !== isScrolledRef.current) {
        isScrolledRef.current = nextScrolled;
        setIsScrolled(nextScrolled);
      }

      // 2. Hide/Show logic with top safe-zone and accumulated delta buffer
      const hasFocusInside = headerRef.current && headerRef.current.matches(':focus-within');
      let nextHidden = isHiddenRef.current;

      if (y <= 120 || hasFocusInside) {
        nextHidden = false;
        accumulatedDelta = 0;
      } else {
        // If scroll direction reversed, reset accumulated delta
        if ((diff > 0 && accumulatedDelta < 0) || (diff < 0 && accumulatedDelta > 0)) {
          accumulatedDelta = 0;
        }
        accumulatedDelta += diff;

        // Require at least 18px continuous downward scroll to hide
        if (accumulatedDelta > 18) {
          nextHidden = true;
        }
        // Require at least 12px continuous upward scroll to reveal
        else if (accumulatedDelta < -12) {
          nextHidden = false;
        }
      }

      if (nextHidden !== isHiddenRef.current) {
        isHiddenRef.current = nextHidden;
        setIsHidden(nextHidden);
      }

      lastY = y;

      // 3. Scroll progress bar
      if (progressRef.current) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = max > 0 ? Math.min(y / max, 1) : 0;
        progressRef.current.style.transform = `scaleX(${ratio})`;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = (path, extra = '') =>
    `nav-link ${extra} ${location.pathname === path ? 'active' : ''}`.trim();

  return (
    <>
    <header
      ref={headerRef}
      className={`site-header${isScrolled ? ' is-scrolled' : ''}${isHidden ? ' is-hidden' : ''}`}
    >
      {/* Official utility strip: Escrow protection badge + Concierge hotline + language toggle */}
      <div className="site-strip">
        <div className="site-strip-inner">
          <div className="strip-badge-premium">
            <span className="live-dot-pulse" aria-hidden="true" />
            <ShieldCheck size={13} color="var(--color-primary)" />
            <span>{t('hero_badge', '100% Verified Vendors & Escrow Protection')}</span>
          </div>

          <div className="strip-controls-premium">
            <a
              href="tel:+255766466187"
              className="strip-support-link"
              title="Call MY DAY Concierge Hotline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--color-text)',
                textDecoration: 'none',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid var(--color-border)',
                transition: 'all 0.2s ease'
              }}
            >
              <Phone size={12} color="var(--color-primary)" />
              <span>+255 766 466 187</span>
            </a>

            {/* Language Toggle Pills */}
            <div className="lang-toggle-pills" role="group" aria-label="Language selector">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`lang-toggle-btn ${language === 'en' ? 'is-active' : ''}`}
                title="Switch to English"
              >
                🇬🇧 EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('sw')}
                className={`lang-toggle-btn ${language === 'sw' ? 'is-active' : ''}`}
                title="Badili kwa Kiswahili"
              >
                🇹🇿 SW
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main compact navbar */}
      <nav className="nav-main" aria-label="Main navigation">
        <Link to="/" className="nav-brand">
          <span className="nav-logo"><Heart size={18} fill="#FFFFFF" color="#FFFFFF" /></span>
          <span>
            <span className="nav-brand-name">MY DAY</span>
            <span className="nav-brand-tag">
              {t('nav_browse') === 'Tafuta Huduma' ? 'Soko la Harusi' : 'Wedding Marketplace'}
            </span>
          </span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={linkClass('/')}>{t('nav_home')}</Link>
          <Link to="/planner" className={linkClass('/planner', 'nav-link-ai')}>
            <Sparkles size={13} />
            <span>{t('ai_planner', 'AI Planner')}</span>
          </Link>
          <Link to="/marketplace" className={linkClass('/marketplace')}>{t('nav_browse')}</Link>
          <Link to="/wedding" className={linkClass('/wedding')}>{t('nav_profile')}</Link>

          {role === 'customer' && (
            <>
              <Link to="/dashboard" className={linkClass('/dashboard')}>{t('nav_dashboard')}</Link>
              <Link to="/bookings" className={linkClass('/bookings')}>
                {t('nav_bookings')}{bookings.length > 0 ? ` (${bookings.length})` : ''}
              </Link>
            </>
          )}

          <Link to="/become-vendor" className={linkClass('/become-vendor')}>{t('nav_become_vendor')}</Link>
          <Link to="/contact" className={linkClass('/contact')}>{t('nav_contact')}</Link>

          {role === 'provider' && (
            <Link to="/provider" className={linkClass('/provider', 'nav-link-role')}>{t('nav_provider_portal')}</Link>
          )}
          {role === 'admin' && (
            <Link to="/admin" className={linkClass('/admin', 'nav-link-admin')}>{t('nav_admin_console')}</Link>
          )}
        </div>

        <div className="nav-actions">
          <NotificationBell />

          {isLoggedIn ? (
            <div className="nav-user">
              <User size={14} color="var(--color-primary-hover)" />
              <span>{user?.name || 'Account'}</span>
              <button onClick={logoutUser} title={t('nav_logout')} aria-label={t('nav_logout')} className="nav-logout">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="nav-login">
              <User size={14} /> {t('nav_login_register')}
            </button>
          )}
          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            className="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <div className="nav-progress" ref={progressRef} aria-hidden="true" />
    </header>

    {/* Mobile Navigation Drawer Backdrop & Panel */}
    {mobileMenuOpen && (
      <div
        className="mobile-nav-backdrop"
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />
    )}

    <aside
      className={`mobile-nav-drawer ${mobileMenuOpen ? 'is-open' : ''}`}
      aria-label="Mobile navigation menu"
    >
      <div className="mobile-nav-header">
        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="nav-brand">
          <span className="nav-logo"><Heart size={16} fill="#FFFFFF" color="#FFFFFF" /></span>
          <span className="nav-brand-name">MY DAY</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="mobile-nav-close"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Support Helpline & Language Switchers inside Drawer */}
      <div className="mobile-nav-utility">
        <div className="mobile-nav-section-title">Support Helpline</div>
        <a
          href="tel:+255766466187"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 0.85rem',
            background: 'var(--color-surface-soft)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            textDecoration: 'none',
            color: 'var(--color-text)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '0.85rem'
          }}
        >
          <Phone size={15} color="var(--color-primary)" />
          <span>+255 766 466 187 (Concierge)</span>
        </a>

        <div className="mobile-nav-section-title">Language / Lugha</div>
        <div className="lang-toggle-pills" style={{ width: '100%' }}>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`lang-toggle-btn ${language === 'en' ? 'is-active' : ''}`}
            style={{ flex: 1, padding: '0.35rem 0.6rem', textAlign: 'center' }}
          >
            🇬🇧 English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('sw')}
            className={`lang-toggle-btn ${language === 'sw' ? 'is-active' : ''}`}
            style={{ flex: 1, padding: '0.35rem 0.6rem', textAlign: 'center' }}
          >
            🇹🇿 Kiswahili
          </button>
        </div>
      </div>

      {/* Primary Navigation Links */}
      <nav className="mobile-nav-links">
        <div className="mobile-nav-section-title">Navigation</div>
        
        <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <span>🏠 {t('nav_home')}</span>
          <ChevronRight size={16} className="mobile-nav-chevron" />
        </Link>

        <Link to="/planner" onClick={() => setMobileMenuOpen(false)} className={`mobile-nav-item mobile-nav-item-ai ${location.pathname === '/planner' ? 'active' : ''}`}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} color="#F5A623" />
            <strong>{t('ai_planner', 'AI Planner')}</strong>
          </span>
          <ChevronRight size={16} className="mobile-nav-chevron" />
        </Link>

        <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} className={`mobile-nav-item ${location.pathname === '/marketplace' ? 'active' : ''}`}>
          <span>🔍 {t('nav_browse')}</span>
          <ChevronRight size={16} className="mobile-nav-chevron" />
        </Link>

        <Link to="/wedding" onClick={() => setMobileMenuOpen(false)} className={`mobile-nav-item ${location.pathname === '/wedding' ? 'active' : ''}`}>
          <span>💍 {t('nav_profile')}</span>
          <ChevronRight size={16} className="mobile-nav-chevron" />
        </Link>

        {role === 'customer' && (
          <>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={`mobile-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              <span>📊 {t('nav_dashboard')}</span>
              <ChevronRight size={16} className="mobile-nav-chevron" />
            </Link>
            <Link to="/bookings" onClick={() => setMobileMenuOpen(false)} className={`mobile-nav-item ${location.pathname === '/bookings' ? 'active' : ''}`}>
              <span>📅 {t('nav_bookings')} {bookings.length > 0 ? `(${bookings.length})` : ''}</span>
              <ChevronRight size={16} className="mobile-nav-chevron" />
            </Link>
          </>
        )}

        <Link to="/become-vendor" onClick={() => setMobileMenuOpen(false)} className={`mobile-nav-item ${location.pathname === '/become-vendor' ? 'active' : ''}`}>
          <span>🤝 {t('nav_become_vendor')}</span>
          <ChevronRight size={16} className="mobile-nav-chevron" />
        </Link>

        <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className={`mobile-nav-item ${location.pathname === '/contact' ? 'active' : ''}`}>
          <span>💬 {t('nav_contact')}</span>
          <ChevronRight size={16} className="mobile-nav-chevron" />
        </Link>

        {role === 'provider' && (
          <Link to="/provider" onClick={() => setMobileMenuOpen(false)} className={`mobile-nav-item mobile-nav-item-role ${location.pathname === '/provider' ? 'active' : ''}`}>
            <span>🏰 {t('nav_provider_portal')}</span>
            <ChevronRight size={16} className="mobile-nav-chevron" />
          </Link>
        )}

        {role === 'admin' && (
          <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className={`mobile-nav-item mobile-nav-item-admin ${location.pathname === '/admin' ? 'active' : ''}`}>
            <span>⚡ {t('nav_admin_console')}</span>
            <ChevronRight size={16} className="mobile-nav-chevron" />
          </Link>
        )}
      </nav>

      {/* Account actions in mobile footer */}
      <div className="mobile-nav-footer">
        {isLoggedIn ? (
          <div className="mobile-nav-user-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="mobile-nav-user-avatar">
                <User size={16} color="#FFFFFF" />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || 'Account'}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email || 'Verified Account'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                logoutUser();
                setMobileMenuOpen(false);
              }}
              className="mobile-nav-logout-btn"
              title={t('nav_logout')}
            >
              <LogOut size={15} /> {t('nav_logout')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setShowAuthModal(true);
              setMobileMenuOpen(false);
            }}
            className="btn-pill-amber"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem' }}
          >
            <User size={16} /> {t('nav_login_register')}
          </button>
        )}
      </div>
    </aside>

    {showAuthModal && (
      <AuthModal onClose={() => setShowAuthModal(false)} />
    )}
    </>
  );
}

export default Navbar;
