import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import {
  CheckCircle2, Store, MapPin, Phone, Wallet, FileText, Rocket, ShieldCheck,
  Zap, BadgeCheck, Building2, Palette, Music, UtensilsCrossed, Scissors, Car,
  Loader2, Sparkles, Star, ChevronDown, Check, TrendingUp, Calendar, CreditCard,
  MessageCircle, Award, Users
} from 'lucide-react';

const CATEGORIES = [
  { id: 'wapambaji', name: 'Wapambaji – Decorators', swName: 'Wapambaji – Mapambo', short: 'Decorators', sub: 'Decor & Styling', icon: Palette, color: '#F59E0B' },
  { id: 'kumbi', name: 'Kumbi – Venues', swName: 'Kumbi – Venues', short: 'Venues', sub: 'Halls & Gardens', icon: Building2, color: '#3B82F6' },
  { id: 'entertainment', name: 'MCs & Entertainment', swName: 'MCs & Burudani', short: 'MCs & Music', sub: 'DJs, Bands & MCs', icon: Music, color: '#8B5CF6' },
  { id: 'catering', name: 'Catering & Chakula', swName: 'Chakula – Catering', short: 'Catering', sub: 'Food & Drinks', icon: UtensilsCrossed, color: '#EC4899' },
  { id: 'saloon', name: 'Saloon & Barbershop', swName: 'Saluni & Urembo', short: 'Saloon', sub: 'Hair & Bridal Makeup', icon: Scissors, color: '#10B981' },
  { id: 'transport', name: 'Transport & Luxury Cars', swName: 'Usafiri – Magari ya Harusi', short: 'Transport', sub: 'Luxury Wedding Cars', icon: Car, color: '#6366F1' },
];

const PRICE_UNITS = {
  kumbi: { en: 'per day', sw: 'kwa siku' },
  transport: { en: 'per day', sw: 'kwa siku' },
  catering: { en: 'per guest', sw: 'kwa mgeni' },
  entertainment: { en: 'per event', sw: 'kwa sherehe' },
  wapambaji: { en: 'per package', sw: 'kwa kifurushi' },
  saloon: { en: 'per package', sw: 'kwa huduma' },
};

const CITY_PRESETS = ['Dar es Salaam', 'Arusha', 'Mwanza', 'Zanzibar', 'Dodoma'];

const PRICE_PRESETS = [
  { label: '500k', value: 500000 },
  { label: '1.0M', value: 1000000 },
  { label: '1.5M', value: 1500000 },
  { label: '2.5M', value: 2500000 },
  { label: '5.0M', value: 5000000 },
];

const AMENITY_TAGS = [
  '✨ Red Carpet & VIP Walkway',
  '❄️ Full Air Conditioning (AC)',
  '⚡ High-Capacity Backup Generator',
  '👰 Dedicated Bridal Changing Suite',
  '🔊 Professional Sound & PA System',
  '💡 Dynamic Stage & LED Ambient Lighting',
  '🍽️ Complete Buffet Ware & Chafing Dishes',
  '🤝 Complimentary Wedding Consultation',
];

const DESC_MAX = 500;

