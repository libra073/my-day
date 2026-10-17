import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ModernHero from '../components/ModernHero';
import InteractiveBudgetWidget from '../components/InteractiveBudgetWidget';
import ProviderCard from '../components/ProviderCard';
import StarRating from '../components/StarRating';
import {
  Building2, Palette, Music, UtensilsCrossed, Scissors, Car,
  ChevronRight, CheckCircle2, ShieldCheck, Sparkles,
  MapPin, Phone, Mail, Clock, MessageSquare, ExternalLink
} from 'lucide-react';
import { getCurrentOfficeStatus } from '../services/businessSchedule';

export default function HomePage() {
  const { providers, t } = useAppContext();
  const officeStatus = getCurrentOfficeStatus();

  const featuredVendors = providers.slice(0, 6);

  const CATEGORIES_DATA = [
    { id: 'kumbi', name: t('cat_venues_title'), icon: Building2, count: t('cat_count_venues'), desc: t('cat_desc_venues') },
    { id: 'wapambaji', name: t('cat_decorators_title'), icon: Palette, count: t('cat_count_decor'), desc: t('cat_desc_decor') },
    { id: 'entertainment', name: t('cat_entertainment_title'), icon: Music, count: t('cat_count_music'), desc: t('cat_desc_music') },
    { id: 'catering', name: t('cat_catering_title'), icon: UtensilsCrossed, count: t('cat_count_catering'), desc: t('cat_desc_catering') },
    { id: 'saloon', name: t('cat_saloon_title'), icon: Scissors, count: t('cat_count_saloon'), desc: t('cat_desc_saloon') },
    { id: 'transport', name: t('cat_transport_title'), icon: Car, count: t('cat_count_transport'), desc: t('cat_desc_transport') },
  ];

  return (
    <div style={{ background: 'var(--color-bg-base)', minHeight: '100vh', color: 'var(--color-text)' }}>
      {/* 1. Ultra-Modern Hero Section */}
      <ModernHero />

      {/* 2. Live Interactive Budget & Countdown Widget */}
      <InteractiveBudgetWidget />

      {/* 2.5 AI Event Planner Feature Spotlight */}
      <section style={{ padding: '2rem 0 1rem' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, #3D2D21 0%, #5C4331 60%, #8C705B 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem 2.25rem',
            color: '#FFFFFF',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid rgba(245, 166, 35, 0.35)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.75rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '650px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(245, 166, 35, 0.2)',
                color: '#F5A623',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.78rem',
                fontWeight: 800,
                marginBottom: '0.85rem'
              }}>
                <Sparkles size={14} /> {t('ai_badge_new')}
              </div>

              <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '0.65rem', lineHeight: 1.2 }}>
                {t('ai_banner_title')}
              </h2>
              <p style={{ fontSize: '0.98rem', color: 'rgba(255, 255, 255, 0.88)', lineHeight: 1.6 }}>
                {t('ai_banner_desc')}
              </p>
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <Link
                to="/planner"
                className="btn-pill-amber"
                style={{
                  padding: '1rem 2.25rem',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 8px 30px rgba(245, 166, 35, 0.5)'
                }}
              >
                <span>✨ {t('ai_banner_btn')}</span>
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Explore Wedding Service Categories */}
      <section style={{ padding: '2.5rem 0 4.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(245, 166, 35, 0.15)',
              color: 'var(--color-amber-text)',
              padding: '0.35rem 1rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.82rem',
              fontWeight: 800,
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <Sparkles size={15} /> {t('market_badge')}
            </div>

            <h2 style={{ fontSize: '2.6rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '0.6rem' }}>
              {t('market_title')}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto', fontWeight: 500 }}>
              {t('market_subtitle')}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: '1.75rem'
          }}>
            {CATEGORIES_DATA.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={`/marketplace?cat=${cat.id}`}
                  className="glass-card"
                  style={{
                    padding: '2rem 1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div>
                    {/* Top Count Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                      <div style={{
                        width: 54,
                        height: 54,
                        borderRadius: '20px',
                        background: 'rgba(245, 166, 35, 0.16)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#5C4331'
                      }}>
                        <Icon size={28} />
                      </div>

                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#5C4331',
                        background: '#FAF6F0',
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid #E8DCCF'
                      }}>
                        {cat.count}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.4rem' }}>
                      {cat.name}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.55, marginBottom: '1.5rem' }}>
                      {cat.desc}
                    </p>
                  </div>

                  <span style={{
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: 'var(--color-amber-text)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    {t('browse_category')} <ChevronRight size={16} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Featured Verified Vendors Grid */}
      <section style={{ padding: '4.5rem 0', background: 'rgba(255, 255, 255, 0.5)' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '3rem',
            flexWrap: 'wrap',
            gap: '1.25rem'
          }}>
            <div>
              <div style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                color: 'var(--color-amber-text)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.35rem'
              }}>
                {t('featured_badge')}
              </div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-text)' }}>
                {t('featured_title_verified')}
              </h2>
            </div>

            <Link to="/marketplace" className="btn-pill-amber" style={{ padding: '0.85rem 1.8rem' }}>
              {t('view_all_vendors')} ({providers.length}) <ChevronRight size={18} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: '2rem'
          }}>
            {featuredVendors.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Trust Guarantee & High Impact Proof Banner */}
      <section style={{ padding: '5.5rem 0' }}>
        <div className="container">
          <div style={{
            background: 'var(--color-hero-gradient)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(2rem, 5vw, 4rem) clamp(1.25rem, 5vw, 3rem)',
            color: '#FFFFFF',
            boxShadow: 'var(--shadow-lg)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '3rem',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Glow */}
            <div style={{
              position: 'absolute',
              top: '-100px', right: '-100px',
              width: '450px', height: '450px',
              background: 'radial-gradient(circle, rgba(245, 166, 35, 0.25) 0%, transparent 65%)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(12px)',
                color: '#F5A623',
                padding: '0.4rem 1.1rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.82rem',
                fontWeight: 800,
                marginBottom: '1.25rem'
              }}>
                <ShieldCheck size={16} /> {t('trust_badge')}
              </div>

              <h2 style={{ fontSize: '2.8rem', color: '#FFFFFF', fontWeight: 900, lineHeight: 1.18, marginBottom: '1.35rem' }}>
                {t('trust_title_pre')} <br />
                <span className="gradient-text-amber">{t('trust_title_post')}</span>
              </h2>

              <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.88)', lineHeight: 1.65, marginBottom: '2.25rem' }}>
                {t('trust_desc')}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {[
                  t('trust_point_1'),
                  t('trust_point_2'),
                  t('trust_point_3'),
                  t('trust_point_4')
                ].map((text, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.92rem', fontWeight: 700 }}>
                    <CheckCircle2 size={18} color="#F5A623" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Concierge Guarantee Spotlight Card */}
            <div className="glass-card-dark" style={{ padding: '2.25rem', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}>
                <StarRating rating={5} />
              </div>

              <p style={{ fontSize: '1.05rem', fontStyle: 'italic', color: '#FFFFFF', lineHeight: 1.65, marginBottom: '1.75rem' }}>
                {t('testimonial_quote')}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: '#F5A623',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  boxShadow: 'var(--shadow-amber)'
                }}>
                  <ShieldCheck size={26} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#FFFFFF' }}>{t('testimonial_names')}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.75)' }}>{t('testimonial_meta')}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Vendor Registration CTA */}
      <section style={{ padding: '0 0 4rem' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="glass-card" style={{
            padding: '4rem 2rem',
            maxWidth: '880px',
            margin: '0 auto',
            border: '2px dashed #E8DCCF',
            borderRadius: 'var(--radius-xl)'
          }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '1rem' }}>
              {t('vendor_cta_title')}
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', maxWidth: '640px', margin: '0 auto 2.25rem', fontWeight: 500 }}>
              {t('vendor_cta_desc')}
            </p>
            <Link to="/become-vendor" className="btn-pill-mocha" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
              {t('vendor_cta_btn')}
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Official Headquarters & Client Support */}
      <section className="home-contact-section">
        <div className="container">
          <div className="home-contact-box">
            <div className="home-contact-glow" />

            <div className="home-contact-header">
              <div className="home-contact-badge">
                <MapPin size={15} /> {t('home_contact_badge', 'Dar es Salaam Headquarters & Support')}
              </div>
              <h2 className="home-contact-title">
                {t('home_contact_title', 'Visit Our Office or Connect With Our Team')}
              </h2>
              <p className="home-contact-desc">
                {t('home_contact_desc', 'From selecting verified wedding vendors to reviewing 30% protected escrow contracts, our dedicated concierge team in Dar es Salaam is ready to assist you every day.')}
              </p>
            </div>

            <div className="home-contact-grid">
              {/* Card 1: Physical Office */}
              <div className="home-contact-card">
                <div>
                  <div className="home-contact-icon-bubble">
                    <MapPin size={24} />
                  </div>
                  <h3 className="home-contact-card-title">{t('home_contact_office_title', 'Dar es Salaam HQ')}</h3>
                  <div className="home-contact-card-subtitle">{t('contact_office_label', 'Physical Office:')}</div>
                  <div className="home-contact-card-body">
                    <strong style={{ color: '#3D2C1F' }}>Mbezi beach, makonde.</strong><br />
                    Bagamoyo Road,<br />
                    Dar es Salaam, Tanzania.
                  </div>
                </div>
                <div className="home-contact-card-actions">
                  <a
                    href="https://maps.google.com/?q=Mbezi+beach+makonde+Bagamoyo+Road+Dar+es+Salaam+Tanzania"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="home-contact-btn home-contact-btn-outline"
                  >
                    <span>{t('home_contact_office_btn', 'Open Directions')}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Card 2: Support Hotlines */}
              <div className="home-contact-card">
                <div>
                  <div className="home-contact-icon-bubble">
                    <Phone size={24} />
                  </div>
                  <h3 className="home-contact-card-title">{t('home_contact_hotline_title', 'Support Hotlines')}</h3>
                  <div className="home-contact-card-subtitle">{t('contact_hotline_label', 'Support Hotline:')}</div>
                  <div className="home-contact-card-body">
                    <div style={{ marginBottom: '0.4rem' }}>
                      <strong style={{ color: '#3D2C1F' }}>+255 766 466 187</strong>
                      <span style={{ fontSize: '0.75rem', color: '#9C826D', marginLeft: '0.35rem' }}>(Calls & WhatsApp)</span>
                    </div>
                    <div>
                      <strong style={{ color: '#3D2C1F' }}>+255 619 180 779</strong>
                      <span style={{ fontSize: '0.75rem', color: '#9C826D', marginLeft: '0.35rem' }}>(Direct Line)</span>
                    </div>
                  </div>
                </div>
                <div className="home-contact-card-actions">
                  <a href="tel:+255766466187" className="home-contact-btn home-contact-btn-amber">
                    <Phone size={14} />
                    <span>{t('home_contact_call_btn', 'Call Now')}</span>
                  </a>
                  <a
                    href="https://wa.me/255766466187?text=Hello%20MY%20DAY%20Wedding%20Team%2C%20I%20would%20like%20assistance%20with%20my%20wedding%20plans."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="home-contact-btn home-contact-btn-whatsapp"
                  >
                    <span>{t('home_contact_whatsapp_btn', 'WhatsApp Chat')}</span>
                  </a>
                </div>
              </div>

              {/* Card 3: Official Email */}
              <div className="home-contact-card">
                <div>
                  <div className="home-contact-icon-bubble">
                    <Mail size={24} />
                  </div>
                  <h3 className="home-contact-card-title">{t('home_contact_email_title', 'Official Email')}</h3>
                  <div className="home-contact-card-subtitle">{t('contact_email_label_title', 'Email Us:')}</div>
                  <div className="home-contact-card-body">
                    <div style={{ marginBottom: '0.4rem' }}>
                      <strong style={{ color: '#3D2C1F' }}>support@myday.co.tz</strong><br />
                      <span style={{ fontSize: '0.78rem', color: '#8C7662' }}>Couples & Vendor Assistance</span>
                    </div>
                    <div>
                      <strong style={{ color: '#3D2C1F' }}>info@myday.co.tz</strong><br />
                      <span style={{ fontSize: '0.78rem', color: '#8C7662' }}>Partnerships & Corporate HQ</span>
                    </div>
                  </div>
                </div>
                <div className="home-contact-card-actions">
                  <a href="mailto:support@myday.co.tz" className="home-contact-btn home-contact-btn-outline">
                    <Mail size={14} />
                    <span>support@myday.co.tz</span>
                  </a>
                </div>
              </div>

              {/* Card 4: Operating Hours */}
              <div className="home-contact-card">
                <div>
                  <div className="home-contact-icon-bubble">
                    <Clock size={24} />
                  </div>
                  <h3 className="home-contact-card-title">{t('home_contact_hours_title', 'Platform Operating Hours')}</h3>
                  <div className="home-contact-card-subtitle">Africa/Dar_es_Salaam (EAT)</div>

                  <div className={`home-contact-status-pill ${officeStatus.isOpen ? 'home-contact-status-open' : 'home-contact-status-closed'}`}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: officeStatus.isOpen ? '#2E7D32' : '#6C5CE7'
                    }} />
                    <span>{officeStatus.isOpen ? t('office_open_now', 'Office Open Now (8:00 AM – 5:00 PM EAT)') : t('office_closed_now', 'Office Closed (Opens Monday 8:00 AM EAT)')}</span>
                  </div>

                  <div className="home-contact-card-body">
                    <div style={{ fontWeight: 700, color: '#3D2C1F', marginBottom: '0.2rem' }}>
                      {t('home_contact_hours_detail', 'Mon – Fri: 8:00 AM – 5:00 PM EAT')}
                    </div>
                    <div style={{ color: '#8C7662', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      {t('home_contact_hours_weekend', 'Saturday & Sunday: Closed')}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#D98218', fontWeight: 700 }}>
                      ✨ {t('home_contact_hours_online', 'Couples can plan weddings online 24/7')}
                    </div>
                  </div>
                </div>
                <div className="home-contact-card-actions">
                  <Link to="/contact" className="home-contact-btn home-contact-btn-outline">
                    <Clock size={14} />
                    <span>{t('book_consultation_btn', 'Book Consultation')}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Banner */}
            <div className="home-contact-banner">
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.25rem' }}>
                  {t('home_contact_inquiry_prompt', 'Need personal assistance or want to book an in-person meeting?')}
                </div>
                <div style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                  {t('business_timezone_note', 'All official business hours and appointments are in Africa/Dar_es_Salaam timezone (EAT).')}
                </div>
              </div>
              <Link to="/contact" className="home-contact-btn home-contact-btn-amber" style={{ padding: '0.85rem 1.8rem', fontSize: '0.92rem', flex: 'none' }}>
                <MessageSquare size={16} />
                <span>{t('home_contact_inquiry_btn', 'Go to Contact & Inquiries Page')}</span>
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
