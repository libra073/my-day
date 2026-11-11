import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import {
  Heart, Clock, ChevronRight, Sliders, Sparkles,
  CheckCircle2, Coins, ShieldCheck, Calendar, ArrowRight,
  RefreshCw, AlertCircle
} from 'lucide-react';

export default function InteractiveBudgetWidget() {
  const {
    wedding,
    budgetData,
    bookings,
    isLoggedIn,
    user,
    workspaceLoading,
    workspaceError,
    updateWeddingProfile,
    refreshWorkspace,
    t,
    language
  } = useAppContext();

  // Target Budget state synced to real wedding
  const realTargetBudget = wedding?.budget || wedding?.targetBudget || 0;
  const [sliderBudget, setSliderBudget] = useState(realTargetBudget);
  const [showSlider, setShowSlider] = useState(false);

  useEffect(() => {
    setSliderBudget(wedding?.budget || wedding?.targetBudget || 0);
  }, [wedding?.budget, wedding?.targetBudget]);

  // Live Countdown Ticker calculation based strictly on real wedding.date
  const weddingDateStr = wedding?.date || '';
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0, isPast: false });

  useEffect(() => {
    if (!weddingDateStr) {
      setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0, isPast: false });
      return;
    }

    const target = new Date(weddingDateStr).getTime();
    if (isNaN(target)) {
      setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0, isPast: false });
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, mins, secs, isPast: false });
      } else {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0, isPast: true });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [weddingDateStr]);

  // Handle budget slider change
  const handleBudgetChange = (newVal) => {
    setSliderBudget(newVal);
  };

  const handleBudgetCommit = (finalVal) => {
    if (updateWeddingProfile) {
      updateWeddingProfile({ budget: finalVal });
    }
  };

  // 1. Loading Skeleton State
  if (workspaceLoading) {
    return (
      <section style={{ marginTop: '2.25rem', marginBottom: '3.75rem', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div className="celebration-budget-card" style={{ padding: '2.25rem', minHeight: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(226, 232, 240, 0.7)', animation: 'pulse 1.5s infinite' }} />
              <div>
                <div style={{ width: 220, height: 22, background: 'rgba(226, 232, 240, 0.7)', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: 140, height: 14, background: 'rgba(226, 232, 240, 0.7)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
              </div>
            </div>
            <div style={{ height: 120, background: 'rgba(241, 245, 249, 0.8)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
          </div>
        </div>
      </section>
    );
  }

  // 2. Safe Error State with Retry
  if (workspaceError && isLoggedIn) {
    return (
      <section style={{ marginTop: '2.25rem', marginBottom: '3.75rem', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div className="celebration-budget-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', color: '#ef4444', marginBottom: '1rem', border: '1.5px solid rgba(239, 68, 68, 0.2)' }}>
              <AlertCircle size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--app-text-primary, #0f172a)', marginBottom: '0.5rem' }}>
              {t('celebration_error_msg')}
            </h3>
            <p style={{ color: 'var(--app-text-secondary, #475569)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              {workspaceError}
            </p>
            <button
              type="button"
              onClick={() => refreshWorkspace && refreshWorkspace()}
              className="btn-primary"
              style={{ display: 'inline-flex', width: 'auto', margin: '0 auto', padding: '0.75rem 1.75rem', gap: '0.5rem' }}
            >
              <RefreshCw size={16} /> {t('celebration_retry')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // 3. Logged-out Visitor: Public Interactive Feature Showcase
  if (!isLoggedIn) {
    return (
      <section style={{ marginTop: '1.25rem', marginBottom: '2.5rem', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div className="celebration-budget-card">
            <div className="celebration-budget-grid">
              {/* Left Column: Public Intro */}
              <div>
                <div className="celebration-couple-row">
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(0, 102, 238, 0.10)',
                    border: '1px solid rgba(0, 102, 238, 0.20)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(0, 102, 238, 0.15)',
                    flexShrink: 0
                  }}>
                    <Heart size={22} fill="var(--liquid-sapphire-500)" color="var(--liquid-sapphire-500)" />
                  </div>
                  <div>
                    <div className="celebration-title-row">
                      <span className="celebration-couple-name" style={{ color: 'var(--app-text-primary)', fontSize: '1.3rem' }}>
                        {t('celebration_public_title')}
                      </span>
                    </div>
                    <div className="celebration-meta" style={{ color: 'var(--app-text-secondary)', fontSize: '0.82rem' }}>
                      <span>📍 Dar es Salaam • Arusha • Zanzibar • Dodoma • Mwanza</span>
                    </div>
                  </div>
                </div>

                <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.92rem', lineHeight: 1.55, marginBottom: '1rem' }}>
                  {t('celebration_public_subtitle')}
                </p>

                {/* Feature Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div className="glass-lens" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 750, color: 'var(--app-text-primary)' }}>
                    <Clock size={14} color="var(--liquid-sapphire-500)" />
                    <span>{t('celebration_feat_countdown')}</span>
                  </div>
                  <div className="glass-lens" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 750, color: 'var(--app-text-primary)' }}>
                    <Coins size={14} color="var(--liquid-sapphire-500)" />
                    <span>{t('celebration_feat_budget')}</span>
                  </div>
                  <div className="glass-lens" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 750, color: '#059669' }}>
                    <ShieldCheck size={14} color="#10b981" />
                    <span>{t('celebration_feat_escrow')}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Public Call-To-Action */}
              <div className="glass-dock budget-panel-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', padding: '1.5rem', borderRadius: '20px' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(0, 102, 238, 0.10)',
                  border: '1px solid rgba(0, 102, 238, 0.20)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  color: 'var(--liquid-sapphire-500)',
                  boxShadow: '0 4px 14px rgba(0, 102, 238, 0.15)'
                }}>
                  <Calendar size={22} color="var(--liquid-sapphire-500)" />
                </div>

                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--app-text-primary)', marginBottom: '0.35rem' }}>
                  {language === 'sw' ? 'Anza Safari Yako ya Ndoa' : 'Ready to Plan Your Big Day?'}
                </h4>
                <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  {language === 'sw'
                    ? 'Fungua wasifu wako wa harusi leo ili upate kihesabu siku, usimamizi wa bajeti, na upange watoa huduma wote kwa urahisi.'
                    : 'Set up your wedding date and target budget to unlock your real-time countdown, budget allocations, and verified booking tools.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link to="/wedding" className="btn-primary" style={{ justifyContent: 'center', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{t('celebration_create_cta')}</span>
                    <ArrowRight size={17} />
                  </Link>
                  <Link
                    to="/marketplace"
                    className="btn-liquid-white"
                    style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.9rem',
                      fontWeight: 750,
                      textAlign: 'center'
                    }}
                  >
                    {t('celebration_browse_cta')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 4. Logged-in user WITHOUT a saved wedding celebration
  if (!wedding || !wedding.date) {
    return (
      <section style={{ marginTop: '2.25rem', marginBottom: '3.75rem', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div className="celebration-budget-card glass-slab">
            <div className="celebration-budget-grid">
              {/* Left Column: Personalized Empty State */}
              <div>
                <div className="celebration-couple-row">
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(0, 102, 238, 0.10)',
                    border: '1px solid rgba(0, 102, 238, 0.20)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(0, 102, 238, 0.12)',
                    flexShrink: 0
                  }}>
                    <Heart size={24} fill="var(--liquid-sapphire-500)" color="var(--liquid-sapphire-500)" />
                  </div>
                  <div>
                    <div className="celebration-title-row">
                      <span className="celebration-couple-name" style={{ color: 'var(--app-text-primary)' }}>
                        {t('celebration_empty_title')}, {user?.name?.split(' ')[0] || 'Celebrant'}!
                      </span>
                    </div>
                    <div className="celebration-meta" style={{ color: 'var(--app-text-secondary)' }}>
                      <span>💍 {language === 'sw' ? 'Weka Wasifu wa Harusi Yako' : 'Create Your Wedding Workspace'}</span>
                    </div>
                  </div>
                </div>

                <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {t('celebration_empty_subtitle')}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  <div className="glass-lens" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.85rem', fontSize: '0.85rem', fontWeight: 750, color: 'var(--app-text-primary)' }}>
                    <Clock size={16} color="var(--liquid-sapphire-500)" />
                    <span>{language === 'sw' ? 'Weka Tarehe Rasmi' : 'Pick Wedding Date'}</span>
                  </div>
                  <div className="glass-lens" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.85rem', fontSize: '0.85rem', fontWeight: 750, color: 'var(--app-text-primary)' }}>
                    <Coins size={16} color="var(--liquid-sapphire-500)" />
                    <span>{language === 'sw' ? 'Weka Bajeti Yako' : 'Establish Budget'}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Setup Wedding CTA */}
              <div className="glass-dock budget-panel-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', padding: '2rem 1.75rem', borderRadius: '20px' }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'rgba(0, 102, 238, 0.10)',
                  border: '1px solid rgba(0, 102, 238, 0.20)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: 'var(--liquid-sapphire-500)',
                  boxShadow: '0 4px 14px rgba(0, 102, 238, 0.12)'
                }}>
                  <Calendar size={26} color="var(--liquid-sapphire-500)" />
                </div>

                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--app-text-primary)', marginBottom: '0.5rem' }}>
                  {language === 'sw' ? 'Unda Sherehe Yako Sasa' : 'Launch Your Wedding Workspace'}
                </h4>
                <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  {language === 'sw'
                    ? 'Inachukua sekunde chache tu kuweka tarehe na bajeti ili uweze kutumia zana zote za MY DAY.'
                    : 'Set your event date and financial target in 30 seconds to unlock real-time budget tracking and vendor bookings.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link to="/wedding" className="btn-primary" style={{ justifyContent: 'center', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{t('celebration_setup_cta')}</span>
                    <ArrowRight size={17} />
                  </Link>
                  <Link
                    to="/marketplace"
                    className="btn-liquid-white"
                    style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.9rem',
                      fontWeight: 750,
                      textAlign: 'center'
                    }}
                  >
                    {t('celebration_browse_cta')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 5. Logged-in user WITH actual saved wedding data
  const targetBudget = sliderBudget || realTargetBudget || 0;

  // Real committed calculations
  const committedAmount = budgetData?.summary?.totalCommitted ?? (
    (bookings || []).reduce((acc, b) => acc + (b.totalAmount || b.price || 0), 0)
  );

  const remainingAmount = Math.max(0, targetBudget - committedAmount);
  const progressPercent = targetBudget > 0 ? Math.min(100, Math.round((committedAmount / targetBudget) * 100)) : 0;

  // SVG Ring Chart circumference calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = targetBudget > 0 ? circumference - (progressPercent / 100) * circumference : circumference;

  // Format real saved wedding date
  const formattedWedDate = wedding.date ? new Date(wedding.date).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : '';

  return (
    <section style={{ marginTop: '2.25rem', marginBottom: '3.75rem', position: 'relative', zIndex: 10 }}>
      <div className="container">
        <div className="celebration-budget-card glass-slab">
          <div className="celebration-budget-grid">
            {/* Left Column: Couple & Event Info with Real Live Countdown Ticker */}
            <div>
              {/* Couple Header */}
              <div className="celebration-couple-row">
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(0, 102, 238, 0.10)',
                  border: '1px solid rgba(0, 102, 238, 0.20)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0, 102, 238, 0.12)',
                  flexShrink: 0
                }}>
                  <Heart size={24} fill="var(--liquid-sapphire-500)" color="var(--liquid-sapphire-500)" />
                </div>
                <div>
                  <div className="celebration-title-row">
                    <span className="celebration-couple-name" style={{ color: 'var(--app-text-primary)' }}>
                      {wedding.coupleNames || wedding.title || (user?.name ? `${user.name}'s Celebration` : t('celebration_title'))}
                    </span>
                    <span className="celebration-active-pill glass-lens" style={{ color: 'var(--liquid-sapphire-500)' }}>
                      <Sparkles size={11} /> {timeLeft.isPast ? t('celebration_past_event') : 'Active Celebration'}
                    </span>
                  </div>
                  <div className="celebration-meta" style={{ color: 'var(--app-text-secondary)' }}>
                    <span>📍 {wedding.location || wedding.city || 'Tanzania'}</span>
                    {formattedWedDate && (
                      <>
                        <span>•</span>
                        <span>📅 {formattedWedDate}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Countdown Ticker Box */}
              <div className="countdown-box-premium glass-dock">
                <div className="countdown-box-header">
                  <span className="countdown-box-title" style={{ color: 'var(--app-text-primary)' }}>
                    <Clock size={15} color="var(--liquid-sapphire-500)" /> {t('countdown_label')}
                  </span>
                  <span className="countdown-live-badge glass-lens">
                    <span className="live-dot-pulse" style={{ width: 6, height: 6 }} /> LIVE TICKER
                  </span>
                </div>

                <div className="countdown-tiles-row">
                  {/* Days */}
                  <div className="countdown-tile glass-lens">
                    <div className="countdown-tile-number">{timeLeft.days}</div>
                    <div className="countdown-tile-label">{t('days_label')}</div>
                  </div>

                  <span className="countdown-colon-sep">:</span>

                  {/* Hours */}
                  <div className="countdown-tile glass-lens">
                    <div className="countdown-tile-number">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="countdown-tile-label">{t('hours_label')}</div>
                  </div>

                  <span className="countdown-colon-sep">:</span>

                  {/* Mins */}
                  <div className="countdown-tile glass-lens">
                    <div className="countdown-tile-number">{String(timeLeft.mins).padStart(2, '0')}</div>
                    <div className="countdown-tile-label">{t('mins_label')}</div>
                  </div>

                  <span className="countdown-colon-sep">:</span>

                  {/* Secs */}
                  <div className="countdown-tile glass-lens">
                    <div className="countdown-tile-number is-secs">{String(timeLeft.secs).padStart(2, '0')}</div>
                    <div className="countdown-tile-label">{t('secs_label')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Financial Overview & Budget Ring Breakdown */}
            <div className="budget-panel-premium glass-dock" style={{ borderRadius: '20px' }}>
              <div>
                <div className="budget-panel-header">
                  <span className="budget-panel-label" style={{ color: 'var(--app-text-secondary)' }}>{t('target_budget_label')}</span>
                  <button
                    type="button"
                    onClick={() => setShowSlider(!showSlider)}
                    className="budget-adjust-btn glass-lens"
                    title={language === 'sw' ? 'Rekebisha bajeti inayolengwa ya harusi' : 'Adjust target wedding budget'}
                    aria-label={language === 'sw' ? 'Rekebisha bajeti inayolengwa ya harusi' : 'Adjust target wedding budget'}
                    style={{
                      color: 'var(--liquid-sapphire-500)'
                    }}
                  >
                    <Sliders size={13} /> {t('adjust_btn')}
                  </button>
                </div>
                <div className="budget-target-amount" style={{ color: 'var(--app-text-primary)' }}>
                  TSh {targetBudget.toLocaleString()}
                </div>
              </div>

              {/* Smooth Range Slider */}
              {showSlider && (
                <div className="budget-slider-drawer" style={{
                  borderRadius: '16px',
                  padding: '0.85rem 1rem',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--app-text-secondary)', marginBottom: '0.35rem' }}>
                    <span>Min: TSh 2M</span>
                    <span style={{ color: 'var(--liquid-sapphire-500)', fontWeight: 800 }}>Target: TSh {targetBudget.toLocaleString()}</span>
                    <span>Max: TSh 100M</span>
                  </div>
                  <input
                    type="range"
                    className="liquid-budget-range"
                    min="2000000"
                    max="100000000"
                    step="500000"
                    value={targetBudget || 10000000}
                    onChange={(e) => handleBudgetChange(Number(e.target.value))}
                    onMouseUp={(e) => handleBudgetCommit(Number(e.target.value))}
                    onTouchEnd={(e) => handleBudgetCommit(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--liquid-sapphire-500)' }}
                  />
                </div>
              )}

              {/* Visual Ring Chart & Two High-Contrast Stat Pills */}
              <div className="budget-visual-row">
                {/* SVG Ring Progress Chart */}
                <div className="budget-ring-wrapper">
                  <svg width="98" height="98" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="45" cy="45" r={radius} stroke="var(--app-border, rgba(0, 102, 238, 0.12))" strokeWidth="9" fill="none" />
                    <circle
                      cx="45"
                      cy="45"
                      r={radius}
                      stroke="url(#budgetGradient)"
                      strokeWidth="9"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.2, 0.9, 0.3, 1)' }}
                    />
                    <defs>
                      <linearGradient id="budgetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0071E3" />
                        <stop offset="100%" stopColor="#004085" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="budget-ring-inner">
                    <div className="budget-ring-percent" style={{ color: 'var(--app-text-primary)' }}>{progressPercent}%</div>
                    <div className="budget-ring-sub" style={{ color: 'var(--app-text-muted)' }}>{t('allocated_label')}</div>
                  </div>
                </div>

                {/* Committed & Remaining Status Pills */}
                <div className="budget-pills-col">
                  {/* Committed */}
                  <div className="budget-stat-pill committed glass-lens">
                    <span className="budget-stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--app-text-secondary)' }}>
                      <CheckCircle2 size={14} color="#059669" /> {t('committed_label')}
                    </span>
                    <span className="budget-stat-value green" style={{ color: '#059669', fontWeight: 800 }}>
                      TSh {committedAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Remaining */}
                  <div className="budget-stat-pill remaining glass-lens">
                    <span className="budget-stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--app-text-secondary)' }}>
                      <Coins size={14} color="var(--liquid-sapphire-500)" /> {t('remaining_label')}
                    </span>
                    <span className="budget-stat-value amber" style={{ color: 'var(--liquid-sapphire-500)', fontWeight: 800 }}>
                      TSh {remainingAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div>
                <div className="budget-bar-track" style={{ background: 'rgba(0, 102, 238, 0.14)', boxShadow: 'inset 0 1px 2px rgba(0, 30, 80, 0.12)', borderRadius: '999px', height: '8px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                  <div className="budget-bar-fill" style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(135deg, #38BDF8 0%, #0071E3 55%, #0051D5 100%)', borderRadius: '999px' }} />
                </div>
              </div>

              {/* Link to Full Planner / Dashboard */}
              <Link to="/dashboard" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', padding: '0.85rem 1.5rem', width: '100%' }}>
                <span>{t('manage_profile_btn')}</span>
                <ChevronRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
