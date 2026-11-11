import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, ShieldCheck, MapPin, Phone, Mail, Clock, MessageCircle, ArrowUpRight } from 'lucide-react';
import { getCurrentOfficeStatus } from '../services/businessSchedule';
import '../styles/site-footer.css';

const QUICK_LINKS = [
  { to: '/', key: 'nav_home', fallback: 'Home' },
  { to: '/marketplace', key: 'nav_browse', fallback: 'Browse Services' },
  { to: '/wedding', key: 'nav_profile', fallback: 'Wedding Profile' },
  { to: '/dashboard', key: 'nav_dashboard', fallback: 'Event Dashboard' },
  { to: '/bookings', key: 'nav_bookings', fallback: 'My Bookings' },
  { to: '/become-vendor', key: 'nav_become_vendor', fallback: 'Become a Vendor' },
  { to: '/contact', key: 'nav_contact', fallback: 'Contact Us' },
];

const CATEGORY_LINKS = [
  { to: '/marketplace?category=kumbi', icon: '🏰', key: 'cat_venues_title', fallback: 'Wedding Venues' },
  { to: '/marketplace?category=wapambaji', icon: '🎨', key: 'cat_decorators_title', fallback: 'Wedding Decorators' },
  { to: '/marketplace?category=entertainment', icon: '🎤', key: 'cat_entertainment_title', fallback: 'MCs & Entertainment' },
  { to: '/marketplace?category=catering', icon: '🍽️', key: 'cat_catering_title', fallback: 'Catering' },
  { to: '/marketplace?category=saloon', icon: '💇', key: 'cat_saloon_title', fallback: 'Saloon & Barbershop' },
  { to: '/marketplace?category=transport', icon: '🚗', key: 'cat_transport_title', fallback: 'Transport' },
];

const SUPPORT_LINKS = [
  { key: 'footer_help_center', fallback: 'Help Center & FAQ' },
  { key: 'footer_privacy', fallback: 'Privacy Policy' },
  { key: 'footer_terms', fallback: 'Terms & Conditions' },
  { key: 'footer_refund', fallback: 'Refund & Cancellation Policy' },
];

