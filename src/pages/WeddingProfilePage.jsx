import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import WorkspaceCollaborationCard from '../components/WorkspaceCollaborationCard';
import {
  Heart, Sparkles, CheckCircle2, Calendar, MapPin, Users, Wallet,
  Building2, UtensilsCrossed, Palette, Music, Scissors, Car,
  ArrowRight, ShieldCheck, Check, Clock, Edit3, UserCheck, Flame
} from 'lucide-react';

const LOCATIONS = ['Dar es Salaam', 'Arusha', 'Mwanza', 'Zanzibar', 'Dodoma', 'Tanga'];

const GUEST_PRESETS = [150, 250, 300, 500, 800];

const BUDGET_PRESETS = [
  { label: '10M', value: 10000000 },
  { label: '15M', value: 15000000 },
  { label: '25M', value: 25000000 },
  { label: '40M', value: 40000000 },
  { label: '60M', value: 60000000 },
];

export default function WeddingProfilePage() {
  const { wedding, setWedding, updateWeddingProfile, t, language } = useAppContext();
  const navigate = useNavigate();
  const isSw = language === 'sw';

  const [formData, setFormData] = useState({
    title: wedding?.title || (isSw ? 'Harusi Yetu ya Ndoto' : 'Our Dream Wedding'),
    bride: wedding?.bride || '',
    groom: wedding?.groom || '',
    date: wedding?.date || '',
    location: wedding?.location || 'Dar es Salaam',
    guests: wedding?.guests || 200,
    budget: wedding?.budget || 10000000,
  });

  useEffect(() => {
    if (wedding) {
      setFormData(prev => ({
        title: wedding.title || prev.title,
        bride: wedding.bride || prev.bride,
        groom: wedding.groom || prev.groom,
        date: wedding.date || prev.date,
        location: wedding.location || prev.location,
        guests: wedding.guests || prev.guests,
        budget: wedding.budget || prev.budget,
      }));
    }
  }, [wedding]);

  const [saved, setSaved] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Days remaining calculation
  const calcDaysRemaining = (targetDateStr) => {
    if (!targetDateStr) return 0;
    const target = new Date(targetDateStr);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = calcDaysRemaining(formData.date);

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(isSw ? 'sw-TZ' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Completion calculation
  const filledFields = [
    formData.title.trim().length > 0,
    formData.bride.trim().length > 0,
    formData.groom.trim().length > 0,
    formData.date.length > 0,
    formData.location.length > 0,
    formData.guests > 0,
    formData.budget > 0,
  ].filter(Boolean).length;
  const completion = Math.round((filledFields / 7) * 100);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guests' || name === 'budget' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateWeddingProfile(formData);
    setWedding(prev => ({ ...prev, ...formData }));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigate('/dashboard');
    }, 1200);
  };

  const budgetAllocation = [
    {
      category: isSw ? 'Kumbi za Harusi' : 'Venues & Halls',
      shortCat: 'Kumbi',
      pct: 25,
      amount: formData.budget * 0.25,
      icon: Building2,
      color: '#F59E0B',
      bg: '#FEF3C7',
      desc: isSw ? 'Ukumbi, bustani au hoteli' : 'Hall, garden or beachfront'
    },
    {
      category: isSw ? 'Chakula & Vinywaji' : 'Catering & Drinks',
      shortCat: 'Catering',
      pct: 35,
      amount: formData.budget * 0.35,
      icon: UtensilsCrossed,
      color: '#10B981',
      bg: '#DCFCE7',
      desc: isSw ? 'Menyu kamili & vinywaji' : 'Full buffet & bar services'
    },
    {
      category: isSw ? 'Wapambaji wa Harusi' : 'Decorators & Styling',
      shortCat: 'Wapambaji',
      pct: 15,
      amount: formData.budget * 0.15,
      icon: Palette,
      color: '#6366F1',
      bg: '#EEF2FF',
      desc: isSw ? 'Mapambo, jukwaa & taa' : 'Stage, lighting & florals'
    },
    {
      category: isSw ? 'MCs & Burudani' : 'MCs & Entertainment',
      shortCat: 'Entertainment',
      pct: 10,
      amount: formData.budget * 0.10,
      icon: Music,
      color: '#8B5CF6',
      bg: '#F3E8FF',
      desc: isSw ? 'MC mkuu, DJ & muziki' : 'Master of ceremony & sound'
    },
    {
      category: isSw ? 'Saluni & Urembo' : 'Saloon & Bridal Beauty',
      shortCat: 'Saloon',
      pct: 8,
      amount: formData.budget * 0.08,
      icon: Scissors,
      color: '#F43F5E',
      bg: '#FFE4E6',
      desc: isSw ? 'Makeup, nywele & spa' : 'Bridal glam, hair & grooming'
    },
    {
      category: isSw ? 'Usafiri & Magari' : 'Luxury Wedding Transport',
      shortCat: 'Transport',
      pct: 7,
      amount: formData.budget * 0.07,
      icon: Car,
      color: '#06B6D4',
      bg: '#CFFAFE',
      desc: isSw ? 'Msafara wa magari ya kifahari' : 'Bridal convoy & VIP cars'
    },
  ];

  const costPerGuest = Math.round((formData.budget || 0) / (formData.guests || 1));
  const approxTables = Math.ceil((formData.guests || 0) / 10);

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 6.5rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        {/* Top Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
            color: '#E11D48',
            padding: '0.4rem 1.1rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            border: '1px solid rgba(225, 29, 72, 0.25)',
            boxShadow: '0 4px 14px rgba(225, 29, 72, 0.12)',
            marginBottom: '0.9rem'
          }}>
            <Heart size={14} fill="#E11D48" color="#E11D48" />
            {t('profile_hero_badge', "Couple Workspace & Event Settings")}
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            color: '#1E130B',
            fontWeight: 850,
            letterSpacing: '-0.02em',
            lineHeight: 1.22,
            marginBottom: '0.75rem'
          }}>
            {t('profile_hero_title', "Configure Your Wedding Event")}
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: '#6B5543',
            lineHeight: 1.6,
            maxWidth: '680px',
            margin: '0 auto 1.5rem'
          }}>
            {t('profile_hero_desc', "Set your wedding date, guest count, and total budget to personalize vendor recommendations, digital contracts, and expense tracking.")}
          </p>

          {/* Romantic Countdown & Status Pill */}
          <div style={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            background: '#FFFFFF',
            padding: '0.75rem 1.75rem',
            borderRadius: '999px',
            border: '1px solid #EFE6DC',
            boxShadow: '0 8px 24px -10px rgba(61, 44, 31, 0.08)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', fontWeight: 800, color: '#D97706' }}>
              <Flame size={16} color="#D97706" />
              {daysRemaining} {isSw ? 'Siku Zilizobaki' : 'Days to the Big Day'}
            </span>
            <span style={{ color: '#E5D7C7' }}>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.86rem', fontWeight: 750, color: '#2C1E14' }}>
              <Calendar size={15} color="#8C7662" />
              {formatDisplayDate(formData.date)}
            </span>
            <span style={{ color: '#E5D7C7' }}>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.86rem', fontWeight: 750, color: '#16A34A' }}>
              <MapPin size={15} color="#16A34A" />
              {formData.location}
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {saved && (
          <div style={{
            background: '#ECFDF5',
            color: '#065F46',
            border: '1.5px solid #A7F3D0',
            padding: '1.1rem 1.5rem',
            borderRadius: '16px',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 750,
            boxShadow: '0 6px 20px -8px rgba(16, 185, 129, 0.25)',
            animation: 'wprofRise 0.35s ease both'
          }}>
            <CheckCircle2 size={24} color="#059669" />
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>
                {t('profile_saved_success', "Wedding profile saved successfully! Redirecting to Dashboard...")}
              </div>
              <div style={{ fontSize: '0.82rem', opacity: 0.85, marginTop: '0.15rem' }}>
                {isSw ? 'Mabadiliko yote yamehifadhiwa na kusawazishwa kwa washiriki wote.' : 'All parameters synchronized across host & partner dashboards.'}
              </div>
            </div>
          </div>
        )}

        {/* Main Configuration Card */}
        <div className="wprof-card">
          {/* Top Couple Monogram Banner */}
          <div className="wprof-header-banner">
            <div className="wprof-couple-tag">
              <div className="wprof-couple-avatars">
                👰 ❤️ 🤵
              </div>
              <div>
                <div className="wprof-couple-names">
                  {formData.bride || 'Bride'} &amp; {formData.groom || 'Groom'}
                </div>
                <div className="wprof-couple-sub">
                  <Sparkles size={12} color="#D97706" />
                  {t('profile_monogram_badge', "Official Wedding Workspace")}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: '#FFFFFF',
                border: '1px solid rgba(245, 166, 35, 0.35)',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#92400E',
                boxShadow: '0 2px 8px rgba(245, 166, 35, 0.15)'
              }}>
                ✓ {completion}% {isSw ? 'Imekamilika' : 'Configured'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Field: Event Title */}
            <div className="wprof-field">
              <label htmlFor="wprof-title">
                <span className="label-icon-text">
                  <Sparkles size={16} color="#D97706" />
                  {t('profile_event_title', "Wedding Event Title")} <em>*</em>
                </span>
                <span style={{ fontSize: '0.75rem', color: '#8C7662', fontWeight: 600 }}>
                  {isSw ? 'Jina linaloonekana kwenye mikataba' : 'Visible on quotes & contracts'}
                </span>
              </label>
              <div className="wprof-input-wrap">
                <Edit3 size={18} className="wprof-input-icon" />
                <input
                  id="wprof-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="E.g. John & Sarah's Grand Celebration"
                  required
                />
              </div>

              {/* Title Suggestions */}
              <div className="vreg-pills" style={{ marginTop: '0.45rem' }}>
                {[
                  `${formData.groom} & ${formData.bride}'s Wedding`,
                  `Harusi ya ${formData.groom} & ${formData.bride}`,
                  `${formData.groom} & ${formData.bride}'s Royal Celebration`
                ].map(suggested => (
                  <button
                    key={suggested}
                    type="button"
                    className="vreg-pill-btn"
                    onClick={() => setFormData({ ...formData, title: suggested })}
                  >
                    + {suggested}
                  </button>
                ))}
              </div>
            </div>

            {/* Field Grid: Bride Name & Groom Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.4rem' }} className="wprof-grid">
              <div className="wprof-field" style={{ marginBottom: 0 }}>
                <label htmlFor="wprof-bride">
                  <span className="label-icon-text">
                    <span style={{ fontSize: '1rem' }}>👰</span>
                    {t('profile_bride_name', "Bride's Name")} <em>*</em>
                  </span>
                </label>
                <div className="wprof-input-wrap">
                  <Heart size={18} className="wprof-input-icon" color="#E11D48" />
                  <input
                    id="wprof-bride"
                    type="text"
                    name="bride"
                    value={formData.bride}
                    onChange={handleChange}
                    placeholder="E.g. Sarah Kimaro"
                    required
                  />
                </div>
              </div>

              <div className="wprof-field" style={{ marginBottom: 0 }}>
                <label htmlFor="wprof-groom">
                  <span className="label-icon-text">
                    <span style={{ fontSize: '1rem' }}>🤵</span>
                    {t('profile_groom_name', "Groom's Name")} <em>*</em>
                  </span>
                </label>
                <div className="wprof-input-wrap">
                  <UserCheck size={18} className="wprof-input-icon" color="#2563EB" />
                  <input
                    id="wprof-groom"
                    type="text"
                    name="groom"
                    value={formData.groom}
                    onChange={handleChange}
                    placeholder="E.g. John Msuya"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Field Grid: Wedding Date & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.4rem' }} className="wprof-grid">
              <div className="wprof-field" style={{ marginBottom: 0 }}>
                <label htmlFor="wprof-date">
                  <span className="label-icon-text">
                    <Calendar size={16} color="#D97706" />
                    {t('profile_wedding_date', "Wedding Date")} <em>*</em>
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: 700 }}>
                    {formatDisplayDate(formData.date).split(',')[0]}
                  </span>
                </label>
                <div className="wprof-input-wrap">
                  <Calendar size={18} className="wprof-input-icon" />
                  <input
                    id="wprof-date"
                    type="date"
                    name="date"
                    min={todayStr}
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="wprof-field" style={{ marginBottom: 0 }}>
                <label htmlFor="wprof-location">
                  <span className="label-icon-text">
                    <MapPin size={16} color="#D97706" />
                    {t('profile_location', "Location / City")} <em>*</em>
                  </span>
                </label>
                <div className="wprof-input-wrap">
                  <MapPin size={18} className="wprof-input-icon" />
                  <select
                    id="wprof-location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  >
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Quick Location Pills */}
                <div className="vreg-pills" style={{ marginTop: '0.45rem' }}>
                  {LOCATIONS.map(loc => (
                    <button
                      key={loc}
                      type="button"
                      className={`vreg-pill-btn ${formData.location === loc ? 'is-active' : ''}`}
                      onClick={() => setFormData({ ...formData, location: loc })}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Field Grid: Expected Guests & Target Budget */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.85rem' }} className="wprof-grid">
              <div className="wprof-field" style={{ marginBottom: 0 }}>
                <label htmlFor="wprof-guests">
                  <span className="label-icon-text">
                    <Users size={16} color="#D97706" />
                    {t('profile_guests', "Expected Guests")} <em>*</em>
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#8C7662', fontWeight: 700 }}>
                    ~{approxTables} {t('profile_tables_est', "tables approx.")}
                  </span>
                </label>
                <div className="wprof-input-wrap">
                  <Users size={18} className="wprof-input-icon" />
                  <input
                    id="wprof-guests"
                    type="number"
                    name="guests"
                    min="20"
                    max="5000"
                    value={formData.guests}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Quick Guest Presets */}
                <div className="vreg-pills" style={{ marginTop: '0.45rem' }}>
                  {GUEST_PRESETS.map(g => (
                    <button
                      key={g}
                      type="button"
                      className={`vreg-pill-btn ${formData.guests === g ? 'is-active' : ''}`}
                      onClick={() => setFormData({ ...formData, guests: g })}
                    >
                      {g} {isSw ? 'Wageni' : 'Guests'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="wprof-field" style={{ marginBottom: 0 }}>
                <label htmlFor="wprof-budget">
                  <span className="label-icon-text">
                    <Wallet size={16} color="#D97706" />
                    {t('profile_budget', "Total Target Budget (TSh)")} <em>*</em>
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: 700 }}>
                    ~TSh {costPerGuest.toLocaleString()} / {isSw ? 'mgeni' : 'guest'}
                  </span>
                </label>
                <div className="wprof-input-wrap vreg-price-wrap">
                  <Wallet size={18} className="wprof-input-icon" />
                  <span className="vreg-prefix" style={{ left: '2.85rem' }}>TSh</span>
                  <input
                    id="wprof-budget"
                    type="number"
                    name="budget"
                    step="500000"
                    min="1000000"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                    style={{ paddingLeft: '5.4rem' }}
                  />
                </div>

                {/* Quick Budget Presets */}
                <div className="vreg-pills" style={{ marginTop: '0.45rem' }}>
                  {BUDGET_PRESETS.map(bp => (
                    <button
                      key={bp.label}
                      type="button"
                      className={`vreg-pill-btn ${formData.budget === bp.value ? 'is-active' : ''}`}
                      onClick={() => setFormData({ ...formData, budget: bp.value })}
                    >
                      TSh {bp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button id="wprof-save-btn" type="submit" className="wprof-submit">
              <Sparkles size={20} />
              {t('profile_save_btn', "Save Wedding Profile & Open Dashboard")}
              <ArrowRight size={18} />
            </button>

            <p style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              color: '#8C7662',
              marginTop: '0.75rem',
              textAlign: 'center',
              fontWeight: 600
            }}>
              <ShieldCheck size={14} color="#16A34A" />
              {isSw
                ? 'Taarifa hizi zinalindwa na kubinafsisha mikataba & bajeti yako bila malipo.'
                : 'Encrypted & synchronized across your private wedding planning workspace.'}
            </p>
          </form>
        </div>

        {/* Workspace Collaboration Card */}
        <WorkspaceCollaborationCard />

        {/* Recommended Budget Allocation Preview */}
        <div className="wprof-card" style={{ marginTop: '2.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 850,
              color: '#1E130B',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <Sparkles size={20} color="#F5A623" />
              {t('profile_recommended_breakdown', "Recommended Budget Allocation Breakdown")}
            </h3>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 850,
              color: '#92400E',
              background: '#FEF3C7',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              border: '1px solid rgba(245, 166, 35, 0.4)'
            }}>
              TSh {Number(formData.budget || 0).toLocaleString()}
            </span>
          </div>

          <p style={{ fontSize: '0.92rem', color: '#7A6657', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
            {t('profile_budget_hint', "Personalized breakdown calculated from your target budget based on top Tanzanian weddings.")}
          </p>

          {/* Visual Spectrum Bar */}
          <div className="wprof-budget-spectrum">
            <div className="wprof-spectrum-bar">
              {budgetAllocation.map(b => (
                <div
                  key={b.shortCat}
                  className="wprof-spectrum-seg"
                  style={{ width: `${b.pct}%`, background: b.color }}
                  title={`${b.category}: ${b.pct}%`}
                />
              ))}
            </div>

            <div className="wprof-spectrum-legend">
              {budgetAllocation.map(b => (
                <div key={b.shortCat} className="wprof-legend-item">
                  <span className="wprof-legend-dot" style={{ background: b.color }} />
                  <span>{b.shortCat} ({b.pct}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* 6 Category Breakdown Grid Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            {budgetAllocation.map(b => {
              const Icon = b.icon;
              return (
                <div key={b.shortCat} className="wprof-breakdown-card">
                  <div className="wprof-breakdown-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: b.bg,
                        color: b.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon size={18} />
                      </div>
                      <span className="wprof-breakdown-title">{b.category}</span>
                    </div>
                    <span className="wprof-breakdown-pct">{b.pct}%</span>
                  </div>

                  <div className="wprof-breakdown-amount">
                    TSh {Math.round(b.amount).toLocaleString()}
                  </div>

                  <span style={{ fontSize: '0.74rem', color: '#8C7662' }}>
                    {b.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
