import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, Clock, ChevronRight, Sliders, Sparkles, CheckCircle2, Coins } from 'lucide-react';

export default function InteractiveBudgetWidget() {
  const { weddingProfile, budget, t } = useAppContext();

  // Target Budget state (default TSh 16,000,000)
  const [targetBudget, setTargetBudget] = useState(weddingProfile?.targetBudget || 16000000);
  const [showSlider, setShowSlider] = useState(false);

  // Live Countdown Ticker calculation
  const weddingDateStr = weddingProfile?.weddingDate || '2026-12-18';
  const [timeLeft, setTimeLeft] = useState({ days: 62, hours: 12, mins: 28, secs: 58 });

  useEffect(() => {
    const target = new Date(weddingDateStr).getTime();
    
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, mins, secs });
      } else {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [weddingDateStr]);

  // Calculate committed expenses
  const committedAmount = budget ? Object.values(budget).reduce((acc, cat) => {
    return acc + (cat.items ? cat.items.reduce((sum, item) => sum + (item.price || 0), 0) : 0);
  }, 0) : 8500000;

  const remainingAmount = Math.max(0, targetBudget - committedAmount);
  const progressPercent = Math.min(100, Math.round((committedAmount / targetBudget) * 100));

  // SVG Ring Chart circumference calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <section style={{ marginTop: '2.25rem', marginBottom: '3.75rem', position: 'relative', zIndex: 10 }}>
      <div className="container">
        <div className="celebration-budget-card">
          <div className="celebration-card-top-accent" />

          <div className="celebration-budget-grid">
            {/* Left Column: Couple & Event Info with Live Countdown Ticker */}
            <div>
              {/* Couple Header */}
              <div className="celebration-couple-row">
                <div className="celebration-heart-circle">
                  <Heart size={26} fill="#F5A623" color="#F5A623" />
                </div>
                <div>
                  <div className="celebration-title-row">
                    <span className="celebration-couple-name">
                      {weddingProfile?.coupleNames || t('celebration_title')}
                    </span>
                    <span className="celebration-active-pill">
                      <Sparkles size={11} /> Active Celebration
                    </span>
                  </div>
                  <div className="celebration-meta">
                    <span>📍 {weddingProfile?.location || 'Dar es Salaam'}</span>
                    <span>•</span>
                    <span>📅 Dec 18, 2026</span>
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

              {/* Optional Smooth Range Slider */}
              {showSlider && (
                <div style={{
                  background: '#FAF7F2',
                  borderRadius: '14px',
                  padding: '0.75rem 1rem',
                  border: '1px solid #E8DCCF',
                  animation: 'fadeIn 0.2s ease',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#7A6657', marginBottom: '0.35rem' }}>
                    <span>Min: TSh 5M</span>
                    <span style={{ color: '#b45309' }}>Target: TSh {targetBudget.toLocaleString()}</span>
                    <span>Max: TSh 50M</span>
                  </div>
                  <input
                    type="range"
                    min="5000000"
                    max="50000000"
                    step="500000"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(Number(e.target.value))}
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
