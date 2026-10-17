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
            <div className="celebration-card-top-accent" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#F2EBE2', animation: 'pulse 1.5s infinite' }} />
              <div>
                <div style={{ width: 220, height: 22, background: '#F2EBE2', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: 140, height: 14, background: '#F2EBE2', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
              </div>
            </div>
            <div style={{ height: 120, background: '#FAF8F5', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
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
            <div className="celebration-card-top-accent" />
            <div style={{ display: 'inline-flex', padding: '0.75rem', background: '#FEF2F2', borderRadius: '50%', color: '#DC2626', marginBottom: '1rem' }}>
              <AlertCircle size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2C1E14', marginBottom: '0.5rem' }}>
              {t('celebration_error_msg')}
            </h3>
            <p style={{ color: '#7A6657', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              {workspaceError}
            </p>
            <button
              type="button"
              onClick={() => refreshWorkspace && refreshWorkspace()}
              className="budget-cta-btn"
              style={{ display: 'inline-flex', width: 'auto', margin: '0 auto', padding: '0.75rem 1.5rem' }}
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
      <section style={{ marginTop: '2.25rem', marginBottom: '3.75rem', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div className="celebration-budget-card">
            <div className="celebration-card-top-accent" />

            <div className="celebration-budget-grid">
              {/* Left Column: Public Intro */}
              <div>
                <div className="celebration-couple-row">
                  <div className="celebration-heart-circle">
                    <Heart size={26} fill="#F5A623" color="#F5A623" />
                  </div>
                  <div>
                    <div className="celebration-title-row">
                      <span className="celebration-couple-name">
                        {t('celebration_public_title')}
                      </span>
                    </div>
                    <div className="celebration-meta">
                      <span>📍 Dar es Salaam • Arusha • Zanzibar • Dodoma • Mwanza</span>
                    </div>
                  </div>
                </div>

                <p style={{ color: '#665345', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {t('celebration_public_subtitle')}
                </p>

                {/* Feature Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.85rem', background: '#FAF7F2', borderRadius: '10px', border: '1px solid #EFE6DC', fontSize: '0.85rem', fontWeight: 700, color: '#3D2D21' }}>
                    <Clock size={16} color="#F5A623" />
                    <span>{t('celebration_feat_countdown')}</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.85rem', background: '#FAF7F2', borderRadius: '10px', border: '1px solid #EFE6DC', fontSize: '0.85rem', fontWeight: 700, color: '#3D2D21' }}>
                    <Coins size={16} color="#F5A623" />
                    <span>{t('celebration_feat_budget')}</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.85rem', background: '#FAF7F2', borderRadius: '10px', border: '1px solid #EFE6DC', fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>
                    <ShieldCheck size={16} color="#15803d" />
                    <span>{t('celebration_feat_escrow')}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Public Call-To-Action */}
              <div className="budget-panel-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', padding: '2rem 1.75rem' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(245, 166, 35, 0.2) 0%, rgba(245, 166, 35, 0.05) 100%)',
                  border: '1px solid rgba(245, 166, 35, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: '#F5A623'
                }}>
                  <Calendar size={28} />
                </div>

                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2C1E14', marginBottom: '0.5rem' }}>
                  {language === 'sw' ? 'Anza Safari Yako ya Ndoa' : 'Ready to Plan Your Big Day?'}
                </h4>
                <p style={{ color: '#7A6657', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  {language === 'sw'
                    ? 'Fungua wasifu wako wa harusi leo ili upate kihesabu siku, usimamizi wa bajeti, na upange watoa huduma wote kwa urahisi.'
                    : 'Set up your wedding date and target budget to unlock your real-time countdown, budget allocations, and verified booking tools.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link to="/wedding" className="budget-cta-btn" style={{ justifyContent: 'center' }}>
                    <span>{t('celebration_create_cta')}</span>
                    <ArrowRight size={17} />
                  </Link>
                  <Link
                    to="/marketplace"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #D8C7B5',
                      background: '#FFFFFF',
                      color: '#4A3B32',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'background 0.2s ease',
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
          <div className="celebration-budget-card">
            <div className="celebration-card-top-accent" />

            <div className="celebration-budget-grid">
              {/* Left Column: Personalized Empty State */}
              <div>
                <div className="celebration-couple-row">
                  <div className="celebration-heart-circle">
                    <Heart size={26} fill="#F5A623" color="#F5A623" />
                  </div>
                  <div>
                    <div className="celebration-title-row">
                      <span className="celebration-couple-name">
                        {t('celebration_empty_title')}, {user?.name?.split(' ')[0] || 'Celebrant'}!
                      </span>
                    </div>
                    <div className="celebration-meta">
                      <span>💍 {language === 'sw' ? 'Weka Wasifu wa Harusi Yako' : 'Create Your Wedding Workspace'}</span>
                    </div>
                  </div>
                </div>

                <p style={{ color: '#665345', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {t('celebration_empty_subtitle')}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.85rem', background: '#FAF7F2', borderRadius: '10px', border: '1px solid #EFE6DC', fontSize: '0.85rem', fontWeight: 700, color: '#3D2D21' }}>
                    <Clock size={16} color="#F5A623" />
                    <span>{language === 'sw' ? 'Weka Tarehe Rasmi' : 'Pick Wedding Date'}</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.85rem', background: '#FAF7F2', borderRadius: '10px', border: '1px solid #EFE6DC', fontSize: '0.85rem', fontWeight: 700, color: '#3D2D21' }}>
                    <Coins size={16} color="#F5A623" />
                    <span>{language === 'sw' ? 'Weka Bajeti Yako' : 'Establish Budget'}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Setup Wedding CTA */}
              <div className="budget-panel-premium" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', padding: '2rem 1.75rem' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(245, 166, 35, 0.2) 0%, rgba(245, 166, 35, 0.05) 100%)',
                  border: '1px solid rgba(245, 166, 35, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: '#F5A623'
                }}>
                  <Calendar size={28} />
                </div>

                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2C1E14', marginBottom: '0.5rem' }}>
                  {language === 'sw' ? 'Unda Sherehe Yako Sasa' : 'Launch Your Wedding Workspace'}
                </h4>
                <p style={{ color: '#7A6657', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  {language === 'sw'
                    ? 'Inachukua sekunde chache tu kuweka tarehe na bajeti ili uweze kutumia zana zote za MY DAY.'
                    : 'Set your event date and financial target in 30 seconds to unlock real-time budget tracking and vendor bookings.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link to="/wedding" className="budget-cta-btn" style={{ justifyContent: 'center' }}>
                    <span>{t('celebration_setup_cta')}</span>
                    <ArrowRight size={17} />
                  </Link>
                  <Link
                    to="/marketplace"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #D8C7B5',
                      background: '#FFFFFF',
                      color: '#4A3B32',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'background 0.2s ease',
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
        <div className="celebration-budget-card">
          <div className="celebration-card-top-accent" />

          <div className="celebration-budget-grid">
            {/* Left Column: Couple & Event Info with Real Live Countdown Ticker */}
            <div>
              {/* Couple Header */}
              <div className="celebration-couple-row">
                <div className="celebration-heart-circle">
                  <Heart size={26} fill="#F5A623" color="#F5A623" />
                </div>
                <div>
                  <div className="celebration-title-row">
                    <span className="celebration-couple-name">
                      {wedding.coupleNames || wedding.title || (user?.name ? `${user.name}'s Celebration` : t('celebration_title'))}
                    </span>
                    <span className="celebration-active-pill">
                      <Sparkles size={11} /> {timeLeft.isPast ? t('celebration_past_event') : 'Active Celebration'}
                    </span>
                  </div>
                  <div className="celebration-meta">
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
              <div className="countdown-box-premium">
                <div className="countdown-box-header">
                  <span className="countdown-box-title">
                    <Clock size={15} color="#F5A623" /> {t('countdown_label')}
                  </span>
                  <span className="countdown-live-badge">
                    <span className="live-dot-pulse" style={{ width: 6, height: 6 }} /> LIVE TICKER
                  </span>
                </div>

                <div className="countdown-tiles-row">
                  {/* Days */}
                  <div className="countdown-tile">
                    <div className="countdown-tile-number">{timeLeft.days}</div>
                    <div className="countdown-tile-label">{t('days_label')}</div>
                  </div>

                  <span className="countdown-colon-sep">:</span>

                  {/* Hours */}
                  <div className="countdown-tile">
                    <div className="countdown-tile-number">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="countdown-tile-label">{t('hours_label')}</div>
                  </div>

                  <span className="countdown-colon-sep">:</span>

                  {/* Mins */}
                  <div className="countdown-tile">
                    <div className="countdown-tile-number">{String(timeLeft.mins).padStart(2, '0')}</div>
                    <div className="countdown-tile-label">{t('mins_label')}</div>
                  </div>

                  <span className="countdown-colon-sep">:</span>

                  {/* Secs */}
                  <div className="countdown-tile">
                    <div className="countdown-tile-number is-secs">{String(timeLeft.secs).padStart(2, '0')}</div>
                    <div className="countdown-tile-label">{t('secs_label')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Financial Overview & Budget Ring Breakdown */}
            <div className="budget-panel-premium">
              <div>
                <div className="budget-panel-header">
                  <span className="budget-panel-label">{t('target_budget_label')}</span>
                  <button
                    type="button"
                    onClick={() => setShowSlider(!showSlider)}
                    className="budget-adjust-btn"
                    title="Adjust target wedding budget"
                  >
                    <Sliders size={13} /> {t('adjust_btn')}
                  </button>
                </div>
                <div className="budget-target-amount">
                  TSh {targetBudget.toLocaleString()}
                </div>
              </div>

              {/* Smooth Range Slider */}
              {showSlider && (
                <div style={{
                  background: '#FAF7F2',
                  borderRadius: '14px',
                  padding: '0.75rem 1rem',
                  border: '1px solid #E8DCCF',
                  animation: 'fadeIn 0.2s ease',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#7A6657', marginBottom: '0.35rem' }}>
                    <span>Min: TSh 2M</span>
                    <span style={{ color: '#b45309' }}>Target: TSh {targetBudget.toLocaleString()}</span>
                    <span>Max: TSh 100M</span>
                  </div>
                  <input
                    type="range"
                    min="2000000"
                    max="100000000"
                    step="500000"
                    value={targetBudget || 10000000}
                    onChange={(e) => handleBudgetChange(Number(e.target.value))}
                    onMouseUp={(e) => handleBudgetCommit(Number(e.target.value))}
                    onTouchEnd={(e) => handleBudgetCommit(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#F5A623' }}
                  />
                </div>
              )}

              {/* Visual Ring Chart & Two High-Contrast Stat Pills */}
              <div className="budget-visual-row">
                {/* SVG Ring Progress Chart */}
                <div className="budget-ring-wrapper">
                  <svg width="98" height="98" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="45" cy="45" r={radius} stroke="#F2EBE2" strokeWidth="9" fill="none" />
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
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#F5A623" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="budget-ring-inner">
                    <div className="budget-ring-percent">{progressPercent}%</div>
                    <div className="budget-ring-sub">{t('allocated_label')}</div>
                  </div>
                </div>

                {/* Committed & Remaining Status Pills */}
                <div className="budget-pills-col">
                  {/* Committed */}
                  <div className="budget-stat-pill committed">
                    <span className="budget-stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle2 size={14} color="#15803d" /> {t('committed_label')}
                    </span>
                    <span className="budget-stat-value green">
                      TSh {committedAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Remaining */}
                  <div className="budget-stat-pill remaining">
                    <span className="budget-stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Coins size={14} color="#b45309" /> {t('remaining_label')}
                    </span>
                    <span className="budget-stat-value amber">
                      TSh {remainingAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div>
                <div className="budget-bar-track">
                  <div className="budget-bar-fill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              {/* Link to Full Planner / Dashboard */}
              <Link to="/dashboard" className="budget-cta-btn">
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