export default function BecomeVendorPage() {
  const { setProviders, switchRole, t, language } = useAppContext();
  const navigate = useNavigate();
  const isSw = language === 'sw';

  const [formData, setFormData] = useState({
    name: '',
    category: 'wapambaji', // Defaulting to Wapambaji – Decorators as highlighted by user
    location: 'Dar es Salaam',
    contact: '+255 700 000 000',
    priceRate: 1500000,
    description: '',
  });

  const [registered, setRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Calculate completion percentage
  const requiredFields = [
    formData.name.trim().length > 0,
    formData.category.length > 0,
    formData.location.trim().length > 0,
    formData.contact.trim().length >= 9,
    formData.priceRate > 0,
  ];
  const completion = Math.round((requiredFields.filter(Boolean).length / requiredFields.length) * 100);

  const activeUnit = isSw ? (PRICE_UNITS[formData.category]?.sw || 'kwa kifurushi') : (PRICE_UNITS[formData.category]?.en || 'per package');

  const handleAddAmenity = (tag) => {
    setFormData(prev => {
      const cleanTag = tag.replace(/^[^\w\s]+/, '').trim();
      if (prev.description.includes(cleanTag)) return prev;
      const separator = prev.description.trim().length > 0 ? '\n• ' : '• ';
      const newDesc = `${prev.description}${separator}${cleanTag}`;
      return { ...prev, description: newDesc.slice(0, DESC_MAX) };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError(isSw ? 'Tafadhali weka jina la biashara yako.' : 'Please enter your business name.');
      return;
    }
    if (!formData.location.trim()) {
      setError(isSw ? 'Tafadhali weka eneo au jiji lako.' : 'Please enter your business location.');
      return;
    }
    if (formData.contact.replace(/\D/g, '').length < 9) {
      setError(isSw ? 'Tafadhali weka nambari sahihi ya simu / WhatsApp (+255 700 000 000).' : 'Please enter a valid phone / WhatsApp contact number.');
      return;
    }
    if (!formData.priceRate || formData.priceRate <= 0) {
      setError(isSw ? 'Tafadhali weka bei ya kuanzia iliyo sahihi.' : 'Please enter a valid starting price.');
      return;
    }

    setSubmitting(true);

    const newVendor = {
      id: `vendor-${Date.now()}`,
      category: formData.category,
      name: formData.name.trim(),
      location: formData.location.trim(),
      pricePerDay: (formData.category === 'kumbi' || formData.category === 'transport') ? formData.priceRate : null,
      pricePerPerson: formData.category === 'catering' ? formData.priceRate : null,
      pricePerEvent: formData.category === 'entertainment' ? formData.priceRate : null,
      packages: (formData.category === 'wapambaji' || formData.category === 'saloon') ? [
        {
          id: `pkg-${Date.now()}`,
          name: isSw ? 'Kifurushi cha Msingi cha Harusi' : 'Standard Wedding Package',
          price: formData.priceRate,
          description: formData.description || (isSw ? 'Huduma kamili ya kitaalamu kwa harusi yako.' : 'Full professional wedding package included.')
        }
      ] : [],
      rating: 5.0,
      reviewsCount: 1,
      verified: true,
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      description: formData.description.trim(),
      contact: formData.contact.trim(),
      unavailableDates: []
    };

    setProviders(prev => [newVendor, ...prev]);

    setTimeout(() => {
      setSubmitting(false);
      setRegistered(true);
      setTimeout(() => {
        switchRole('provider');
        navigate('/provider');
      }, 1900);
    }, 800);
  };

  const benefits = [
    {
      title: isSw ? 'Tengeneza Wasifu wa Biashara' : 'Create Business Profile',
      desc: isSw ? 'Onyesha picha, bei, vifurushi, na vifaa vyako kwa maelfu ya maharusi wanaopanga harusi kila mwezi.' : 'Showcase your portfolio, packages, pricing, and amenities to thousands of active couples.',
      icon: Store,
      tag: isSw ? 'BURE 100%' : '100% Free',
      iconBg: '#FEF3C7',
      iconColor: '#D97706'
    },
    {
      title: isSw ? 'Pokea Maombi ya Uhifadhi Moja kwa Moja' : 'Receive Direct Booking Requests',
      desc: isSw ? 'Pata oda za papo hapo na amana ya awali ya 30% moja kwa moja kwenye akaunti au simu yako.' : 'Get instant booking requests and 30% advance deposits straight to your account.',
      icon: Rocket,
      tag: isSw ? 'AMANA 30%' : '30% Advance',
      iconBg: '#EDE9FE',
      iconColor: '#7C3AED'
    },
    {
      title: isSw ? 'Simamia Kalenda ya Tarehe' : 'Manage Calendar Availability',
      desc: isSw ? 'Funga kwa urahisi tarehe ulizopokea oda kuzuia muingiliano wakati wa msimu wa harusi.' : 'Effortlessly block out unavailable dates and avoid scheduling conflicts during peak wedding season.',
      icon: Calendar,
      tag: isSw ? 'HAKUNA CONFLICT' : 'Zero Conflicts',
      iconBg: '#DCFCE7',
      iconColor: '#16A34A'
    },
    {
      title: isSw ? 'Pokea Malipo Salama ya Mtandaoni' : 'Accept Online Payments',
      desc: isSw ? 'Malipo ya uhakika na salama kupitia M-Pesa, Tigo Pesa, Airtel Money, au benki zote nchini.' : 'Guaranteed payouts via M-Pesa, Tigo Pesa, Airtel Money, or direct bank transfer.',
      icon: CreditCard,
      tag: isSw ? 'M-PESA & BENKI' : 'Mobile & Bank',
      iconBg: '#E0E7FF',
      iconColor: '#4F46E5'
    },
    {
      title: isSw ? 'Fuatilia Mapato na Takwimu' : 'Track Earnings & Analytics',
      desc: isSw ? 'Ripoti za kifedha za wakati halisi, historia ya malipo, na wateja watarajiwa kiganjani mwako.' : 'Real-time financial breakdown of gross earnings, platform payouts, and upcoming events.',
      icon: TrendingUp,
      tag: isSw ? 'RIPOTI LIVE' : 'Live Analytics',
      iconBg: '#FCE7F3',
      iconColor: '#DB2777'
    },
    {
      title: isSw ? 'Jenga Heshima na Ushuhuda' : 'Build Client Reputation',
      desc: isSw ? 'Pata maoni ya nyota 5 yaliyothibitishwa na jenga jina lako kama kinara wa huduma Tanzania.' : 'Gain verified 5-star customer reviews and boost your business ranking across Tanzania.',
      icon: Award,
      tag: isSw ? 'BEJI YA VERIFIED' : 'Verified Badge',
      iconBg: '#CCFBF1',
      iconColor: '#0D9488'
    },
  ];

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 6.5rem' }}>
      {/* Top Hero Banner */}
      <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 3rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          color: '#92400E',
          padding: '0.45rem 1.1rem',
          borderRadius: '999px',
          fontSize: '0.8rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          border: '1px solid rgba(245, 166, 35, 0.4)',
          boxShadow: '0 4px 14px rgba(245, 166, 35, 0.15)',
          marginBottom: '1rem'
        }}>
          <Sparkles size={14} color="#D97706" />
          {t('vreg_hero_badge', "Official Vendor Partner Program")}
        </div>

        <h1 style={{
          fontSize: '2.65rem',
          color: '#1E130B',
          marginTop: '0.25rem',
          marginBottom: '0.9rem',
          fontWeight: 850,
          letterSpacing: '-0.02em',
          lineHeight: 1.2
        }}>
          {t('vreg_hero_title', "Grow Your Wedding Business with MY DAY")}
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: '#6B5543',
          lineHeight: 1.6,
          maxWidth: '700px',
          margin: '0 auto 1.5rem'
        }}>
          {t('vreg_hero_desc', "Join Tanzania's premier wedding marketplace. Connect with hundreds of couples actively planning their dream weddings every month.")}
        </p>

        {/* Live Marketplace Highlights Bar */}
        <div style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          background: '#FFFFFF',
          padding: '0.75rem 1.75rem',
          borderRadius: '999px',
          border: '1px solid #EFE6DC',
          boxShadow: '0 8px 24px -10px rgba(61, 44, 31, 0.08)'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', fontWeight: 750, color: '#2C1E14' }}>
            <Users size={16} color="#D97706" /> 250+ {isSw ? 'Watoa Huduma' : 'Vendors Active'}
          </span>
          <span style={{ color: '#E5D7C7' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', fontWeight: 750, color: '#2C1E14' }}>
            <Star size={16} color="#F5A623" fill="#F5A623" /> 4.9★ {isSw ? 'Kiwango cha Wastani' : 'Average Rating'}
          </span>
          <span style={{ color: '#E5D7C7' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', fontWeight: 750, color: '#16A34A' }}>
            <ShieldCheck size={16} color="#16A34A" /> {isSw ? '0 TSh Kujiunga' : '0 TSh Upfront Fee'}
          </span>
        </div>
      </div>

      {/* Benefits Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '1.35rem',
        marginBottom: '3.5rem'
      }}>
        {benefits.map((b, i) => {
          const Icon = b.icon;
          return (
            <div key={i} className="vreg-benefit-card">
              <div className="vreg-benefit-header">
                <div className="vreg-benefit-icon-box" style={{ background: b.iconBg, color: b.iconColor }}>
                  <Icon size={22} />
                </div>
                <span className="vreg-benefit-tag">{b.tag}</span>
              </div>
              <h3 className="vreg-benefit-title">{b.title}</h3>
              <p className="vreg-benefit-desc">{b.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Main Registration Card */}
      <section className="vreg-card" id="vendor-register" aria-labelledby="vreg-title">
        {/* Left: Brand / Trust panel */}
        <aside className="vreg-side">
          <span className="vreg-side-badge">
            <BadgeCheck size={15} /> {t('vreg_badge', "Partner Program")}
          </span>

          <h3 className="vreg-side-title">
            {t('vreg_side_title', "Your listing goes live in minutes")}
          </h3>

          <p className="vreg-side-text">
            {t('vreg_side_desc', "Couples across Tanzania are searching right now. Fill in the basics — you can add photos and packages later from your provider portal.")}
          </p>

          <ul className="vreg-perks">
            <li>
              <span className="vreg-perk-icon"><Zap size={18} /></span>
              <div>
                <strong>{t('vreg_instant_pub', "Instant publishing")}</strong>
                <small>{t('vreg_instant_pub_sub', "Visible on the marketplace immediately")}</small>
              </div>
            </li>
            <li>
              <span className="vreg-perk-icon"><FileText size={18} /></span>
              <div>
                <strong>{t('vreg_digital_contracts', "Digital contracts")}</strong>
                <small>{t('vreg_digital_contracts_sub', "Auto-generated legal agreement for every booking")}</small>
              </div>
            </li>
            <li>
              <span className="vreg-perk-icon"><ShieldCheck size={18} /></span>
              <div>
                <strong>{t('vreg_protected_payouts', "Protected payouts")}</strong>
                <small>{t('vreg_protected_payouts_sub', "M-Pesa, Tigo Pesa, Airtel & Bank transfers")}</small>
              </div>
            </li>
          </ul>

          {/* Testimonial Quote */}
          <div className="vreg-side-testimonial">
            <p className="vreg-side-quote">
              {isSw
                ? "“MY DAY ilituwezesha kupata oda 18 za mapambo ndani ya mwezi wetu wa kwanza. Ni jukwaa bora la harusi nchini Tanzania!”"
                : "“MY DAY helped us secure 18 new wedding decor bookings in our first month alone. Truly the best wedding platform in Tanzania!”"}
            </p>
            <span className="vreg-side-author">
              <Sparkles size={13} color="#FFB547" />
              {isSw ? "Amina K. — Imperial Floral, Dar es Salaam" : "Amina K. — Imperial Floral, Dar es Salaam"}
            </span>
          </div>

          <div className="vreg-side-stats">
            <div>
              <strong>250+</strong>
              <span>{isSw ? 'Watoa Huduma' : 'Vendors'}</span>
            </div>
            <div>
              <strong>4.9★</strong>
              <span>{isSw ? 'Ukadiriaji' : 'Avg Rating'}</span>
            </div>
            <div>
              <strong>0 TSh</strong>
              <span>{isSw ? 'Kujiunga' : 'To Join'}</span>
            </div>
          </div>
        </aside>

        {/* Right: Registration Form */}
        <div className="vreg-main">
          <header className="vreg-head">
            <div className="vreg-title-wrap">
              <span className="vreg-pill-micro">
                <Sparkles size={12} color="#D97706" />
                {isSw ? 'Fomu Rasmi ya Usajili' : 'Official Onboarding Form'}
              </span>
              <h2 id="vreg-title" className="vreg-title">
                {t('vreg_title', "Register as a Partner Vendor")}
              </h2>
              <p className="vreg-sub">
                {t('vreg_sub', "Instant publishing & digital contract setup")}
              </p>
            </div>

            <div className="vreg-progress-ring" style={{ '--p': completion }} aria-label={`Form ${completion}% complete`}>
              <span>
                {completion}%
                <small style={{ fontSize: '0.55rem', fontWeight: 700, color: '#8C7662', textTransform: 'uppercase' }}>
                  {completion === 100 ? (isSw ? 'Tayari' : 'Ready') : (isSw ? 'Hatua' : 'Done')}
                </small>
              </span>
            </div>
          </header>

          {registered ? (
            <div className="vreg-success" role="status">
              <div className="vreg-success-icon"><CheckCircle2 size={38} /></div>
              <h3>
                {isSw ? `Karibu Sana, ${formData.name}!` : `Welcome aboard, ${formData.name}!`}
              </h3>
              <p>
                {isSw
                  ? "Orodha yako iko hewani sasa! Tunakuhamisha kwenye Tovuti yako ya Mtoa Huduma..."
                  : "Your listing is now live across Tanzania! Launching your Provider Portal…"}
              </p>
              <div className="vreg-success-bar"><span /></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="vreg-form" noValidate>
              {/* Field 1: Business Name */}
              <div className="vreg-field">
                <label htmlFor="vreg-name">
                  <span className="label-left">
                    <Store size={15} color="#D97706" />
                    {t('vreg_business_name', "Business Name")} <em>*</em>
                  </span>
                </label>
                <div className="vreg-input-wrap">
                  <Store size={18} className="vreg-input-icon" />
                  <input
                    id="vreg-name"
                    type="text"
                    placeholder={t('vreg_business_placeholder', "E.g. Imperial Floral & Decor")}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Field 2: Service Category */}
              <div className="vreg-field">
                <label id="vreg-cat-label">
                  <span className="label-left">
                    <Palette size={15} color="#D97706" />
                    {t('vreg_service_cat', "Service Category")} <em>*</em>
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#8C7662', fontWeight: 600 }}>
                    {isSw ? 'Chagua kundi lako kuu' : 'Select your primary specialty'}
                  </span>
                </label>

                <div className="vreg-cats" role="radiogroup" aria-labelledby="vreg-cat-label">
                  {CATEGORIES.map(c => {
                    const Icon = c.icon;
                    const active = formData.category === c.id;
                    const displayName = isSw ? c.swName : c.name;

                    return (
                      <button
                        key={c.id}
                        id={`vreg-cat-${c.id}`}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        title={displayName}
                        className={`vreg-cat ${active ? 'is-active' : ''}`}
                        onClick={() => setFormData({ ...formData, category: c.id })}
                      >
                        <div className="vreg-cat-top">
                          <div className="vreg-cat-icon-wrap">
                            <Icon size={17} />
                          </div>
                          {active && (
                            <CheckCircle2 size={16} className="vreg-cat-check" />
                          )}
                        </div>
                        <div>
                          <div className="vreg-cat-name">{displayName}</div>
                          <span className="vreg-cat-sub">{c.sub}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 3 & 4: Location / City & Phone / WhatsApp Contact */}
              <div className="vreg-grid">
                <div className="vreg-field">
                  <label htmlFor="vreg-location">
                    <span className="label-left">
                      <MapPin size={15} color="#D97706" />
                      {t('vreg_location', "Location / City")} <em>*</em>
                    </span>
                  </label>
                  <div className="vreg-input-wrap">
                    <MapPin size={18} className="vreg-input-icon" />
                    <input
                      id="vreg-location"
                      type="text"
                      placeholder={t('vreg_location_placeholder', "E.g. Dar es Salaam")}
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>

                  {/* Quick City Presets */}
                  <div className="vreg-pills">
                    {CITY_PRESETS.map(city => (
                      <button
                        key={city}
                        type="button"
                        className={`vreg-pill-btn ${formData.location === city ? 'is-active' : ''}`}
                        onClick={() => setFormData({ ...formData, location: city })}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="vreg-field">
                  <label htmlFor="vreg-contact">
                    <span className="label-left">
                      <Phone size={15} color="#D97706" />
                      {t('vreg_phone', "Phone / WhatsApp Contact")} <em>*</em>
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <MessageCircle size={12} /> WhatsApp
                    </span>
                  </label>
                  <div className="vreg-input-wrap">
                    <Phone size={18} className="vreg-input-icon" />
                    <input
                      id="vreg-contact"
                      type="tel"
                      inputMode="tel"
                      placeholder={t('vreg_phone_placeholder', "+255 700 000 000")}
                      value={formData.contact}
                      onChange={e => setFormData({ ...formData, contact: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#7A6657' }}>
                    {isSw ? 'Mfano: +255 700 000 000 (Inatumika kupokea arifa za wateja)' : 'Example: +255 700 000 000 (Used for instant couple booking alerts)'}
                  </div>
                </div>
              </div>

              {/* Field 5: Starting Price Rate */}
              <div className="vreg-field">
                <label htmlFor="vreg-price">
                  <span className="label-left">
                    <Wallet size={15} color="#D97706" />
                    {t('vreg_starting_price', "Starting Price Rate (TSh)")} <em>*</em>
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 700 }}>
                    {activeUnit}
                  </span>
                </label>

                <div className="vreg-input-wrap vreg-price-wrap">
                  <Wallet size={18} className="vreg-input-icon" />
                  <span className="vreg-prefix">TSh</span>
                  <input
                    id="vreg-price"
                    type="number"
                    min="10000"
                    step="50000"
                    value={formData.priceRate}
                    onChange={e => setFormData({ ...formData, priceRate: parseInt(e.target.value) || 0 })}
                    required
                  />
                  <span className="vreg-suffix">{activeUnit}</span>
                </div>

                {/* Quick Price Preset Buttons */}
                <div className="vreg-pills" style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#8C7662', alignSelf: 'center', fontWeight: 600 }}>
                    {isSw ? 'Viwango vya Haraka:' : 'Quick Presets:'}
                  </span>
                  {PRICE_PRESETS.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      className={`vreg-pill-btn ${formData.priceRate === p.value ? 'is-active' : ''}`}
                      onClick={() => setFormData({ ...formData, priceRate: p.value })}
                    >
                      TSh {p.label}
                    </button>
                  ))}
                </div>

                {/* Live Formatted Price Display */}
                <div className="vreg-price-preview">
                  <span>
                    {t('vreg_price_hint_prefix', "Couples will see:")} <strong>TSh {Number(formData.priceRate || 0).toLocaleString()}</strong> {activeUnit}
                  </span>
                  <span className="vreg-price-tag">
                    <Check size={11} /> {isSw ? 'Bei Halisi ya Orodha' : 'Live Base Rate'}
                  </span>
                </div>
              </div>

              {/* Field 6: Business Description & Amenities */}
              <div className="vreg-field">
                <label htmlFor="vreg-desc">
                  <span className="label-left">
                    <FileText size={15} color="#D97706" />
                    {t('vreg_desc_amenities', "Business Description & Amenities")}
                  </span>
                  <span className="vreg-optional">{t('vreg_desc_optional', "optional")}</span>
                </label>

                <textarea
                  id="vreg-desc"
                  rows="4"
                  maxLength={DESC_MAX}
                  placeholder={t('vreg_desc_placeholder', "Describe your services, capacity, amenities, or past experience...")}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.76rem', color: '#7A6657', fontWeight: 600 }}>
                    {t('vreg_quick_amenities_label', "Quick-add popular amenities / features:")}
                  </span>
                  <div className="vreg-counter">{formData.description.length}/{DESC_MAX}</div>
                </div>

                {/* Clickable Quick-Add Amenity Tags */}
                <div className="vreg-pills" style={{ marginTop: '0.35rem' }}>
                  {AMENITY_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className="vreg-pill-btn"
                      onClick={() => handleAddAmenity(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="vreg-error" role="alert">
                  <span style={{ fontSize: '1.1rem' }}>⚠️</span> {error}
                </div>
              )}

              {/* Submit / Launch Button */}
              <button id="vreg-submit" type="submit" className="vreg-submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 size={20} className="vreg-spin" />
                    {t('vreg_launching', "Launching your listing…")}
                  </>
                ) : (
                  <>
                    <Rocket size={20} />
                    {t('vreg_submit_btn', "Register & Launch Listing")}
                  </>
                )}
              </button>

              <p className="vreg-legal">
                <ShieldCheck size={16} />
                {t('vreg_free_join', "Free to join · No monthly fees · Commission only on confirmed bookings")}
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
