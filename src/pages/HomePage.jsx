import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProviderCard from '../components/ProviderCard';
import StarRating from '../components/StarRating';
import { reviews } from '../data/initialData';
import { CheckCircle2, Sparkles, ChevronRight, Lock } from 'lucide-react';

const CATEGORIES_DATA = [
  {
    id: 'kumbi',
    name: 'Kumbi – Venues',
    icon: '🏰',
    desc: 'Find wedding halls, gardens, hotels, beaches, and outdoor venues that perfectly match your wedding style and guest capacity.'
  },
  {
    id: 'wapambaji',
    name: 'Wapambaji – Decorators',
    icon: '🎨',
    desc: 'Browse talented decorators and event planners with stunning portfolios and customizable decoration packages.'
  },
  {
    id: 'entertainment',
    name: 'MCs & Entertainment',
    icon: '🎤',
    desc: 'Hire experienced wedding MCs, DJs, live bands, cultural performers, and entertainers to make your celebration unforgettable.'
  },
  {
    id: 'catering',
    name: 'Catering',
    icon: '🍽️',
    desc: 'Choose from professional caterers offering delicious menus, beverages, cakes, desserts, and complete catering services.'
  },
  {
    id: 'saloon',
    name: 'Saloon & Barbershop',
    icon: '💇',
    desc: 'Book bridal makeup artists, hairstylists, nail technicians, spa services, and professional grooming for the bride and groom.'
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: '🚗',
    desc: 'Reserve luxury wedding cars, buses, vans, and chauffeur services for the bride, groom, family, and guests.'
  },
];

const WHY_CHOOSE_ITEMS = [
  'Everything in one place',
  'Trusted wedding professionals',
  'Transparent pricing',
  'Easy online booking',
  'Secure payments',
  'Availability calendar',
  'Verified customer reviews',
  'Wedding budget tracking',
];

const HOW_IT_WORKS_STEPS = [
  { step: '1', title: 'Discover', desc: 'Search thousands of wedding services by category, location, budget, and wedding date.' },
  { step: '2', title: 'Compare', desc: 'Compare prices, service packages, portfolios, ratings, and customer reviews before making a decision.' },
  { step: '3', title: 'Book', desc: 'Reserve your preferred vendors instantly and receive booking confirmation.' },
  { step: '4', title: 'Pay', desc: 'Pay securely using mobile money, bank cards, or other supported payment methods.' },
  { step: '5', title: 'Celebrate', desc: 'Relax and enjoy your special day while MY DAY keeps your wedding plans organized.' },
];

