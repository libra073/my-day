import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, ShieldCheck, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { getCurrentOfficeStatus } from '../services/businessSchedule';

function Footer({ variant }) {
  const { t } = useAppContext();
  const location = useLocation();
  const officeStatus = getCurrentOfficeStatus();

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
    <footer className="footer-wrapper">
      {/* Decorative top glow */}
      <div className="footer-top-glow" />

      <div className="container footer-columns-grid">
        {/* Brand Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F5A623 0%, #D98218 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(245, 166, 35, 0.4)',
            }}>
              <Heart size={18} fill="#FFFFFF" />
            </div>
            <span style={{ fontSize: '1.45rem', fontWeight: 900, fontFamily: 'var(--font-header)', color: '#ffffff', letterSpacing: '0.03em' }}>
              MY DAY
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            {t('footer_tagline')}
          </p>
          <div style={{
            fontSize: '0.8rem',
            color: '#F5A623',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 750,
            background: 'rgba(245, 166, 35, 0.12)',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            border: '1px solid rgba(245, 166, 35, 0.25)'
          }}>
            <ShieldCheck size={15} /> {t('footer_badge')}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="footer-col-title">{t('footer_quick_links')}</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
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
          <h4 className="footer-col-title">{t('footer_categories')}</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <li><Link to="/marketplace?category=kumbi" style={linkStyle}>🏰 {t('cat_venues_title')}</Link></li>
            <li><Link to="/marketplace?category=wapambaji" style={linkStyle}>🎨 {t('cat_decorators_title')}</Link></li>
            <li><Link to="/marketplace?category=entertainment" style={linkStyle}>🎤 {t('cat_entertainment_title')}</Link></li>
            <li><Link to="/marketplace?category=catering" style={linkStyle}>🍽️ {t('cat_catering_title')}</Link></li>
            <li><Link to="/marketplace?category=saloon" style={linkStyle}>💇 {t('cat_saloon_title')}</Link></li>
            <li><Link to="/marketplace?category=transport" style={linkStyle}>🚗 {t('cat_transport_title')}</Link></li>
          </ul>
        </div>

        {/* Official Contact & Physical HQ */}
        <div>
          <h4 className="footer-col-title">
            <MapPin size={17} color="#F5A623" />
            <span>{t('contact_office_label', 'Physical Office')}</span>
          </h4>

          {/* Address Capsule */}
          <div className="footer-info-capsule">
            <div className="footer-capsule-label">
              <MapPin size={12} />
              <span>Dar es Salaam HQ</span>
            </div>
            <div className="footer-capsule-text">
              <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '2px', fontWeight: 800 }}>
                Mbezi beach, makonde.
              </strong>
              <div style={{ color: 'rgba(255,255,255,0.85)' }}>Bagamoyo Road,</div>
              <div style={{ color: 'rgba(255,255,255,0.75)' }}>Dar es Salaam, Tanzania.</div>
            </div>
          </div>

          {/* Interactive Phone Buttons */}
          <div style={{ marginBottom: '0.85rem' }}>
            <a href="tel:+255766466187" className="footer-phone-btn">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Phone size={13} color="#F5A623" />
                <span>+255 766 466 187</span>
              </span>
              <span className="footer-phone-tag">Calls & WhatsApp</span>
            </a>
            <a href="tel:+255619180779" className="footer-phone-btn">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Phone size={13} color="#F5A623" />
                <span>+255 619 180 779</span>
              </span>
              <span className="footer-phone-tag">Direct Line</span>
            </a>
          </div>

          {/* Email Capsule */}
          <div className="footer-info-capsule" style={{ marginBottom: 0 }}>
            <div className="footer-capsule-label">
              <Mail size={12} />
              <span>{t('contact_email_label_title', 'Email Us')}</span>
            </div>
            <a href="mailto:support@myday.co.tz" style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, display: 'block' }}>
              support@myday.co.tz
            </a>
          </div>
        </div>

        {/* Support & Office Schedule Card */}
        <div>
          <h4 className="footer-col-title">
            <Clock size={17} color="#F5A623" />
            <span>{t('footer_support')}</span>
          </h4>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.15rem 0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <li><Link to="/contact" style={linkStyle}>{t('footer_help_center')}</Link></li>
            <li><Link to="/contact" style={linkStyle}>{t('footer_privacy')}</Link></li>
            <li><Link to="/contact" style={linkStyle}>{t('footer_terms')}</Link></li>
            <li><Link to="/contact" style={linkStyle}>{t('footer_refund')}</Link></li>
          </ul>

          {/* Luxury Schedule Widget */}
          <div className="footer-schedule-card">
            <div className={`footer-status-pill ${officeStatus.isOpen ? 'footer-status-open' : 'footer-status-closed'}`}>
              <span className={officeStatus.isOpen ? 'pulse-dot-green' : 'pulse-dot-purple'} />
              <span>{officeStatus.isOpen ? t('office_open_now', 'Office Open Now') : t('office_closed_now', 'Office Closed')}</span>
            </div>

            <div style={{ fontSize: '0.74rem', color: '#F5A623', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.45rem' }}>
              HQ Operating Hours (EAT)
            </div>

            <div className="footer-schedule-row">
              <span className="footer-schedule-day">Mon – Fri</span>
              <span className="footer-schedule-time">8:00 AM – 5:00 PM</span>
            </div>
            <div className="footer-schedule-row">
              <span className="footer-schedule-day">Sat & Sun</span>
              <span className="footer-schedule-time" style={{ color: '#E8DCCF' }}>Closed by default</span>
            </div>

            <div style={{ marginTop: '0.65rem', paddingTop: '0.55rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.74rem', color: '#F5A623', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>✨</span>
              <span>Couples & vendors 24/7 online</span>
            </div>
          </div>
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
