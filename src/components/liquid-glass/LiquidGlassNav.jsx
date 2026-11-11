import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import {
  Heart, Sparkles, User, LogOut, Phone, Menu, X, Home,
  LayoutGrid, LayoutDashboard, Store, UserRound, CalendarDays,
  BadgePlus, Shield, Sun, Moon, ShieldAlert, Check
} from 'lucide-react';
import AuthModal from '../AuthModal';
import NotificationBell from '../NotificationBell';
import { useSparkleBurst } from '../motion/MotionSparkles';

export default function LiquidGlassNav({ onOpenAuth }) {
  const { role, user, isLoggedIn, logoutUser, bookings, language, setLanguage, t, theme, toggleTheme, openAuthModal } = useAppContext();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { triggerSparkles, SparkleOverlay } = useSparkleBurst();

  // ── Liquid Navigation Animation State ───────────────────────────
  const navRef = useRef(null);
  const prevLeftRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    height: 0,
    opacity: 0,
    stretchDir: null, // 'right' | 'left' | null
  });

  const isActive = (path) => location.pathname === path;

  // Measure and animate the fluid liquid bulge indicator
  const updateLiquidIndicator = useCallback(() => {
    if (!navRef.current) return;
    const activeEl = navRef.current.querySelector('.cl-link.is-active');
    if (activeEl) {
      const parentRect = navRef.current.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      const newLeft = elRect.left - parentRect.left;
      const newWidth = elRect.width;
      const newHeight = elRect.height;

      let stretch = null;
      if (prevLeftRef.current !== null && Math.abs(newLeft - prevLeftRef.current) > 10) {
        stretch = newLeft > prevLeftRef.current ? 'right' : 'left';
      }
      prevLeftRef.current = newLeft;

      setIndicatorStyle({
        left: newLeft,
        width: newWidth,
        height: newHeight,
        opacity: 1,
        stretchDir: stretch,
      });

      if (stretch) {
        setTimeout(() => {
          setIndicatorStyle((prev) => ({ ...prev, stretchDir: null }));
        }, 320);
      }
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    // Measure immediately and after minor DOM render delay
    updateLiquidIndicator();
    const timer = setTimeout(updateLiquidIndicator, 60);
    const timer2 = setTimeout(updateLiquidIndicator, 220);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [location.pathname, language, role, isLoggedIn, bookings?.length, updateLiquidIndicator]);

  // Recalculate on window resize and nav element resize
  useEffect(() => {
    window.addEventListener('resize', updateLiquidIndicator);
    let ro;
    if (typeof ResizeObserver !== 'undefined' && navRef.current) {
      ro = new ResizeObserver(() => updateLiquidIndicator());
      ro.observe(navRef.current);
    }
    return () => {
      window.removeEventListener('resize', updateLiquidIndicator);
      if (ro) ro.disconnect();
    };
  }, [updateLiquidIndicator]);

  const openAuth = () => {
    setMobileOpen(false);
    if (onOpenAuth) onOpenAuth();
    else setShowAuth(true);
  };

  const navItems = (
    <>
      <Link to="/" className={`cl-link motion-nav-link ${isActive('/') ? 'is-active' : ''}`} onClick={() => setMobileOpen(false)}
        aria-label={t('nav_home', 'Home')} title={t('nav_home', 'Home')} aria-current={isActive('/') ? 'page' : undefined}>
        <Home size={15} />
        <span>{t('nav_home', 'Home')}</span>
      </Link>
      <Link to="/planner" className={`cl-link motion-nav-link ${isActive('/planner') ? 'is-active' : ''}`} onClick={() => setMobileOpen(false)}
        aria-label={t('ai_planner', 'AI Planner')} title={t('ai_planner', 'AI Planner')} aria-current={isActive('/planner') ? 'page' : undefined}>
        <Sparkles size={15} />
        <span>{t('ai_planner', 'AI Planner')}</span>
      </Link>
      <Link to="/marketplace" className={`cl-link motion-nav-link ${isActive('/marketplace') ? 'is-active' : ''}`} onClick={() => setMobileOpen(false)}
        aria-label={t('nav_browse', 'Browse')} title={t('nav_browse', 'Browse')} aria-current={isActive('/marketplace') ? 'page' : undefined}>
        <LayoutGrid size={15} />
        <span>{t('nav_browse', 'Browse')}</span>
      </Link>
      <Link to="/wedding" className={`cl-link motion-nav-link ${isActive('/wedding') ? 'is-active' : ''}`} onClick={() => setMobileOpen(false)}
        aria-label={t('nav_profile', 'Profile')} title={t('nav_profile', 'Profile')} aria-current={isActive('/wedding') ? 'page' : undefined}>
        <UserRound size={15} />
        <span>{t('nav_profile', 'Profile')}</span>
      </Link>
      {role === 'customer' && (
        <>
          <Link to="/dashboard" className={`cl-link motion-nav-link ${isActive('/dashboard') ? 'is-active' : ''}`} onClick={() => setMobileOpen(false)}
            aria-label={t('nav_dashboard', 'Dashboard')} title={t('nav_dashboard', 'Dashboard')} aria-current={isActive('/dashboard') ? 'page' : undefined}>
            <LayoutDashboard size={15} />
            <span>{t('nav_dashboard', 'Dashboard')}</span>
          </Link>
          <Link to="/bookings" className={`cl-link motion-nav-link ${isActive('/bookings') ? 'is-active' : ''}`} onClick={() => setMobileOpen(false)}
            aria-label={t('nav_bookings', 'Bookings')} title={t('nav_bookings', 'Bookings')} aria-current={isActive('/bookings') ? 'page' : undefined}>
            <CalendarDays size={15} />
            <span>{t('nav_bookings', 'Bookings')}{bookings?.length > 0 ? ` (${bookings.length})` : ''}</span>
          </Link>
        </>
      )}
      <Link to="/become-vendor" className={`cl-link motion-nav-link ${isActive('/become-vendor') ? 'is-active' : ''}`} onClick={() => setMobileOpen(false)}
        aria-label={t('nav_become_vendor', 'Become Vendor')} title={t('nav_become_vendor', 'Become Vendor')} aria-current={isActive('/become-vendor') ? 'page' : undefined}>
        <BadgePlus size={15} />
        <span>{t('nav_become_vendor', 'Become Vendor')}</span>
      </Link>
      {role === 'provider' && (
        <Link to="/provider" className={`cl-link motion-nav-link ${isActive('/provider') ? 'is-active' : ''}`} onClick={() => setMobileOpen(false)}
          aria-label={t('nav_provider_portal', 'Vendor Portal')} title={t('nav_provider_portal', 'Vendor Portal')} aria-current={isActive('/provider') ? 'page' : undefined}>
          <Store size={15} />
          <span>{t('nav_provider_portal', 'Vendor Portal')}</span>
        </Link>
      )}
      {role === 'admin' && (
        <Link to="/admin" className={`cl-link motion-nav-link ${isActive('/admin') ? 'is-active' : ''}`} onClick={() => setMobileOpen(false)}
          aria-label={t('nav_admin_console', 'Admin Console')} title={t('nav_admin_console', 'Admin Console')} aria-current={isActive('/admin') ? 'page' : undefined}>
          <Shield size={15} />
          <span>{t('nav_admin_console', 'Admin Console')}</span>
        </Link>
      )}
    </>
  );

  return (
    <>
      <header className="cl-header" role="banner">
        <Link
          to="/"
          className="cl-brand motion-sparkles-host"
          aria-label="MY DAY home"
          onClick={(e) => triggerSparkles(e)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}
        >
          <span className="cl-brand__logo" aria-hidden="true" style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(0, 102, 238, 0.14) 0%, rgba(0, 102, 238, 0.04) 100%)',
            border: '1px solid rgba(0, 102, 238, 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--liquid-sapphire-500)'
          }}>
            <Heart size={18} fill="currentColor" stroke="none" />
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, textAlign: 'left' }}>
            <span className="cl-brand__name" style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--app-text-primary)' }}>MY DAY</span>
            <span className="cl-brand__sub" style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--liquid-sapphire-500)', textTransform: 'uppercase' }}>
              {language === 'sw' ? 'SOKO LA HARUSI' : 'WEDDING MARKETPLACE'}
            </span>
          </span>
          <SparkleOverlay />
        </Link>

        {/* ── Fluid Liquid Navigation Container ───────────────────── */}
        <nav
          ref={navRef}
          className="cl-links motion-nav-container"
          aria-label="Main Navigation"
        >
          {/* Moving liquid bulge indicator that stretches and settles */}
          <div
            className={`motion-liquid-indicator ${
              indicatorStyle.stretchDir === 'right'
                ? 'is-stretching-right'
                : indicatorStyle.stretchDir === 'left'
                ? 'is-stretching-left'
                : ''
            }`}
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
            }}
            aria-hidden="true"
          />
          {navItems}
        </nav>

        <div className="cl-actions">
          {/* Elastic Spring Language Switcher */}
          <div className="cl-lang motion-lang-toggle" role="group" aria-label="Language">
            <div
              className="motion-lang-slider"
              style={{
                transform: language === 'sw' ? 'translateX(100%)' : 'translateX(0%)'
              }}
              aria-hidden="true"
            />
            <button
              type="button"
              id="lang-toggle-en"
              className={`motion-lang-btn ${language === 'en' ? 'is-active' : ''}`}
              onClick={(e) => {
                triggerSparkles(e);
                setLanguage('en');
              }}
            >
              EN
            </button>
            <button
              type="button"
              id="lang-toggle-sw"
              className={`motion-lang-btn ${language === 'sw' ? 'is-active' : ''}`}
              onClick={(e) => {
                triggerSparkles(e);
                setLanguage('sw');
              }}
            >
              SW
            </button>
          </div>

          {/* Glowing Elastic Toggle: Light / Dark Theme Switcher */}
          <button
            type="button"
            className="cl-theme-pill motion-toggle motion-sweep"
            onClick={(e) => {
              triggerSparkles(e);
              toggleTheme();
            }}
            aria-label={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
            title={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
          >
            {theme === 'dark' ? (
              <span className="cl-theme-pill__inner">
                <Sun size={14} className="theme-icon-sun" />
                <span className="cl-theme-label">Light</span>
              </span>
            ) : (
              <span className="cl-theme-pill__inner">
                <Moon size={14} className="theme-icon-moon" />
                <span className="cl-theme-label">Dark</span>
              </span>
            )}
          </button>

          <NotificationBell />

          {isLoggedIn ? (
            <div className="cl-user">
              <span className="cl-user__avatar" aria-hidden="true">
                {(user?.name || 'M').trim().charAt(0).toUpperCase()}
                {user?.emailVerified && (
                  <span className="cl-user__verified-indicator" title={language === 'sw' ? 'Barua pepe imethibitishwa' : 'Email verified'}>
                    ✓
                  </span>
                )}
              </span>
              <span className="cl-user__name">{user?.name || 'Account'}</span>
              {user && user.emailVerified === false && (
                <button
                  type="button"
                  className="cl-user__verify-badge"
                  onClick={() => openAuthModal ? openAuthModal({ initialTab: 'verify', initialEmail: user?.email }) : setShowAuth(true)}
                  title={language === 'sw' ? 'Thibitisha barua pepe' : 'Verify email'}
                >
                  <ShieldAlert size={12} />
                  <span>{language === 'sw' ? 'Thibitisha' : 'Verify'}</span>
                </button>
              )}
              <button className="cl-user__logout motion-sweep" onClick={logoutUser} title="Logout" aria-label="Logout">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              className="cl-login btn-sweep"
              onClick={openAuth}
              aria-label={language === 'sw' ? 'Ingia' : 'Log In'}
              title={language === 'sw' ? 'Ingia' : 'Log In'}
            >
              <User size={14} />
              <span>{language === 'sw' ? 'Ingia' : 'Log In'}</span>
            </button>
          )}

          <button
            type="button"
            className="cl-icon-btn cl-burger"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <>
          <div className="cl-drawer-backdrop" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="cl-drawer" aria-label="Mobile Navigation">
            <div>
              <div className="cl-drawer__head">
                <span style={{ fontFamily: 'var(--clay-display)', fontWeight: 700, fontSize: '1.05rem' }}>MY DAY</span>
                <button
                  type="button"
                  className="cl-icon-btn"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="cl-drawer__links">{navItems}</div>
            </div>

            <div className="cl-drawer__foot">
              <button
                type="button"
                className="cl-theme-pill cl-theme-pill-drawer motion-sweep"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
              >
                {theme === 'dark' ? (
                  <span className="cl-theme-pill__inner">
                    <Sun size={14} className="theme-icon-sun" />
                    <span>Light Mode</span>
                  </span>
                ) : (
                  <span className="cl-theme-pill__inner">
                    <Moon size={14} className="theme-icon-moon" />
                    <span>Dark Mode</span>
                  </span>
                )}
              </button>
              <a href="tel:+255766466187" className="cl-link" style={{ justifyContent: 'center' }}>
                <Phone size={14} color="currentColor" />
                <span>+255 766 466 187</span>
              </a>
              {isLoggedIn ? (
                <>
                  {user && user.emailVerified === false && (
                    <button
                      type="button"
                      className="cl-login btn-sweep"
                      style={{ background: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#dc2626' }}
                      onClick={() => {
                        setMobileOpen(false);
                        if (openAuthModal) openAuthModal({ initialTab: 'verify', initialEmail: user?.email });
                        else setShowAuth(true);
                      }}
                    >
                      <ShieldAlert size={14} />
                      <span>{language === 'sw' ? 'Thibitisha Barua Pepe' : 'Verify Email'}</span>
                    </button>
                  )}
                  <button className="cl-login btn-sweep" onClick={() => { logoutUser(); setMobileOpen(false); }}>
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button className="cl-login btn-sweep" onClick={openAuth}>
                  <User size={14} />
                  <span>{language === 'sw' ? 'Ingia' : 'Log In'}</span>
                </button>
              )}
            </div>
          </aside>
        </>
      )}

      {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />}
    </>
  );
}