function HomePage() {
  const { providers } = useAppContext();
  const featuredVendors = providers.slice(0, 4);

  return (
    <div>
      {/* 1. Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-dark) 0%, #164738 50%, #205948 100%)',
        color: '#ffffff',
        padding: '5rem 1rem 6rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(212, 175, 55, 0.2)',
            color: 'var(--color-primary)',
            padding: '0.35rem 1rem',
            borderRadius: '1.5rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.25rem'
          }}>
            <Sparkles size={16} /> Tanzania's #1 All-in-One Wedding Platform
          </div>

          <h1 style={{
            fontSize: '3.2rem',
            fontFamily: 'var(--font-header)',
            color: '#ffffff',
            marginBottom: '1.25rem',
            lineHeight: 1.25
          }}>
            Everything You Need for Your Perfect Day
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '2.25rem',
            lineHeight: 1.6,
            maxWidth: '780px',
            margin: '0 auto 2.25rem'
          }}>
            Plan your wedding with confidence. Discover trusted wedding professionals, compare packages, check availability, book your favorite vendors, and pay securely—all in one place.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/marketplace"
              style={{
                background: 'var(--color-primary)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1.05rem',
                padding: '0.85rem 2rem',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Browse Services <ChevronRight size={18} />
            </Link>

            <Link
              to="/wedding"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                fontWeight: 700,
                fontSize: '1.05rem',
                padding: '0.85rem 2rem',
                borderRadius: 'var(--radius)'
              }}
            >
              Create Wedding Profile
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Browse Categories Section */}
      <section className="container py-12" style={{ padding: '4rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.25rem', color: 'var(--color-dark)', marginBottom: '0.5rem' }}>
            Browse Categories
          </h2>
          <p style={{ color: '#666', fontSize: '1rem' }}>
            Discover trusted professionals across 6 core wedding service categories in Tanzania
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {CATEGORIES_DATA.map(cat => (
            <Link
              key={cat.id}
              to={`/marketplace?category=${cat.id}`}
              className="card"
              style={{
                padding: '1.75rem',
                background: '#ffffff',
                border: '1px solid #EAE7E1',
                borderRadius: 'var(--radius)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'var(--transition)'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{cat.icon}</div>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-dark)', marginBottom: '0.5rem' }}>
                {cat.name}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {cat.desc}
              </p>
              <span style={{
                marginTop: 'auto',
                color: 'var(--color-primary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                Explore Vendors <ChevronRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Wedding Professionals */}
      <section style={{ background: '#F4F2EE', padding: '4rem 1rem' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                Top Rated Vendors
              </span>
              <h2 style={{ fontSize: '2.25rem', color: 'var(--color-dark)', marginTop: '0.25rem' }}>
                Featured Wedding Professionals
              </h2>
            </div>
            <Link to="/marketplace" style={{ fontWeight: 700, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              View All Vendors <ChevronRight size={18} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {featuredVendors.map(vendor => (
              <ProviderCard key={vendor.id} provider={vendor} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why Choose MY DAY? */}
      <section className="container" style={{ padding: '4rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.25rem', color: 'var(--color-dark)', marginBottom: '0.5rem' }}>
            Why Choose MY DAY?
          </h2>
          <p style={{ color: '#666', fontSize: '1rem' }}>
            Everything you need for a seamless, transparent, and joyful wedding planning experience
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {WHY_CHOOSE_ITEMS.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius)',
                padding: '1.25rem 1.5rem',
                border: '1px solid #EAE7E1',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--color-dark)'
              }}
            >
              <CheckCircle2 size={22} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. How MY DAY Works */}
      <section style={{ background: 'var(--color-dark)', color: '#ffffff', padding: '5rem 1rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
              Step-by-Step Guide
            </span>
            <h2 style={{ fontSize: '2.5rem', color: '#ffffff', marginTop: '0.25rem' }}>
              How MY DAY Works
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {HOW_IT_WORKS_STEPS.map(s => (
              <div
                key={s.step}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 'var(--radius)',
                  padding: '1.75rem 1.25rem',
                  border: '1px solid rgba(255,255,255,0.12)',
                  position: 'relative'
                }}
              >
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-header)',
                  color: 'var(--color-primary)',
                  marginBottom: '0.5rem'
                }}>
                  0{s.step}
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Wedding Planning Dashboard Highlight & Budget Planner Teaser */}
      <section className="container" style={{ padding: '5rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <span style={{ color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
              All-in-One Command Center
            </span>
            <h2 style={{ fontSize: '2.25rem', color: 'var(--color-dark)', marginTop: '0.25rem', marginBottom: '1rem' }}>
              Wedding Planning Dashboard & Budget Planner
            </h2>
            <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Create your wedding profile and manage everything from one place. Track your guest count, budget utilization, vendor bookings, payments, and timeline checklist.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '2rem' }}>
              <div>• Wedding date & location</div>
              <div>• Guest count manager</div>
              <div>• Live budget tracker</div>
              <div>• Booking progress status</div>
              <div>• Payment history & receipts</div>
              <div>• Verified vendor contacts</div>
            </div>

            <Link to="/wedding" className="button">Set Up Your Wedding Dashboard</Link>
          </div>

          {/* Budget Planner Interactive Preview Card */}
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius)', padding: '1.75rem', border: '1px solid #EAE7E1', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Wedding Budget Checklist</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700 }}>TSh 15,000,000 Target</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #EEE' }}>
                <span>Venue (Kumbi)</span>
                <span style={{ color: '#2E7D32', fontWeight: 700 }}>Booked (TSh 2.5M)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #EEE' }}>
                <span>Decoration (Wapambaji)</span>
                <span style={{ color: '#E65100', fontWeight: 700 }}>Pending Deposit</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #EEE' }}>
                <span>MC & Entertainment</span>
                <span style={{ color: '#2E7D32', fontWeight: 700 }}>Booked (TSh 800k)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #EEE' }}>
                <span>Catering</span>
                <span style={{ color: '#E65100', fontWeight: 700 }}>Pending (TSh 30k/head)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #EEE' }}>
                <span>Beauty & Salon</span>
                <span style={{ color: '#888', fontWeight: 600 }}>Not Booked</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                <span>Transport</span>
                <span style={{ color: '#2E7D32', fontWeight: 700 }}>Booked (TSh 700k)</span>
              </div>
            </div>

            <div style={{ background: '#FAF9F6', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #EAE7E1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                <span>Remaining Available Balance:</span>
                <strong style={{ color: '#2E7D32' }}>TSh 6,500,000</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
                <span>Verified Payment Progress:</span>
                <strong style={{ color: 'var(--color-primary)' }}>57% Paid</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Customer Reviews */}
      <section style={{ background: '#F4F2EE', padding: '4rem 1rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
              Real Couple Testimonials
            </span>
            <h2 style={{ fontSize: '2.25rem', color: 'var(--color-dark)', marginTop: '0.25rem' }}>
              Customer Reviews
            </h2>
            <p style={{ color: '#666', fontSize: '1rem' }}>
              Read genuine reviews from couples who planned their dream wedding using MY DAY
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {reviews.map(rev => (
              <div key={rev.id} className="card" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: 'var(--radius)', border: '1px solid #EAE7E1' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <StarRating rating={rev.rating} count={1} />
                </div>
                <p style={{ fontSize: '0.92rem', color: '#444', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  "{rev.review}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={rev.photo} alt={rev.customerName} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-dark)' }}>{rev.customerName}</h4>
                    <div style={{ fontSize: '0.78rem', color: '#888' }}>Wedding Date: {rev.weddingDate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Become a Vendor Section */}
      <section className="container" style={{ padding: '5rem 1rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius)',
          padding: '3rem 2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h2 style={{ fontSize: '2.5rem', color: '#ffffff', marginBottom: '1rem' }}>
            Are You a Wedding Service Professional?
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.95)', maxWidth: '700px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Grow your business by listing your venue, decoration, catering, MC, beauty, or transport services on MY DAY. Receive instant booking requests and 30% advance deposits.
          </p>
          <Link
            to="/become-vendor"
            style={{
              background: 'var(--color-dark)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1.05rem',
              padding: '0.85rem 2.25rem',
              borderRadius: 'var(--radius)',
              display: 'inline-block'
            }}
          >
            Register as a Vendor
          </Link>
        </div>
      </section>

      {/* 9. Secure Payments Banner */}
      <section style={{ background: '#FAF9F6', padding: '3.5rem 1rem', borderTop: '1px solid #EAE7E1' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-success)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <Lock size={16} /> Buyer Protection Guarantee
          </div>
          <h2 style={{ fontSize: '2rem', color: 'var(--color-dark)', marginBottom: '0.75rem' }}>
            Secure Payments & Instant Digital Receipts
          </h2>
          <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Supported options include M-Pesa, Tigo Pesa, Airtel Money, HaloPesa, Visa, Mastercard, and Bank Transfers. Every payment generates an official digital receipt and confirmed booking reference.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', fontWeight: 700, color: '#444' }}>
            <span style={{ background: '#fff', border: '1px solid #DDD', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>🔴 M-Pesa (Vodacom)</span>
            <span style={{ background: '#fff', border: '1px solid #DDD', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>🔵 Tigo Pesa</span>
            <span style={{ background: '#fff', border: '1px solid #DDD', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>🔴 Airtel Money</span>
            <span style={{ background: '#fff', border: '1px solid #DDD', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>🟠 HaloPesa</span>
            <span style={{ background: '#fff', border: '1px solid #DDD', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>💳 Visa / Mastercard</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
