import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ModernHero from '../components/ModernHero';
import PortfolioShowcase from '../components/PortfolioShowcase';
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

  const handleSurfaceSpecularMove = (e) => {
    const card = e.target.closest(
      '.glass-slab, .cl-category-card, .dash-vendor-card, .celebration-budget-card, .trust-panel, .glass-dock, .ai-glass-showcase'
    );
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const xPct = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + '%';
    const yPct = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + '%';
    card.style.setProperty('--card-mouse-x', xPct);
    card.style.setProperty('--card-mouse-y', yPct);
    card.style.setProperty('--specular-x', xPct);
    card.style.setProperty('--specular-y', yPct);
  };

  return (
    <div
      onMouseMove={handleSurfaceSpecularMove}
      style={{ background: 'transparent', minHeight: '100vh', color: 'var(--color-text)', position: 'relative' }}
    >
      {/* 1. Ultra-Modern Apple Liquid Glass Hero Section */}
      <ModernHero />

      {/* 2. Live Interactive Budget & Countdown Widget */}
      <InteractiveBudgetWidget />

      {/* 2.5 AI Event Planner Feature Spotlight (Apple Liquid Glass Architecture) */}
      <section style={{ padding: '1.5rem 0 2rem' }}>
        <div className="container">
          <div className="glass-slab ai-glass-showcase">
            <div>
              <div className="ai-glass-badge">
                <Sparkles size={14} /> {t('ai_badge_new', '✨ MY DAY AI Planner • Event Intelligence')}
              </div>

              <h2 style={{
                fontSize: 'clamp(1.75rem, 3.2vw, 2.35rem)',
                fontWeight: 850,
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
                color: 'var(--app-text-primary)',
                marginBottom: '0.75rem'
              }}>
                {t('ai_banner_title', 'Instant Budget Allocations & Intelligent Planning')}
              </h2>

              <p style={{
                fontSize: '0.98rem',
                color: 'var(--app-text-secondary)',
                lineHeight: 1.6,
                maxWidth: '560px',
                marginBottom: '1.5rem',
                fontWeight: 500
              }}>
                {t('ai_banner_desc', 'Plan your entire wedding in Tanzanian Shillings with intelligent milestone scheduling, vendor matching, and protected 30% advance escrow calculations.')}
              </p>

              {/* Interactive prompt pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.75rem' }}>
                <Link to="/planner" className="ai-prompt-chip">
                  <span>🏖️ Venues in Mbezi Beach under TSh 5M</span>
                </Link>
                <Link to="/planner" className="ai-prompt-chip">
                  <span>🍰 300-guest cake & catering allocation</span>
                </Link>
                <Link to="/planner" className="ai-prompt-chip">
                  <span>📅 12-month timeline for Dar es Salaam</span>
                </Link>
              </div>

              <Link to="/planner" className="btn-primary" style={{ padding: '0.85rem 1.85rem', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>✨ {t('ai_banner_btn', 'Launch AI Planner')}</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Right side: Floating Translucent Glass HUD Tablet */}
            <div className="glass-dock" style={{
              padding: '1.75rem',
              borderRadius: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--liquid-sapphire-500)', boxShadow: '0 0 10px var(--liquid-sapphire-500)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--liquid-sapphire-500)' }}>
                    Live Budget Architecture
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--app-text-muted)' }}>TZS • Dar es Salaam</span>
              </div>

              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--app-text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                TSh 25,000,000
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--app-text-secondary)', marginBottom: '1.25rem' }}>
                Target Wedding Budget • 350 Estimated Guests
              </div>

              {/* Progress spectrum bar */}
              <div style={{ height: '8px', borderRadius: '9999px', background: 'rgba(0, 102, 238, 0.12)', overflow: 'hidden', display: 'flex', gap: '2px', marginBottom: '1.25rem' }}>
                <div style={{ width: '30%', background: 'var(--liquid-sapphire-500)', borderRadius: '9999px' }} title="Venues (30%)" />
                <div style={{ width: '25%', background: 'var(--liquid-sapphire-400)', borderRadius: '9999px' }} title="Decor & Floral (25%)" />
                <div style={{ width: '20%', background: 'var(--liquid-sapphire-300)', borderRadius: '9999px' }} title="Catering (20%)" />
                <div style={{ width: '15%', background: '#60A5FA', borderRadius: '9999px' }} title="Music & Photo (15%)" />
                <div style={{ width: '10%', background: '#93C5FD', borderRadius: '9999px' }} title="Reserve (10%)" />
              </div>

              {/* Escrow badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '16px',
                background: 'rgba(0, 102, 238, 0.08)',
                border: '1px solid rgba(0, 102, 238, 0.16)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 750, color: 'var(--app-text-primary)' }}>
                  <ShieldCheck size={16} color="var(--liquid-sapphire-500)" />
                  <span>30% Advance Escrow Reserve</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--liquid-sapphire-500)' }}>
                  TSh 7,500,000
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Explore Wedding Service Categories */}
      <section style={{ padding: '2rem 0 3rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="glass-lens" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(0, 102, 238, 0.10)',
              color: 'var(--liquid-sapphire-500)',
              padding: '0.35rem 0.95rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <Sparkles size={14} /> {t('market_badge')}
            </div>

            <h2 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)', fontWeight: 850, letterSpacing: '-0.025em', color: 'var(--app-text-primary)', marginBottom: '0.5rem' }}>
              {t('market_title')}
            </h2>
            <p style={{ color: 'var(--app-text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', fontWeight: 500 }}>
              {t('market_subtitle')}
            </p>
          </div>

          <div className="homepage-categories-grid">
            {CATEGORIES_DATA.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={`/marketplace?cat=${cat.id}`}
                  className="glass-reflective-edge glass-frosted-translucent cl-category-card"
                >
                  <div>
                    {/* Top Count Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div className="cl-cat-icon">
                        <Icon size={20} />
                      </div>

                      <span className="glass-clear-optical cl-cat-badge">
                        {cat.count}
                      </span>
                    </div>

                    <h3 className="cl-cat-title">
                      {cat.name}
                    </h3>
                    <p className="cl-cat-desc">
                      {cat.desc}
                    </p>
                  </div>

                  <span className="cl-cat-link">
                    {t('browse_category')} <ChevronRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Featured Verified Vendors Grid */}
      <section style={{ padding: '2.5rem 0 3.5rem', background: 'transparent' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: 'var(--liquid-sapphire-500)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.35rem'
              }}>
                {t('featured_badge')}
              </div>
              <h2 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)', fontWeight: 850, letterSpacing: '-0.025em', color: 'var(--app-text-primary)' }}>
                {t('featured_title_verified')}
              </h2>
            </div>

            <Link to="/marketplace" className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
              {t('view_all_vendors')} ({providers.length}) <ChevronRight size={16} />
            </Link>
          </div>

          <div className="homepage-vendors-grid">
            {featuredVendors.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      </section>

      {/* 4.5 Real Weddings — editorial portfolio wall */}
      <PortfolioShowcase />

      {/* 5. Trust Guarantee & High Impact Proof Banner (Liquid Glass Slab) */}
      <section style={{ padding: '2.5rem 0' }}>
        <div className="container">
          <div className="glass-deep-dimensional trust-panel" style={{
            borderRadius: '28px',
            padding: '2.5rem 2.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="ai-glass-badge" style={{ marginBottom: '1rem' }}>
                <ShieldCheck size={15} color="var(--liquid-sapphire-500)" /> {t('trust_badge')}
              </div>

              <h2 style={{ fontSize: 'clamp(1.85rem, 3vw, 2.35rem)', fontWeight: 850, letterSpacing: '-0.025em', color: 'var(--app-text-primary)', marginBottom: '0.85rem', lineHeight: 1.2 }}>
                {t('trust_title_pre')} <br />
                <span style={{ color: 'var(--liquid-sapphire-500)' }}>
                  {t('trust_title_post')}
                </span>
              </h2>

              <p style={{ fontSize: '1rem', color: 'var(--app-text-secondary)', lineHeight: 1.6, marginBottom: '1.75rem', fontWeight: 500 }}>
                {t('trust_desc')}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                {[
                  t('trust_point_1'),
                  t('trust_point_2'),
                  t('trust_point_3'),
                  t('trust_point_4')
                ].map((text, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 750, color: 'var(--app-text-primary)' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Concierge Guarantee Spotlight Card */}
            <div className="glass-clear-optical trust-quote" style={{
              borderRadius: '24px',
              padding: '1.75rem',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
                <StarRating rating={5} />
              </div>

              <p style={{ fontSize: '0.96rem', fontStyle: 'italic', color: 'var(--app-text-body)', lineHeight: 1.6, marginBottom: '1.5rem', fontWeight: 500 }}>
                {t('testimonial_quote')}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(0, 102, 238, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--liquid-sapphire-500)'
                }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--app-text-primary)' }}>{t('testimonial_names')}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--app-text-muted)', fontWeight: 600 }}>{t('testimonial_meta')}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Vendor Registration CTA (Liquid Glass Slab) */}
      <section style={{ padding: '1.5rem 0 3.5rem' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="glass-illuminated" style={{
            padding: '2.75rem 2rem',
            maxWidth: '820px',
            margin: '0 auto',
            borderRadius: '28px'
          }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 850, letterSpacing: '-0.025em', color: 'var(--app-text-primary)', marginBottom: '0.75rem' }}>
              {t('vendor_cta_title')}
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--app-text-secondary)', maxWidth: '580px', margin: '0 auto 1.75rem', fontWeight: 500, lineHeight: 1.6 }}>
              {t('vendor_cta_desc')}
            </p>
            <Link to="/become-vendor" className="btn-primary glass-puck" style={{ padding: '0.85rem 2.25rem', fontSize: '0.98rem' }}>
              {t('vendor_cta_btn')}
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Official Headquarters & Client Support */}
      <section className="home-contact-section" style={{ padding: '0 0 4rem' }}>
        <div className="container">
          <div className="glass-frosted-translucent home-contact-box">
            <div className="home-contact-header">
              <div className="ai-glass-badge">
                <MapPin size={15} /> {t('home_contact_badge', 'Dar es Salaam Headquarters & Support')}
              </div>
              <h2 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.4rem)', fontWeight: 850, letterSpacing: '-0.025em', color: 'var(--app-text-primary)', marginBottom: '0.65rem' }}>
                {t('home_contact_title', 'Visit Our Office or Connect With Our Team')}
              </h2>
              <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.98rem', lineHeight: 1.6, fontWeight: 500 }}>
                {t('home_contact_desc', 'From selecting verified wedding vendors to reviewing 30% protected escrow contracts, our dedicated concierge team in Dar es Salaam is ready to assist you every day.')}
              </p>
            </div>

            <div className="home-contact-grid">
              {/* Card 1: Physical Office */}
              <div className="glass-deep-dimensional home-contact-card">
                <div>
                  <div className="home-contact-icon-bubble">
                    <MapPin size={22} />
                  </div>
                  <h3 className="home-contact-card-title">{t('home_contact_office_title', 'Dar es Salaam HQ')}</h3>
                  <div className="home-contact-card-subtitle">{t('contact_office_label', 'Physical Office:')}</div>
                  <div className="home-contact-card-body">
                    <strong style={{ color: 'var(--app-text-primary)' }}>Mbezi beach, makonde.</strong><br />
                    Bagamoyo Road,<br />
                    Dar es Salaam, Tanzania.
                  </div>
                </div>
                <div>
                  <a
                    href="https://maps.google.com/?q=Mbezi+beach+makonde+Bagamoyo+Road+Dar+es+Salaam+Tanzania"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="home-contact-btn home-contact-btn-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>{t('home_contact_office_btn', 'Open Directions')}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Card 2: Support Hotlines */}
              <div className="glass-deep-dimensional home-contact-card">
                <div>
                  <div className="home-contact-icon-bubble">
                    <Phone size={22} />
                  </div>
                  <h3 className="home-contact-card-title">{t('home_contact_hotline_title', 'Support Hotlines')}</h3>
                  <div className="home-contact-card-subtitle">{t('contact_hotline_label', 'Support Hotline:')}</div>
                  <div className="home-contact-card-body">
                    <div style={{ marginBottom: '0.4rem' }}>
                      <strong style={{ color: 'var(--app-text-primary)' }}>+255 766 466 187</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--app-text-muted)', marginLeft: '0.35rem' }}>(Calls & WhatsApp)</span>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--app-text-primary)' }}>+255 619 180 779</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--app-text-muted)', marginLeft: '0.35rem' }}>(Direct Line)</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <a href="tel:+255766466187" className="home-contact-btn btn-primary glass-puck" style={{ width: '100%', justifyContent: 'center' }}>
                    <Phone size={14} />
                    <span>{t('home_contact_call_btn', 'Call Now')}</span>
                  </a>
                  <a
                    href="https://wa.me/255766466187?text=Hello%20MY%20DAY%20Wedding%20Team%2C%20I%20would%20like%20assistance%20with%20my%20wedding%20plans."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="home-contact-btn home-contact-btn-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>{t('home_contact_whatsapp_btn', 'WhatsApp Chat')}</span>
                  </a>
                </div>
              </div>

              {/* Card 3: Official Email */}
              <div className="glass-deep-dimensional home-contact-card">
                <div>
                  <div className="home-contact-icon-bubble">
                    <Mail size={22} />
                  </div>
                  <h3 className="home-contact-card-title">{t('home_contact_email_title', 'Official Email')}</h3>
                  <div className="home-contact-card-subtitle">{t('contact_email_label_title', 'Email Us:')}</div>
                  <div className="home-contact-card-body">
                    <div style={{ marginBottom: '0.4rem' }}>
                      <strong style={{ color: 'var(--app-text-primary)' }}>support@myday.co.tz</strong><br />
                      <span style={{ fontSize: '0.78rem', color: 'var(--app-text-muted)' }}>{t('trust_couples_vendor', 'Couples & Vendor Assistance')}</span>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--app-text-primary)' }}>info@myday.co.tz</strong><br />
                      <span style={{ fontSize: '0.78rem', color: 'var(--app-text-muted)' }}>Partnerships & Corporate HQ</span>
                    </div>
                  </div>
                </div>
                <div>
                  <a href="mailto:support@myday.co.tz" className="home-contact-btn home-contact-btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                    <Mail size={14} />
                    <span>support@myday.co.tz</span>
                  </a>
                </div>
              </div>

              {/* Card 4: Operating Hours */}
              <div className="glass-deep-dimensional home-contact-card">
                <div>
                  <div className="home-contact-icon-bubble">
                    <Clock size={22} />
                  </div>
                  <h3 className="home-contact-card-title">{t('home_contact_hours_title', 'Platform Operating Hours')}</h3>
                  <div className="home-contact-card-subtitle">Africa/Dar_es_Salaam (EAT)</div>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    background: officeStatus.isOpen ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0, 102, 238, 0.12)',
                    color: officeStatus.isOpen ? '#059669' : 'var(--liquid-sapphire-500)',
                    fontSize: '0.78rem',
                    fontWeight: 750,
                    marginBottom: '0.75rem'
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: officeStatus.isOpen ? '#10b981' : 'var(--liquid-sapphire-500)'
                    }} />
                    <span>{officeStatus.isOpen ? t('office_open_now', 'Office Open Now (8:00 AM – 5:00 PM EAT)') : t('office_closed_now', 'Office Closed (Opens Monday 8:00 AM EAT)')}</span>
                  </div>

                  <div className="home-contact-card-body">
                    <div style={{ fontWeight: 750, color: 'var(--app-text-primary)', marginBottom: '0.2rem' }}>
                      {t('home_contact_hours_detail', 'Mon – Fri: 8:00 AM – 5:00 PM EAT')}
                    </div>
                    <div style={{ color: 'var(--app-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      {t('home_contact_hours_weekend', 'Saturday & Sunday: Closed')}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--liquid-sapphire-500)', fontWeight: 800 }}>
                      ✨ {t('home_contact_hours_online', 'Couples can plan weddings online 24/7')}
                    </div>
                  </div>
                </div>
                <div>
                  <Link to="/contact" className="home-contact-btn home-contact-btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                    <Clock size={14} />
                    <span>{t('book_consultation_btn', 'Book Consultation')}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Banner */}
            <div className="home-contact-banner">
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#FFFFFF', marginBottom: '0.25rem' }}>
                  {t('home_contact_inquiry_prompt', 'Need personal assistance or want to book an in-person meeting?')}
                </div>
                <div style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.88)' }}>
                  {t('business_timezone_note', 'All official business hours and appointments are in Africa/Dar_es_Salaam timezone (EAT).')}
                </div>
              </div>
              <Link to="/contact" className="btn-liquid-white glass-puck" style={{ padding: '0.85rem 1.85rem', fontSize: '0.92rem', flex: 'none', background: 'rgba(255, 255, 255, 0.95)', color: '#0052CC', boxShadow: 'inset 0 1.5px 0.5px #FFFFFF, 0 8px 24px rgba(0, 30, 80, 0.20)', border: '1px solid rgba(255, 255, 255, 0.65)' }}>
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