function Footer({ variant }) {
  const { t, language } = useAppContext();
  const location = useLocation();
  const officeStatus = getCurrentOfficeStatus();
  const isSw = language === 'sw';

  const currentVariant = variant || (
    ['/', '/marketplace', '/become-vendor', '/contact'].includes(location.pathname) ||
    location.pathname.startsWith('/vendor/')
      ? 'full'
      : 'minimal'
  );

  const isMinimal = currentVariant === 'minimal';
  const tr = (key, fallback) => {
    const value = t(key);
    return !value || value === key ? fallback : value;
  };

  if (isMinimal) {
    return (
      <footer className="ft ft--minimal">
        <div className="container ft__minimal">
          <p className="ft__copyright">© 2026 MY DAY. {tr('footer_rights', 'All Rights Reserved.')}</p>
          <nav className="ft__minimal-links" aria-label={isSw ? 'Viungo vya chini' : 'Footer links'}>
            <Link to="/contact">{tr('footer_privacy', 'Privacy Policy')}</Link>
            <Link to="/contact">{tr('footer_terms', 'Terms & Conditions')}</Link>
            <Link to="/contact">{tr('footer_help_center', 'Help Center & FAQ')}</Link>
            <Link to="/contact">{tr('nav_contact', 'Contact Us')}</Link>
          </nav>
        </div>
      </footer>
    );
  }

  return (
    <footer className="ft">
      <div className="ft__aura" aria-hidden="true" />

      <div className="container ft__inner">
        {/* Brand + link columns */}
        <div className="ft__top">
          <div className="ft__brand">
            <Link to="/" className="ft__logo" aria-label="MY DAY home">
              <span className="ft__mark" aria-hidden="true">
                <Heart size={17} fill="currentColor" stroke="none" />
              </span>
              <span className="ft__wordmark">
                <strong>MY DAY</strong>
                <small>{isSw ? 'SOKO LA HARUSI' : 'WEDDING MARKETPLACE'}</small>
              </span>
            </Link>

            <p className="ft__tagline">{tr('footer_tagline', 'Making wedding planning simple, beautiful, and stress-free for couples across Tanzania.')}</p>

            <span className="ft__badge">
              <ShieldCheck size={14} /> {tr('footer_badge', '100% Verified Vendors & Secure Mobile Money')}
            </span>
          </div>

          <nav className="ft__col" aria-labelledby="ft-quick">
            <h3 id="ft-quick" className="ft__col-title">{tr('footer_quick_links', 'Quick Links')}</h3>
            <ul>
              {QUICK_LINKS.map((l) => (
                <li key={l.key}>
                  <Link to={l.to}>{tr(l.key, l.fallback)}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="ft__col" aria-labelledby="ft-cats">
            <h3 id="ft-cats" className="ft__col-title">{tr('footer_categories', 'Categories')}</h3>
            <ul>
              {CATEGORY_LINKS.map((l) => (
                <li key={l.key}>
                  <Link to={l.to}>
                    <span className="ft__emoji" aria-hidden="true">{l.icon}</span>
                    {tr(l.key, l.fallback)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="ft__col" aria-labelledby="ft-support">
            <h3 id="ft-support" className="ft__col-title">{tr('footer_support', 'Support & Legal')}</h3>
            <ul>
              {SUPPORT_LINKS.map((l) => (
                <li key={l.key}>
                  <Link to="/contact">{tr(l.key, l.fallback)}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Contact strip */}
        <div className="ft__contact">
          <div className="ft__card ft__card--office">
            <span className="ft__card-label">
              <MapPin size={12} /> {isSw ? 'Makao Makuu Dar es Salaam' : 'Dar es Salaam HQ'}
            </span>
            <address className="ft__address">
              <strong>Mbezi beach, makonde.</strong>
              <span>Bagamoyo Road,</span>
              <span>Dar es Salaam, Tanzania.</span>
            </address>
          </div>

          <div className="ft__card">
            <span className="ft__card-label">
              <Phone size={12} /> {isSw ? 'Simu' : 'Call us'}
            </span>
            <ul className="ft__phones">
              <li>
                <a href="tel:+255766466187">+255 766 466 187</a>
                <span>{isSw ? 'Simu & WhatsApp' : 'Calls & WhatsApp'}</span>
              </li>
              <li>
                <a href="tel:+255619180779">+255 619 180 779</a>
                <span>{isSw ? 'Nambari ya Moja kwa Moja' : 'Direct Line'}</span>
              </li>
            </ul>
          </div>

          <div className="ft__card">
            <span className="ft__card-label">
              <Mail size={12} /> {tr('contact_email_label_title', 'Email Us')}
            </span>
            <a className="ft__email" href="mailto:support@myday.co.tz">
              support@myday.co.tz <ArrowUpRight size={13} />
            </a>
            <a className="ft__wa" href="https://wa.me/255766466187" target="_blank" rel="noreferrer">
              <MessageCircle size={13} /> {isSw ? 'Anzisha mazungumzo' : 'Start a WhatsApp chat'}
            </a>
          </div>

          <div className="ft__card ft__card--hours">
            <div className="ft__status-row">
              <div
                className={`ft__status ${officeStatus.isOpen ? 'is-open' : 'is-closed'}`}
                title={officeStatus.isOpen ? tr('office_open_now', 'Office open now') : tr('office_closed_now', 'Office closed')}
              >
                <span className="ft__dot" aria-hidden="true" />
                {officeStatus.isOpen
                  ? (isSw ? 'Ofisi Iko Wazi' : 'Office open')
                  : (isSw ? 'Ofisi Imefungwa' : 'Office closed')}
              </div>
              <span className="ft__status-detail">
                {officeStatus.isOpen
                  ? (isSw ? 'Hadi 5:00 PM EAT' : 'Until 5:00 PM EAT')
                  : `${isSw ? 'Inafunguliwa' : 'Opens'} ${officeStatus.nextOpeningDar || ''}`}
              </span>
            </div>

            <span className="ft__hours-title">
              <Clock size={12} /> {isSw ? 'Saa za kazi (EAT)' : 'HQ Operating Hours (EAT)'}
            </span>

            <dl className="ft__hours">
              <div>
                <dt>{isSw ? 'Jumatatu – Ijumaa' : 'Mon – Fri'}</dt>
                <dd>8:00 AM – 5:00 PM</dd>
              </div>
              <div>
                <dt>{isSw ? 'Jumamosi & Jumapili' : 'Sat & Sun'}</dt>
                <dd className="is-muted">{isSw ? 'Imefungwa' : 'Closed by default'}</dd>
              </div>
            </dl>

            <p className="ft__always">
              <span aria-hidden="true">✨</span>
              {isSw ? 'Maharusi na watoa huduma mtandaoni 24/7' : 'Couples & vendors 24/7 online'}
            </p>
          </div>
        </div>

        {/* Legal bar */}
        <div className="ft__bottom">
          <p className="ft__copyright">© 2026 MY DAY. {tr('footer_rights', 'All Rights Reserved.')}</p>
          <p className="ft__designed">{tr('footer_designed_for', 'Designed for couples & service providers in Tanzania')}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
