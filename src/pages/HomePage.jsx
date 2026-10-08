import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ModernHero from '../components/ModernHero';
import InteractiveBudgetWidget from '../components/InteractiveBudgetWidget';
import ProviderCard from '../components/ProviderCard';
import StarRating from '../components/StarRating';
import {
  Building2, Palette, Music, UtensilsCrossed, Scissors, Car,
  ChevronRight, CheckCircle2, ShieldCheck, Sparkles
} from 'lucide-react';

export default function HomePage() {
  const { providers, t } = useAppContext();

  const featuredVendors = providers.slice(0, 6);

  const CATEGORIES_DATA = [
    { id: 'kumbi', name: 'Venues (Kumbi)', icon: Building2, count: '65+ Venues', desc: 'Grand ballrooms, beachfront resorts & lush garden spaces' },
    { id: 'wapambaji', name: 'Decorators (Wapambaji)', icon: Palette, count: '48+ Decorators', desc: 'Luxury floral arrangements, lighting & custom stage designs' },
    { id: 'entertainment', name: 'MCs & Music', icon: Music, count: '35+ Performers', desc: 'Charismatic wedding MCs, live bands & high-energy DJs' },
    { id: 'catering', name: 'Catering Services', icon: UtensilsCrossed, count: '52+ Caterers', desc: 'Authentic Tanzanian buffets, international dining & cakes' },
    { id: 'saloon', name: 'Saloon & Beauty', icon: Scissors, count: '40+ Stylists', desc: 'Bridal makeup artists, hair styling, henna & grooming' },
    { id: 'transport', name: 'Bridal Transport', icon: Car, count: '28+ Fleet Owners', desc: 'Chauffeur-driven luxury SUVs, classic cars & limousines' },
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
                <Sparkles size={14} /> NEW: CONVERSATIONAL AI EVENT BRAIN
              </div>

              <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '0.65rem', lineHeight: 1.2 }}>
                Plan Your Wedding Naturally in Seconds
              </h2>
              <p style={{ fontSize: '0.98rem', color: 'rgba(255, 255, 255, 0.88)', lineHeight: 1.6 }}>
                Tell our AI your budget (e.g. <strong style={{ color: '#F5A623' }}>300k, 5m, or TSh 15,000,000</strong>) and guests in English or Kiswahili. Get realistic allocations, live preparation checklists, and real verified Tanzanian vendor matches instantly.
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
                <span>✨ Ask MY DAY AI</span>
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
              color: '#F5A623',
              padding: '0.35rem 1rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.82rem',
              fontWeight: 800,
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <Sparkles size={15} /> All-in-One Marketplace
            </div>

            <h2 style={{ fontSize: '2.6rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '0.6rem' }}>
              Explore Wedding Categories
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto', fontWeight: 500 }}>
              Connect with top-rated, 100% verified Tanzanian providers for your dream celebration.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
                    color: '#F5A623',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    Browse Category <ChevronRight size={16} />
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
                color: '#F5A623',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.35rem'
              }}>
                Top Choice
              </div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-text)' }}>
                Featured Verified Vendors
              </h2>
            </div>

            <Link to="/marketplace" className="btn-pill-amber" style={{ padding: '0.85rem 1.8rem' }}>
              View All Vendors ({providers.length}) <ChevronRight size={18} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
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
            padding: '4rem 3rem',
            color: '#FFFFFF',
            boxShadow: 'var(--shadow-lg)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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
                <ShieldCheck size={16} /> 100% Mobile Money Protected
              </div>

              <h2 style={{ fontSize: '2.8rem', color: '#FFFFFF', fontWeight: 900, lineHeight: 1.18, marginBottom: '1.35rem' }}>
                Why Couples Across Tanzania <br />
                <span className="gradient-text-amber">Love MY DAY</span>
              </h2>

              <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.88)', lineHeight: 1.65, marginBottom: '2.25rem' }}>
                We eliminate booking stress, hidden pricing, and deposit scams. Every vendor portfolio is verified, pricing is transparent, and your booking deposit is secured in mobile escrow.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {[
                  '100% Verified Identity & Real Portfolios',
                  'Instant Date Availability Checking',
                  'Escrow Deposits via M-Pesa, Tigo Pesa & Airtel',
                  'Real-Time Wedding Budget Tracking'
                ].map((text, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.92rem', fontWeight: 700 }}>
                    <CheckCircle2 size={18} color="#F5A623" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial Spotlight Card */}
            <div className="glass-card-dark" style={{ padding: '2.25rem', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}>
                <StarRating rating={5} />
              </div>

              <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: '#FFFFFF', lineHeight: 1.65, marginBottom: '1.75rem' }}>
                "MY DAY made our Dar es Salaam wedding preparation effortless! We booked our ballroom venue, decorator, and MC within 2 days with complete deposit security."
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
                  fontSize: '1.15rem',
                  boxShadow: 'var(--shadow-amber)'
                }}>
                  A&M
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#FFFFFF' }}>Amina & Moses</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.75)' }}>Dar es Salaam • Married Nov 2025</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Vendor Registration CTA */}
      <section style={{ padding: '0 0 6rem' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="glass-card" style={{
            padding: '4rem 2rem',
            maxWidth: '880px',
            margin: '0 auto',
            border: '2px dashed #E8DCCF',
            borderRadius: 'var(--radius-xl)'
          }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '1rem' }}>
              Are You a Wedding Service Provider?
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', maxWidth: '640px', margin: '0 auto 2.25rem', fontWeight: 500 }}>
              Grow your venue, decor, catering, or entertainment business with direct bookings from couples across Tanzania.
            </p>
            <Link to="/become-vendor" className="btn-pill-mocha" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
              Register Your Business as a Verified Vendor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
