import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, Clock, ChevronRight, Sliders } from 'lucide-react';

export default function InteractiveBudgetWidget() {
  const { weddingProfile, budget } = useAppContext();

  // Target Budget state (default TSh 15,000,000)
  const [targetBudget, setTargetBudget] = useState(weddingProfile?.targetBudget || 15000000);
  const [showSlider, setShowSlider] = useState(false);

  // Live Countdown Ticker calculation
  const weddingDateStr = weddingProfile?.weddingDate || '2026-12-18';
  const [timeLeft, setTimeLeft] = useState({ days: 127, hours: 14, mins: 22, secs: 45 });

  useEffect(() => {
    const target = new Date(weddingDateStr).getTime();
    
    const interval = setInterval(() => {
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
    }, 1000);

    return () => clearInterval(interval);
  }, [weddingDateStr]);

  // Calculate committed expenses
  const committedAmount = budget ? Object.values(budget).reduce((acc, cat) => {
    return acc + (cat.items ? cat.items.reduce((sum, item) => sum + (item.price || 0), 0) : 0);
  }, 0) : 8500000; // Fallback mock committed amount if empty

  const remainingAmount = Math.max(0, targetBudget - committedAmount);
  const progressPercent = Math.min(100, Math.round((committedAmount / targetBudget) * 100));

  // SVG Ring Chart circumference calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <section style={{ marginTop: '-3rem', marginBottom: '4rem', position: 'relative', zIndex: 10 }}>
      <div className="container">
        <div style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 2.25rem',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid #E8DCCF',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          alignItems: 'center'
        }}>
          
          {/* Left Column: Couple & Event Info with Live Countdown Ticker */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(245, 166, 35, 0.16)',
                color: '#F5A623',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Heart size={24} fill="#F5A623" />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {weddingProfile?.coupleNames || 'Sarah & John’s Celebration'}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  {weddingProfile?.location || 'Dar es Salaam'} • Dec 18, 2026
                </div>
              </div>
            </div>

            {/* Countdown Ticker Box */}
            <div style={{
              background: '#F9F6F0',
              borderRadius: '20px',
              padding: '1rem 1.25rem',
              border: '1px solid #E8DCCF',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.78rem', color: '#7A6657', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} color="#F5A623" /> Countdown to the Big Day
              </div>

              <div style={{ display: 'flex', gap: '1rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#3D2C1F' }}>{timeLeft.days}</div>
                  <div style={{ fontSize: '0.68rem', color: '#7A6657', fontWeight: 600 }}>DAYS</div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#B8A08C' }}>:</div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#3D2C1F' }}>{timeLeft.hours}</div>
                  <div style={{ fontSize: '0.68rem', color: '#7A6657', fontWeight: 600 }}>HOURS</div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#B8A08C' }}>:</div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#3D2C1F' }}>{timeLeft.mins}</div>
                  <div style={{ fontSize: '0.68rem', color: '#7A6657', fontWeight: 600 }}>MINS</div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#B8A08C' }}>:</div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F5A623' }}>{timeLeft.secs}</div>
                  <div style={{ fontSize: '0.68rem', color: '#7A6657', fontWeight: 600 }}>SECS</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Budget Ring & Progress Breakdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            
            {/* SVG Ring Progress Chart */}
            <div style={{ position: 'relative', width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r={radius} stroke="#F0E8DF" strokeWidth="10" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#F5A623"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#3D2C1F' }}>{progressPercent}%</span>
                <div style={{ fontSize: '0.62rem', color: '#7A6657', fontWeight: 600 }}>Allocated</div>
              </div>
            </div>

            {/* Financial Numbers & Slider Trigger */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#7A6657', fontWeight: 600 }}>Target Budget</span>
                <button
                  type="button"
                  onClick={() => setShowSlider(!showSlider)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#F5A623',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    boxShadow: 'none',
                    padding: 0
                  }}
                >
                  <Sliders size={13} /> Adjust
                </button>
              </div>

              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#3D2C1F', marginBottom: '0.25rem' }}>
                TSh {targetBudget.toLocaleString()}
              </div>

              {/* Adjust Budget Slider Box */}
              {showSlider && (
                <div style={{ background: '#FAF6F0', borderRadius: '12px', padding: '0.6rem 0.75rem', marginBottom: '0.75rem', border: '1px solid #E8DCCF' }}>
                  <input 
                    type="range"
                    min="5000000"
                    max="50000000"
                    step="1000000"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(Number(e.target.value))}
                    className="intensity-slider"
                  />
                  <div style={{ fontSize: '0.7rem', color: '#7A6657', textAlign: 'right', marginTop: '0.2rem' }}>
                    TSh {targetBudget.toLocaleString()}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', marginTop: '0.4rem' }}>
                <div>
                  <span style={{ color: '#7A6657' }}>Committed:</span>
                  <div style={{ fontWeight: 800, color: '#2E7D32' }}>TSh {committedAmount.toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ color: '#7A6657' }}>Remaining:</span>
                  <div style={{ fontWeight: 800, color: '#F5A623' }}>TSh {remainingAmount.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Button */}
            <Link to="/dashboard" className="btn-pill-mocha" style={{ padding: '0.75rem 1.4rem', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
              Manage Profile <ChevronRight size={16} />
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
}
