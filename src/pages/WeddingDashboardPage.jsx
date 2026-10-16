import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Calendar, Users, PlusCircle, Star, ArrowRight, Wand2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PaymentModal from '../components/PaymentModal';
import WorkspaceCollaborationCard from '../components/WorkspaceCollaborationCard';
import SharedChecklistCard from '../components/SharedChecklistCard';
import SharedDecisionsCard from '../components/SharedDecisionsCard';
import SharedBudgetLedgerCard from '../components/SharedBudgetLedgerCard';

function useCountdown(dateStr) {
  const target = dateStr ? new Date(dateStr).getTime() : NaN;
  const calc = () => {
    if (Number.isNaN(target)) return null;
    const diff = Math.max(0, target - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
    };
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setLeft(calc()), 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [dateStr]);
  return left;
}

function AnimatedNumber({ value, prefix = '' }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setN(value); return; }
    let raf; const start = performance.now(); const dur = 900;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{prefix}{n.toLocaleString()}</>;
}

function BudgetRing({ pct }) {
  const r = 44, c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  useEffect(() => { const t = setTimeout(() => setShown(pct), 120); return () => clearTimeout(t); }, [pct]);
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" role="img" aria-label={`${pct}% of budget allocated`}>
      <circle cx="55" cy="55" r={r} fill="none" stroke="#E6D9CC" strokeWidth="10" />
      <circle className="dash-ring-progress" cx="55" cy="55" r={r} fill="none" stroke="var(--color-primary)" strokeWidth="10"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * shown) / 100} transform="rotate(-90 55 55)" />
      <text x="55" y="61" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--color-text)">{pct}%</text>
    </svg>
  );
}

const ALL_CATEGORIES = [
  { id: 'kumbi', name: 'Kumbi (Venue)', icon: '🏰' },
  { id: 'catering', name: 'Catering', icon: '🍽️' },
  { id: 'wapambaji', name: 'Wapambaji (Decorators)', icon: '🎨' },
  { id: 'entertainment', name: 'MCs & Entertainment', icon: '🎤' },
  { id: 'saloon', name: 'Saloon & Barbershop', icon: '💇' },
  { id: 'transport', name: 'Transport', icon: '🚗' },
];

