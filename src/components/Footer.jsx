import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, ShieldCheck } from 'lucide-react';

function Footer({ variant }) {
  const { t } = useAppContext();
  const location = useLocation();

  const currentVariant = variant || (
    ['/', '/marketplace', '/become-vendor', '/contact'].includes(location.pathname) || 
    location.pathname.startsWith('/vendor/')
      ? 'full'
      : 'minimal'
  );

  const isMinimal = currentVariant === 'minimal';

  const linkStyle = {
    color: 'rgba(255,255,255,0.75)',
    transition: 'color 0.2s',
    fontSize: '0.85rem',
  };

  if (isMinimal) {
    return (
      <footer style={{
        background: 'rgba(74, 59, 47, 0.95)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        color: 'rgba(255,255,255,0.7)',
        paddingTop: '1.5rem',
        paddingBottom: '1.5rem',
        marginTop: '4rem',
        borderTop: '1px solid rgba(255, 157, 59, 0.2)',
      }}>
        <div className="container minimal-footer-container">
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
            © 2026 MY DAY. {t('footer_rights')}
          </div>
          <div className="minimal-footer-links" style={{ fontSize: '0.85rem' }}>
            <Link to="/contact" style={linkStyle}>{t('footer_privacy')}</Link>
            <Link to="/contact" style={linkStyle}>{t('footer_terms')}</Link>
            <Link to="/contact" style={linkStyle}>{t('footer_help_center')}</Link>
            <Link to="/contact" style={linkStyle}>{t('nav_contact')}</Link>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer style={{
      background: 'linear-gradient(180deg, rgba(74, 59, 47, 0.95) 0%, rgba(53, 40, 30, 0.95) 100%)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      color: 'rgba(255,255,255,0.8)',
      paddingTop: '3.5rem',
      paddingBottom: '2rem',
      marginTop: '0',
      borderTop: '1px solid rgba(255, 157, 59, 0.2)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative glow blob */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '200px',
        background: 'radial-gradient(ellipse at center, rgba(255, 157, 59, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2rem',
        marginBottom: '2.5rem',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Brand Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-glow)',
            }}>
              <Heart size={18} fill="#FFFFFF" />
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-header)', color: '#ffffff', letterSpacing: '0.03em' }}>
              MY DAY
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: '1rem' }}>
            {t('footer_tagline')}
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
            <ShieldCheck size={16} /> {t('footer_badge')}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1rem', fontWeight: 700 }}>{t('footer_quick_links')}</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><Link to="/" style={linkStyle}>{t('nav_home')}</Link></li>
            <li><Link to="/marketplace" style={linkStyle}>{t('nav_browse')}</Link></li>
            <li><Link to="/wedding" style={linkStyle}>{t('nav_profile')}</Link></li>
            <li><Link to="/dashboard" style={linkStyle}>{t('nav_dashboard')}</Link></li>
            <li><Link to="/bookings" style={linkStyle}>{t('nav_bookings')}</Link></li>
            <li><Link to="/become-vendor" style={linkStyle}>{t('nav_become_vendor')}</Link></li>
            <li><Link to="/contact" style={linkStyle}>{t('nav_contact')}</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1rem', fontWeight: 700 }}>{t('footer_categories')}</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><Link to="/marketplace?category=kumbi" style={linkStyle}>🏰 {t('cat_venues_title')}</Link></li>
            <li><Link to="/marketplace?category=wapambaji" style={linkStyle}>🎨 {t('cat_decorators_title')}</Link></li>
            <li><Link to="/marketplace?category=entertainment" style={linkStyle}>🎤 {t('cat_entertainment_title')}</Link></li>
            <li><Link to="/marketplace?category=catering" style={linkStyle}>🍽️ {t('cat_catering_title')}</Link></li>
            <li><Link to="/marketplace?category=saloon" style={linkStyle}>💇 {t('cat_saloon_title')}</Link></li>
            <li><Link to="/marketplace?category=transport" style={linkStyle}>🚗 {t('cat_transport_title')}</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1rem', fontWeight: 700 }}>{t('footer_support')}</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><Link to="/contact" style={linkStyle}>{t('footer_help_center')}</Link></li>
            <li><Link to="/contact" style={linkStyle}>{t('footer_privacy')}</Link></li>
            <li><Link to="/contact" style={linkStyle}>{t('footer_terms')}</Link></li>
            <li><Link to="/contact" style={linkStyle}>{t('footer_refund')}</Link></li>
          </ul>
        </div>
      </div>

      <div className="container" style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.5)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div>© 2026 MY DAY. {t('footer_rights')}</div>
        <div>{t('footer_designed_for')}</div>
      </div>
    </footer>
  );
}

export default Footer;
