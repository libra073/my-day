import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Heart, Calendar, Users, PlusCircle, Star, ArrowRight, Wand2,
  Wallet, Receipt, BadgeCheck, PiggyBank, Layers, Clock, CheckCircle2,
  ChevronRight, ArrowLeft, ArrowRight as ArrowRightIcon, Bell, Settings,
  ShieldAlert, ShieldCheck
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { demoText } from '../i18n/demoContent';
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

export default function WeddingDashboardPage() {
  const { wedding, bookings, providers, isLoggedIn, openAuthModal, language, t, user } = useAppContext();
  const [activePaymentModal, setActivePaymentModal] = useState(null);
  const countdown = useCountdown(wedding?.date);
  const isSw = language === 'sw';

  const ALL_CATEGORIES = [
    { id: 'kumbi', name: isSw ? 'Kumbi (Ukumbi)' : 'Kumbi (Venue)', icon: '🏰' },
    { id: 'catering', name: isSw ? 'Chakula & Vinywaji' : 'Catering & Dining', icon: '🍽️' },
    { id: 'wapambaji', name: isSw ? 'Wapambaji (Mapambo)' : 'Wapambaji (Decorators)', icon: '🎨' },
    { id: 'entertainment', name: isSw ? 'MCs & Burudani' : 'MCs & Entertainment', icon: '🎤' },
    { id: 'saloon', name: isSw ? 'Saluni & Urembo' : 'Saloon & Barbershop', icon: '💇' },
    { id: 'transport', name: isSw ? 'Usafiri & Magari' : 'Transport & Luxury Cars', icon: '🚗' },
  ];

  // 1. Visitors without an account: friendly sign-up/login reminder
  if (!isLoggedIn) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <div className="glass-card glass-frosted-optical" style={{
          maxWidth: 580,
          margin: '0 auto',
          padding: '3rem 2rem',
          borderRadius: '28px'
        }}>
          <div className="glass-crystal" style={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}>
            <Heart size={32} color="var(--liquid-sapphire-500, #0066EE)" fill="var(--liquid-sapphire-500, #0066EE)" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--app-text-primary, #0f172a)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            {t('auth_prompt_title', isSw ? 'Fungua akaunti yako ya MY DAY ili kuendelea.' : 'Create your free MY DAY account to continue.')}
          </h2>
          <p style={{ color: 'var(--app-text-secondary, #475569)', lineHeight: 1.6, marginBottom: '2rem' }}>
            {t('auth_prompt_desc', isSw ? 'Jiunge na MY DAY ili kuhifadhi mipango ya harusi yako, kusimamia bajeti, kuwasiliana na watoa huduma, na kupanga kila kitu sehemu moja.' : 'Join MY DAY to save your wedding plans, manage your budget, connect with vendors, and keep everything organized in one place.')}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => openAuthModal({ initialTab: 'register' })}
              className="btn-primary"
              style={{ padding: '0.85rem 1.75rem' }}
            >
              <Sparkles size={16} /> {t('auth_prompt_create_btn', isSw ? 'Fungua Akaunti' : 'Create Account')}
            </button>
            <button
              type="button"
              onClick={() => openAuthModal({ initialTab: 'login' })}
              className="btn-liquid-white"
              style={{ padding: '0.85rem 1.75rem' }}
            >
              {t('auth_prompt_login_btn', isSw ? 'Ingia' : 'Log In')}
            </button>
            <Link to="/marketplace" className="button" style={{ background: 'transparent', border: '1.5px solid rgba(148, 163, 184, 0.25)', color: 'var(--app-text-secondary, #475569)', borderRadius: 'var(--radius-pill)', padding: '0.85rem 1.4rem' }}>
              {t('celebration_browse_cta', isSw ? 'Tazama Watoa Huduma' : 'Browse Vendors')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Logged-in users without a wedding: clear invitation to create wedding
  if (!wedding || !wedding.id) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <div className="glass-card glass-frosted-optical" style={{
          maxWidth: 580,
          margin: '0 auto',
          padding: '3rem 2rem',
          borderRadius: '28px'
        }}>
          <div className="glass-crystal" style={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}>
            <Heart size={32} color="var(--liquid-sapphire-500, #0066EE)" fill="var(--liquid-sapphire-500, #0066EE)" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--app-text-primary, #0f172a)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            {t('no_wedding_title', isSw ? 'Bado hujaweka maelezo ya harusi yako. Tuanze sasa!' : "You haven't created your wedding yet. Let's get started!")}
          </h2>
          <p style={{ color: 'var(--app-text-secondary, #475569)', lineHeight: 1.6, marginBottom: '2rem' }}>
            {t('no_wedding_desc', isSw ? 'Weka tarehe ya harusi yako na bajeti ili ufungue dashibodi binafsi, mfuatiliaji wa watoa huduma, na kihesabu siku.' : 'Set up your wedding date and budget to unlock your personalized planning dashboard, vendor tracker, and live countdown.')}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/wedding" className="btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
              <Sparkles size={16} /> {t('no_wedding_create_btn', isSw ? 'Weka Maelezo ya Harusi' : 'Create Wedding')}
            </Link>
            <Link to="/marketplace" className="btn-liquid-white" style={{ padding: '0.85rem 1.75rem' }}>
              {t('celebration_browse_cta', isSw ? 'Tazama Watoa Huduma' : 'Browse Vendors')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalBookedAmount = (bookings || []).reduce((sum, b) => sum + (b.price || 0), 0);
  const totalPaidAmount = (bookings || []).reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const targetBudget = wedding.budget || 0;
  const remainingBudget = Math.max(0, targetBudget - totalBookedAmount);
  const budgetUsagePct = targetBudget > 0 ? Math.min(100, Math.round((totalBookedAmount / targetBudget) * 100)) : 0;

  const categoryStatusMap = ALL_CATEGORIES.map(cat => {
    const bookedCategory = bookings.find(b => b.category === cat.id);
    return {
      ...cat,
      isBooked: !!bookedCategory,
      booking: bookedCategory,
      provider: bookedCategory ? providers.find(p => p.id === bookedCategory.providerId) : null
    };
  });

  const featured = [...providers].filter(p => p.isFeatured).slice(0, 3);
  const bookedCount = categoryStatusMap.filter(c => c.isBooked).length;
  const userName = (wedding.bride || user?.name || 'Mariya').split(' ')[0];

  return (
    <div className="container" style={{ padding: '1.75rem 1.25rem 3.5rem' }}>
      {/* ── Unverified Email Banner ── */}
      {user && user.emailVerified === false && (
        <div className="email-verify-banner" role="alert">
          <div className="email-verify-banner__content">
            <span className="email-verify-banner__icon">
              <ShieldAlert size={18} />
            </span>
            <div className="email-verify-banner__text">
              <strong>{isSw ? 'Barua pepe yako haijathibitishwa bado.' : 'Your email address is unverified.'}</strong>
              <span>
                {isSw
                  ? `Tafadhali thibitisha ${user.email} ili kupokea taarifa za mikataba na malipo ya harusi yako.`
                  : `Please verify ${user.email} to receive booking confirmations, receipts, and vendor updates.`}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="email-verify-banner__btn btn-sweep"
            onClick={() => openAuthModal({ initialTab: 'verify', initialEmail: user.email })}
          >
            <ShieldCheck size={14} />
            <span>{isSw ? 'Thibitisha Sasa' : 'Verify Now'}</span>
          </button>
        </div>
      )}

      {/* ── Cute Top Greeting Banner (Matching uTask Reference) ─── */}
      <section className="utask-greeting-card" aria-label={isSw ? 'Salamu' : 'Greeting'}>
        <div className="utask-greeting-text">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.88rem', marginBottom: '6px' }}>
            <Sparkles size={16} /> {isSw ? 'Habari ya asubuhi' : 'Good morning'}, {userName}!
          </div>
          <h2>{isSw ? 'Kagua Majukumu na Ratiba ya Harusi' : 'Check your daily task & Schedules'}</h2>
          <p>{isSw ? 'Uwe na siku njema ya maandalizi ya harusi yako!' : 'Have a wonderful planning day with MY DAY'}</p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <Link to="/marketplace" className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.84rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <PlusCircle size={15} /> {isSw ? 'Tafuta Watoa Huduma' : 'Browse Vendors'}
            </Link>
            <Link to="/planner" className="btn-liquid-white" style={{ padding: '0.55rem 1.25rem', fontSize: '0.84rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Wand2 size={15} /> {isSw ? 'Uliza AI Planner' : 'Ask AI Planner'}
            </Link>
            <Link to="/wedding" className="btn-liquid-white" style={{ padding: '0.55rem 1.15rem', fontSize: '0.84rem' }}>
              {isSw ? 'Mipangilio' : 'Wedding Settings'}
            </Link>
          </div>
        </div>

        {/* Optical Crystal Countdown Badge */}
        {countdown && (
          <div className="utask-countdown-box" style={{
            background: 'var(--lens-bg)',
            backdropFilter: 'blur(24px) saturate(190%)',
            WebkitBackdropFilter: 'blur(22px) saturate(195%)',
            border: 'var(--lens-border)',
            borderRadius: '24px',
            padding: '1.25rem 1.75rem',
            textAlign: 'center',
            boxShadow: 'var(--lens-highlight), 0 10px 24px -6px rgba(0, 102, 238, 0.15)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--liquid-sapphire-500)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              {isSw ? 'Muda Uliobaki' : 'Countdown'}
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-primary, #0071E3)', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {countdown.days}
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 750, color: 'var(--app-text-muted)' }}>
              {isSw ? 'Siku Zimebaki' : 'Days Until Celebration'}
            </div>
          </div>
        )}
      </section>

      {/* ── 4 Quick Stats Pills Row (Exact uTask Metrics Row) ───── */}
      <section className="utask-stats-row" aria-label={isSw ? 'Vipimo muhimu' : 'Key metrics'}>
        <div className="utask-stat-pill-card">
          <div className="utask-stat-icon-wrap purple">
            <Layers size={22} />
          </div>
          <div>
            <div className="utask-stat-number" style={{ color: 'var(--color-text)' }}>{bookedCount}/{ALL_CATEGORIES.length}+</div>
            <div className="utask-stat-tag">{isSw ? 'Huduma Zilizopangwa' : 'Project Services'}</div>
          </div>
        </div>

        <div className="utask-stat-pill-card">
          <div className="utask-stat-icon-wrap cerulean">
            <Users size={22} />
          </div>
          <div>
            <div className="utask-stat-number" style={{ color: 'var(--color-primary)' }}>{wedding.guests || 350}+</div>
            <div className="utask-stat-tag">{isSw ? 'Wageni Walioalikwa' : 'Client Guests'}</div>
          </div>
        </div>

        <div className="utask-stat-pill-card">
          <div className="utask-stat-icon-wrap pink">
            <Star size={22} />
          </div>
          <div>
            <div className="utask-stat-number" style={{ color: 'var(--color-primary, #0071E3)' }}>165+</div>
            <div className="utask-stat-tag">{isSw ? 'Watoa Huduma Bora' : 'Verified Reviews'}</div>
          </div>
        </div>

        <div className="utask-stat-pill-card">
          <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="17" fill="none" stroke="var(--clay-line)" strokeWidth="4" />
              <circle
                cx="22"
                cy="22"
                r="17"
                fill="none"
                stroke="var(--color-primary, #0071E3)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={106.8}
                strokeDashoffset={106.8 - (106.8 * budgetUsagePct) / 100}
                transform="rotate(-90 22 22)"
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
              {budgetUsagePct}%
            </div>
          </div>
          <div>
            <div className="utask-stat-number" style={{ color: 'var(--color-primary)' }}>{budgetUsagePct}%</div>
            <div className="utask-stat-tag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ display: 'inline-block', width: 7, height: 7, flexShrink: 0, borderRadius: '50%', background: 'var(--color-primary, #0071E3)' }} />
              {isSw ? 'Bajeti Imepangwa' : 'Budget Planned'}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2-Column Split: Main Dashboard & Right Schedule Panel ── */}
      <div className="utask-dashboard-grid">
        {/* Main Column */}
        <div>
          {/* 1. Activity Wave Spline Chart Card */}
          <div className="utask-wave-card">
            <div className="utask-wave-head">
              <h3 className="utask-wave-title">{isSw ? 'Shughuli za Wiki' : 'Activity'}</h3>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--app-text-muted, #64748B)' }}>
                {isSw ? 'Majukumu 75 Jumla' : '75 Tasks Total'}
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              {/* Floating Tooltip Pill */}
              <div style={{
                position: 'absolute',
                top: 8,
                left: '68%',
                background: 'var(--app-card-bg, #ffffff)',
                border: '1.5px solid var(--color-primary, #0071E3)',
                borderRadius: '999px',
                padding: '3px 10px',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--color-primary, #0071E3)',
                boxShadow: '0 4px 12px rgba(0, 102, 238, 0.25)',
                pointerEvents: 'none',
                transform: 'translateX(-50%)'
              }}>
                {isSw ? '5 Majukumu' : '5 Tasks'}
              </div>

              <svg className="utask-wave-svg" viewBox="0 0 500 130" fill="none">
                <defs>
                  <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C5CFC" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7C5CFC" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#CBD5E1" />
                    <stop offset="50%" stopColor="#0071E3" />
                    <stop offset="100%" stopColor="#0056B3" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 80 Q 40 40, 80 70 T 160 50 T 240 85 T 320 30 T 400 65 T 500 45 L 500 130 L 0 130 Z"
                  fill="url(#waveGrad)"
                />
                <path
                  d="M0 80 Q 40 40, 80 70 T 160 50 T 240 85 T 320 30 T 400 65 T 500 45"
                  stroke="url(#lineGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="340" cy="30" r="5" fill="#0071E3" stroke="#ffffff" strokeWidth="2.5" />
                <line x1="340" y1="36" x2="340" y2="130" stroke="#0071E3" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--app-text-muted, #64748b)' }}>
                <span>{isSw ? 'Jpi' : 'Mon'}</span>
                <span>{isSw ? 'Jtt' : 'Tue'}</span>
                <span>{isSw ? 'Jnn' : 'Wed'}</span>
                <span>{isSw ? 'Tnn' : 'Thu'}</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>{isSw ? '20 Ijm' : '20 Fri'}</span>
                <span>{isSw ? 'Ijm' : 'Sat'}</span>
                <span>{isSw ? 'Jms' : 'Sun'}</span>
              </div>
            </div>
          </div>

          {/* 2. Weekly Spending Bar Chart Card */}
          <div className="utask-bars-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)' }}>
                  <AnimatedNumber value={totalBookedAmount || 1380000} prefix="TSh " />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--app-text-muted, #64748b)', fontWeight: 600 }}>{isSw ? 'Iliyopangwa Wiki Hii' : 'Committed This Week'}</div>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.76rem', fontWeight: 750 }}>
                <span style={{ color: 'var(--color-primary)' }}>● {budgetUsagePct}% {isSw ? 'Imetumika' : 'Already spent'}</span>
                <span style={{ color: 'var(--liquid-cyan-500, #00C7BE)' }}>● {Math.max(0, 100 - budgetUsagePct)}% {isSw ? 'Imebaki' : 'Amount left'}</span>
              </div>
            </div>

            <div className="utask-bars-row">
              {[
                { day: 'Mon', h: '45%' },
                { day: 'Tue', h: '60%' },
                { day: 'Wed', h: '35%' },
                { day: 'Thu', h: '85%' },
                { day: 'Fri', h: '70%' },
                { day: 'Sat', h: '40%' },
                { day: 'Sun', h: '55%' },
              ].map((item, idx) => (
                <div key={idx} className="utask-bar-col">
                  <div className="utask-bar-track">
                    <div className="utask-bar-fill" style={{ height: item.h }} />
                  </div>
                  <span className="utask-bar-label">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Meetings / Wedding Agenda List */}
          <div className="utask-meetings-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{isSw ? 'Mikutano & Majaribio' : 'Meetings & Inspections'}</h3>
              <Link to="/bookings" style={{ fontSize: '0.82rem', fontWeight: 750, color: 'var(--color-primary)', textDecoration: 'none' }}>
                {isSw ? 'Tazama yote' : 'See all'}
              </Link>
            </div>

            {[
              { title: isSw ? 'Ukaguzi wa Ukumbi (Hall Inspection)' : 'Sprint Hall Inspection', time: '09:00 am - 10:00 am', color: '#0071E3', initial: 'H' },
              { title: isSw ? 'Majaribio ya Chakula (Menu Tasting)' : 'Menu Tasting with Chef', time: '11:00 am - 12:30 pm', color: '#0A84FF', initial: 'C' },
              { title: isSw ? 'Mapambo na Maua (Floral Concept)' : 'Floral & Decor Review', time: '02:00 pm - 03:30 pm', color: '#0056B3', initial: 'D' },
              { title: isSw ? 'Muziki na MC (Sound Rehearsal)' : 'MC & Sound Check Rehearsal', time: '04:00 pm - 05:00 pm', color: '#004085', initial: 'M' },
            ].map((m, idx) => (
              <div key={idx} className="utask-meeting-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="utask-meeting-avatar" style={{ background: m.color }}>
                    {m.initial}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 750, color: 'var(--color-text)' }}>{m.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--app-text-muted, #64748b)' }}>{m.time}</div>
                  </div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            ))}
          </div>

          {/* Liquid Glass Planning Status Card */}
          <div style={{
            background: 'var(--slab-bg)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1.5px solid rgba(255, 255, 255, 0.88)',
            borderRadius: '24px',
            padding: '1.5rem 1.75rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'inset 0 1px 1.5px rgba(255, 255, 255, 0.95), 0 12px 28px -6px rgba(15, 23, 42, 0.06)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', background: 'rgba(0, 102, 238, 0.12)', color: 'var(--color-primary)', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', border: '1px solid rgba(0, 102, 238, 0.22)' }}>
                  ✦ {isSw ? 'Maendeleo ya Maandalizi: 68%' : 'Wedding Planning Progress: 68%'}
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 850, margin: '0 0 0.25rem 0', color: 'var(--app-text-primary)' }}>
                {isSw ? 'Una Majukumu 3 Yanayotakiwa Leo' : 'You have 3 tasks due today'}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--app-text-muted)', margin: 0 }}>
                {isSw ? 'Kamilisha mapitio ya watoa huduma ili kuendelea na ratiba.' : 'Complete vendor milestone reviews to keep on schedule.'}
              </p>
            </div>
            <Link
              to="/planner"
              className="btn-primary"
              style={{
                padding: '0.55rem 1.25rem',
                fontSize: '0.82rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderRadius: '999px'
              }}
            >
              <Wand2 size={14} />
              {isSw ? 'Tazama Majukumu ya AI' : 'View AI Milestones'}
            </Link>
          </div>
        </div>

        {/* Right Column: Profile & Mini Calendar Tasks */}
        <div>
          {/* Profile Card */}
          <div className="utask-profile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--app-text-muted, #64748b)' }}>{isSw ? 'Wasifu Wangu' : 'My profile'}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="liquid-bubble" style={{ width: 32, height: 32 }}><Bell size={14} /></span>
                <span className="liquid-bubble" style={{ width: 32, height: 32 }}><Settings size={14} /></span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1rem' }}>
              <div className="utask-profile-avatar-wrap">
                <div className="utask-profile-avatar">
                  {userName.charAt(0)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  {isSw ? 'Habari' : 'Good morning'}, {userName}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--app-text-muted, #64748b)' }}>
                  {isSw ? 'Una majukumu 5 mapya leo' : 'You have 5 new tasks today'}
                </div>
              </div>
            </div>

            <Link to="/planner" className="btn-primary" style={{ width: '100%', textAlign: 'center', padding: '0.55rem', fontSize: '0.82rem', textDecoration: 'none', display: 'block', borderRadius: '999px' }}>
              {isSw ? 'Tazama Yote' : 'See all tasks'}
            </Link>
          </div>

          {/* Mini Calendar & Daily Schedule Card */}
          <div className="utask-profile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)' }}>{isSw ? 'Majukumu Yangu' : 'My tasks'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--app-text-muted, #64748b)', fontWeight: 700 }}>
                <span>{wedding.date || (isSw ? '2 Agosti, Jumatatu' : 'August, 2 Monday')}</span>
                <ArrowRightIcon size={13} />
              </div>
            </div>

            {/* Calendar Days Numbers Grid */}
            <div className="utask-calendar-grid">
              {(isSw ? ['Jpi', 'Jtt', 'Jnn', 'Tnn', 'Alh', 'Ijm', 'Jms'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).map(d => (
                <div key={d} className="utask-cal-day-header">{d}</div>
              ))}
              {[26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8].map((day, idx) => (
                <div key={idx} className={`utask-cal-day-cell ${day === 2 ? 'is-active' : ''}`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Hourly Schedule Pills */}
            <div style={{ marginTop: '1.25rem' }}>
              <div className="utask-schedule-pill">
                <Clock size={14} />
                <span>09:00 — {isSw ? 'Kikao cha Mapitio ya Harusi na Ratiba' : 'Morning Vows & Schedule Review'}</span>
              </div>
              <div className="utask-schedule-pill">
                <Clock size={14} />
                <span>12:00 — {isSw ? 'Uteuzi wa Maua & Rangi' : 'Floral & Decor Concept Review'}</span>
              </div>
              <div className="utask-schedule-pill">
                <Clock size={14} />
                <span>14:00 — {isSw ? 'Mkataba wa Wapiga Picha' : 'Photography Booking Confirmation'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6 Core Categories Booking Tracker ──────────────────── */}
      <div style={{ marginTop: '2.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--color-text)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {isSw ? 'Orodha ya Huduma 6 Kuu za Harusi' : '6 Core Wedding Services Checklist'}
          </h2>
          <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 750, color: 'var(--color-primary, #0071E3)' }}>
            <PlusCircle size={16} /> {isSw ? 'Tafuta Sokoni' : 'Browse Marketplace'}
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
          {categoryStatusMap.map(cat => (
            <div
              key={cat.id}
              className="dash-stat-card glass-frosted-optical"
              style={{
                borderRadius: '24px',
                padding: '1.4rem',
                border: cat.isBooked ? '1.5px solid rgba(0, 102, 238, 0.45)' : '1.5px dashed rgba(255, 255, 255, 0.35)',
                transition: 'var(--transition-smooth)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(0, 102, 238, 0.1)',
                    border: '1.5px solid rgba(0, 102, 238, 0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.35rem'
                  }}>
                    {cat.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)' }}>{demoText(cat.name, isSw)}</h3>
                    <div style={{ fontSize: '0.75rem', color: cat.isBooked ? '#059669' : '#64748b', fontWeight: 700 }}>
                      {cat.isBooked ? '✓ Reserved & Booked' : 'Not Reserved Yet'}
                    </div>
                  </div>
                </div>

                {cat.isBooked ? (
                  <span className="badge-neon-rose" style={{ background: 'rgba(5, 150, 105, 0.12)', color: '#059669', border: '1px solid rgba(5, 150, 105, 0.25)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800 }}>BOOKED</span>
                ) : (
                  <span className="badge-cerulean" style={{ background: 'rgba(0, 102, 238, 0.1)', color: 'var(--color-primary)', border: '1px solid rgba(0, 102, 238, 0.2)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800 }}>PENDING</span>
                )}
              </div>

              {cat.isBooked && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.55)',
                  padding: '1rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(0, 102, 238, 0.15)',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ fontWeight: 750, color: 'var(--color-text)' }}>{cat.provider?.name || (isSw ? 'Mtoa Huduma' : 'Vendor')}</div>
                  <div style={{ color: 'var(--app-text-muted, #64748b)', fontSize: '0.8rem', marginTop: '0.15rem' }}>{isSw ? 'Eneo:' : 'Location:'} {cat.provider?.location}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontWeight: 750, color: 'var(--color-primary, #0071E3)' }}>
                    <span>{isSw ? 'Gharama ya Huduma:' : 'Service Cost:'}</span>
                    <span>TSh {cat.booking.price.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--app-text-muted, #64748b)', marginTop: '0.2rem' }}>
                    <span>{isSw ? 'Malipo Hadi Sasa:' : 'Paid to Date:'}</span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>TSh {(cat.booking.paidAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Preserved Deep Workspace Collaboration Tools ────────── */}
      <WorkspaceCollaborationCard />
      <SharedChecklistCard />
      <SharedDecisionsCard />
      <SharedBudgetLedgerCard />

      {/* Payment Modal */}
      {activePaymentModal && (
        <PaymentModal
          booking={activePaymentModal}
          bookingId={activePaymentModal.bookingId || activePaymentModal._id || activePaymentModal.id}
          amount={activePaymentModal.amount || activePaymentModal.depositAmount || activePaymentModal.price}
          onClose={() => setActivePaymentModal(null)}
          onSuccess={() => setActivePaymentModal(null)}
        />
      )}
    </div>
  );
}