function WeddingDashboardPage() {
  const { wedding, bookings, providers } = useAppContext();
  const [activePaymentModal, setActivePaymentModal] = useState(null);

  const totalBookedAmount = bookings.reduce((sum, b) => sum + b.price, 0);
  const totalPaidAmount = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const remainingBudget = Math.max(0, wedding.budget - totalBookedAmount);
  const budgetUsagePct = Math.min(100, Math.round((totalBookedAmount / (wedding.budget || 1)) * 100));

  const categoryStatusMap = ALL_CATEGORIES.map(cat => {
    const bookedCategory = bookings.find(b => b.category === cat.id);
    return {
      ...cat,
      isBooked: !!bookedCategory,
      booking: bookedCategory,
      provider: bookedCategory ? providers.find(p => p.id === bookedCategory.providerId) : null
    };
  });

  const countdown = useCountdown(wedding.date);
  const featured = [...providers].filter(p => p.isFeatured).slice(0, 3);
  const bookedCount = categoryStatusMap.filter(c => c.isBooked).length;

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Premium Hero */}
      <section className="dash-hero" aria-label="Wedding overview">
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 min(100%, 280px)', minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245,166,35,0.18)', color: '#F5A623', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <Sparkles size={14} /> Official Wedding Event Planner
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#FFFFFF', marginBottom: '0.6rem', fontWeight: 800 }}>{wedding.title}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Heart size={16} color="#F5A623" fill="#F5A623" /> {wedding.bride} &amp; {wedding.groom}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={16} color="#F5A623" /> {wedding.date} ({wedding.location})</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Users size={16} color="#F5A623" /> {wedding.guests} Guests</span>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              <Link to="/marketplace" className="dash-quick-action dash-quick-action-primary"><PlusCircle size={15} /> Find Vendors</Link>
              <Link to="/wedding" className="dash-quick-action dash-quick-action-glass">Edit Wedding Settings</Link>
            </div>
          </div>
          {countdown && (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }} aria-label="Countdown to wedding">
              <div className="dash-countdown-unit"><span className="dash-countdown-value">{countdown.days}</span><span className="dash-countdown-label">Days</span></div>
              <span className="dash-countdown-sep">:</span>
              <div className="dash-countdown-unit"><span className="dash-countdown-value">{String(countdown.hours).padStart(2, '0')}</span><span className="dash-countdown-label">Hours</span></div>
              <span className="dash-countdown-sep">:</span>
              <div className="dash-countdown-unit"><span className="dash-countdown-value">{String(countdown.minutes).padStart(2, '0')}</span><span className="dash-countdown-label">Mins</span></div>
            </div>
          )}
        </div>
      </section>

      {/* Financial Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Target Budget', value: wedding.budget, color: 'var(--color-text)', sub: 'Set during profile setup', accent: '#3D2D21' },
          { label: 'Total Committed/Booked', value: totalBookedAmount, color: 'var(--color-primary-hover)', sub: `${budgetUsagePct}% of total budget used`, accent: '#F5A623' },
          { label: 'Total Paid To Date', value: totalPaidAmount, color: 'var(--color-success)', sub: 'Verified Mobile Money / Card', accent: '#2E7D32' },
          { label: 'Remaining Available Budget', value: remainingBudget, color: remainingBudget > 0 ? 'var(--color-success)' : 'var(--color-error)', sub: 'Unallocated funds remaining', accent: '#B8860B' },
        ].map((card, i) => (
          <div key={i} className={`dash-stat-card dash-animate dash-animate-delay-${i + 1}`} style={{ '--card-accent': card.accent }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', fontWeight: 500 }}>{card.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: card.color }}><AnimatedNumber value={card.value} prefix="TSh " /></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.25rem' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Budget Utilization */}
      <div className="dash-stat-card dash-animate dash-animate-delay-5" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <BudgetRing pct={budgetUsagePct} />
        <div style={{ flex: '1 1 240px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            <span>Wedding Budget Utilization</span>
            <span>{bookedCount}/{ALL_CATEGORIES.length} services booked</span>
          </div>
          <div className="dash-progress-bar">
            <div className="dash-progress-fill" style={{ width: `${budgetUsagePct}%`, background: 'var(--color-primary)', boxShadow: 'var(--shadow-glow)' }} />
          </div>
        </div>
      </div>

      {/* Vendor Discovery */}
      {featured.length > 0 && (
        <section className="dash-animate dash-animate-delay-6" style={{ marginBottom: '2.5rem' }}>
          <div className="dash-section-header">
            <h2 className="dash-section-title">Featured Vendors</h2>
            <Link to="/marketplace" className="dash-section-link">View all <ArrowRight size={15} /></Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            {featured.map(p => (
              <Link key={p.id} to={`/marketplace?category=${p.category}`} className="dash-vendor-card">
                <div className="dash-vendor-img-wrap">
                  <img className="dash-vendor-img" src={p.image} alt={p.name} loading="lazy" />
                  <span className="dash-vendor-badge">{p.category}</span>
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0.5rem' }}>{p.location}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary-hover)' }}>
                    <Star size={14} fill="var(--color-primary)" color="var(--color-primary)" /> {p.rating}
                    <span className="dash-dot-sep" /> <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>{p.reviewsCount} reviews</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* AI Planner */}
      <div className="dash-ai-card dash-animate dash-animate-delay-7" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '1.1rem' }}><Wand2 size={18} color="#F5A623" /> MY DAY AI Planner</div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', marginTop: '0.35rem' }}>Ask the AI for vendor picks, budget advice and timeline ideas.</p>
        </div>
        <Link to="/marketplace" className="dash-quick-action dash-quick-action-primary" style={{ position: 'relative', zIndex: 1 }}>Explore ideas</Link>
      </div>

      {/* Shared Wedding Collaboration & Permissions Hub */}
      <WorkspaceCollaborationCard />

      {/* Shared Action Items & Checklist */}
      <SharedChecklistCard />

      {/* Shared Decisions Polls & Knowledge Notes */}
      <SharedDecisionsCard />

      {/* Real-time Shared Financial Ledger & Expenses */}
      <SharedBudgetLedgerCard />

      {/* 6 Core Categories Booking Tracker */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-text)', fontWeight: 800 }}>6 Core Services Checklist</h2>
          <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: 'var(--color-primary-hover)' }}>
            <PlusCircle size={16} /> Browse Marketplace
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
          {categoryStatusMap.map(cat => (
            <div
              key={cat.id}
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                border: cat.isBooked ? '2px solid rgba(255, 157, 59, 0.4)' : '1px dashed var(--color-border)',
                boxShadow: cat.isBooked ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)' }}>{cat.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: cat.isBooked ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: 700 }}>
                      {cat.isBooked ? '✓ Reserved & Booked' : 'Not Reserved Yet'}
                    </div>
                  </div>
                </div>

                {cat.isBooked ? (
                  <span style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-pill)' }}>
                    BOOKED
                  </span>
                ) : (
                  <span style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-pill)' }}>
                    PENDING
                  </span>
                )}
              </div>

              {cat.isBooked ? (
                <div style={{ background: 'var(--color-surface-soft)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{cat.provider?.name || 'Vendor'}</div>
                  <div style={{ color: 'var(--color-text-muted)' }}>Location: {cat.provider?.location}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontWeight: 700, color: 'var(--color-primary-hover)' }}>
                    <span>Service Cost:</span>
                    <span>TSh {cat.booking.price.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <span>Paid to Date:</span>
                    <span>TSh {(cat.booking.paidAmount || 0).toLocaleString()}</span>
                  </div>

                  {cat.booking.price > (cat.booking.paidAmount || 0) && (
                    <button
                      onClick={() => setActivePaymentModal({
                        bookingId: cat.booking.id,
                        amount: cat.booking.price - (cat.booking.paidAmount || 0),
                        isFull: true
                      })}
                      style={{
                        width: '100%',
                        marginTop: '0.75rem',
                        background: 'var(--color-primary)',
                        color: '#FFFFFF',
                        padding: '0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-pill)',
                        boxShadow: 'var(--shadow-glow)'
                      }}
                    >
                      Pay Remaining Balance (TSh {(cat.booking.price - (cat.booking.paidAmount || 0)).toLocaleString()})
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                    Find & compare top {cat.name} vendors in {wedding.location}
                  </p>
                  <Link
                    to={`/marketplace?category=${cat.id}`}
                    style={{
                      display: 'inline-block',
                      background: 'var(--color-primary)',
                      color: '#FFFFFF',
                      padding: '0.5rem 1.1rem',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      boxShadow: 'var(--shadow-glow)',
                    }}
                  >
                    Select {cat.name.split(' ')[0]} Vendor
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {activePaymentModal && (
        <PaymentModal
          bookingId={activePaymentModal.bookingId}
          amount={activePaymentModal.amount}
          isFullPayment={activePaymentModal.isFull}
          onClose={() => setActivePaymentModal(null)}
          onSuccess={() => setActivePaymentModal(null)}
        />
      )}
    </div>
  );
}

export default WeddingDashboardPage;
