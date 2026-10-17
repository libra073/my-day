import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Sparkles, Search, MapPin, Calendar, ChevronRight, ChevronDown, ChevronLeft, Check, X,
  Building2, Palette, Music, UtensilsCrossed, Scissors, Car, 
  ShieldCheck, Star, Heart
} from 'lucide-react';

export default function ModernHero() {
  const navigate = useNavigate();
  const { t, language } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [eventDate, setEventDate] = useState('');

  // Active popover: 'category' | 'region' | 'date' | null
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Calendar month state
  const [calMonth, setCalMonth] = useState(() => new Date());

  const searchBarRef = useRef(null);

  // Close popovers on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const CATEGORY_ITEMS = [
    { 
      id: 'all', 
      label: t('cat_all', 'All Categories'), 
      desc: language === 'sw' ? 'Huduma zote za harusi' : 'All wedding services', 
      icon: Sparkles, 
      badge: language === 'sw' ? 'Zote' : 'All' 
    },
    { 
      id: 'kumbi', 
      label: t('cat_kumbi', 'Venues & Halls'), 
      desc: language === 'sw' ? 'Bichi, bustani na kumbi' : 'Beach, gardens & ballrooms', 
      icon: Building2, 
      badge: language === 'sw' ? 'Maarufu' : 'Top Pick' 
    },
    { 
      id: 'wapambaji', 
      label: t('cat_wapambaji', 'Decor & Floral'), 
      desc: language === 'sw' ? 'Mapambo na maua safi' : 'Theme styling & floral', 
      icon: Palette, 
      badge: language === 'sw' ? 'Mtindo' : 'Trending' 
    },
    { 
      id: 'entertainment', 
      label: t('cat_entertainment', 'Music & DJ / MC'), 
      desc: language === 'sw' ? 'Bendi, sauti na ma-DJ' : 'Live bands, sound & DJs', 
      icon: Music, 
      badge: language === 'sw' ? 'Sherehe' : 'Vibrant' 
    },
    { 
      id: 'catering', 
      label: t('cat_catering', 'Catering & Drinks'), 
      desc: language === 'sw' ? 'Milo, keki na vinywaji' : 'Buffet, cakes & bar', 
      icon: UtensilsCrossed, 
      badge: language === 'sw' ? 'Ladha' : 'Delicious' 
    },
    { 
      id: 'saloon', 
      label: t('cat_saloon', 'Beauty & Saloon'), 
      desc: language === 'sw' ? 'Urembo wa maharusi' : 'Bridal glam & hair', 
      icon: Scissors, 
      badge: language === 'sw' ? 'Urembo' : 'Glam' 
    },
    { 
      id: 'transport', 
      label: t('cat_transport', 'Bridal Transport'), 
      desc: language === 'sw' ? 'Magari ya kifahari' : 'Luxury convoys & cars', 
      icon: Car, 
      badge: language === 'sw' ? 'Fahari' : 'Luxury' 
    },
  ];

  const REGION_ITEMS = [
    { 
      id: 'all', 
      name: t('region_all', 'All Tanzania'), 
      desc: language === 'sw' ? 'Tafuta mikoa yote' : 'Explore nationwide', 
      icon: '🇹🇿', 
      count: '450+ Vendors', 
      badge: language === 'sw' ? 'Tanzania' : 'All' 
    },
    { 
      id: 'Dar es Salaam', 
      name: 'Dar es Salaam', 
      desc: language === 'sw' ? 'Mbezi, Masaki, City Center' : 'Coastal Hub & Beachfronts', 
      icon: '🏙️', 
      count: '180+ Vendors', 
      badge: language === 'sw' ? 'Maarufu Zaidi' : 'Most Popular' 
    },
    { 
      id: 'Arusha', 
      name: 'Arusha', 
      desc: language === 'sw' ? 'Bustani za kijani na milima' : 'Safari Gardens & Scenery', 
      icon: '🏔️', 
      count: '65+ Vendors', 
      badge: language === 'sw' ? 'Mandhari' : 'Scenic' 
    },
    { 
      id: 'Zanzibar', 
      name: 'Zanzibar', 
      desc: language === 'sw' ? 'Bichi za Nungwi, Stone Town' : 'Island & Beach Venues', 
      icon: '🏝️', 
      count: '48+ Vendors', 
      badge: language === 'sw' ? 'Visiwani' : 'Destination' 
    },
    { 
      id: 'Dodoma', 
      name: 'Dodoma', 
      desc: language === 'sw' ? 'Makao makuu ya nchi' : 'Capital City Elegance', 
      icon: '🏛️', 
      count: '42+ Vendors', 
      badge: language === 'sw' ? 'Makao Makuu' : 'Capital' 
    },
    { 
      id: 'Mwanza', 
      name: 'Mwanza', 
      desc: language === 'sw' ? 'Bustani za Ziwa Victoria' : 'Lake Victoria Views', 
      icon: '⛵', 
      count: '35+ Vendors', 
      badge: language === 'sw' ? 'Ziwani' : 'Lake City' 
    },
    { 
      id: 'Kilimanjaro', 
      name: 'Kilimanjaro', 
      desc: language === 'sw' ? 'Moshi na mteremko wa mlima' : 'Moshi & Mountain Slopes', 
      icon: '🌄', 
      count: '30+ Vendors', 
      badge: language === 'sw' ? 'Mlima' : 'Highlands' 
    },
    { 
      id: 'Tanga', 
      name: 'Tanga', 
      desc: language === 'sw' ? 'Mji wa kihistoria na bichi' : 'Pangani & Historic Coast', 
      icon: '🌊', 
      count: '25+ Vendors', 
      badge: language === 'sw' ? 'Pwani' : 'Coastal' 
    }
  ];

  const POPULAR_TAGS = [
    t('hero_popular_beach', 'Beachfront Venue'),
    t('hero_popular_luxury', 'Luxury Decor'),
    t('hero_popular_mcs', 'Wedding MCs'),
    t('hero_popular_garden', 'Garden Wedding'),
    t('hero_popular_catering', 'Buffet Catering')
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveDropdown(null);
    navigate(`/marketplace?query=${encodeURIComponent(searchQuery)}&cat=${selectedCategory}&region=${selectedRegion}&date=${eventDate}`);
  };

  // Helper labels
  const currentCategory = CATEGORY_ITEMS.find(c => c.id === selectedCategory) || CATEGORY_ITEMS[0];
  const currentRegion = REGION_ITEMS.find(r => r.id === selectedRegion) || REGION_ITEMS[0];

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return language === 'sw' ? 'Chagua Tarehe' : 'Select Date';
    try {
      const [y, m, d] = dateStr.split('-');
      const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthNamesSw = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'];
      const mIndex = parseInt(m, 10) - 1;
      const mName = language === 'sw' ? monthNamesSw[mIndex] : monthNamesEn[mIndex];
      return `${parseInt(d, 10)} ${mName} ${y}`;
    } catch {
      return dateStr;
    }
  };

  // Calendar helpers
  const monthNamesFullEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNamesFullSw = ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'];
  const weekdaysEn = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const weekdaysSw = ['Jpi', 'Jtt', 'Jnn', 'Tnn', 'Alh', 'Ijm', 'Jms'];

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const curYear = calMonth.getFullYear();
  const curMonthIndex = calMonth.getMonth();
  const daysInMonth = new Date(curYear, curMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(curYear, curMonthIndex, 1).getDay();

  // Prevent navigating to past months
  const isCurrentMonthOrPast = 
    curYear < today.getFullYear() || 
    (curYear === today.getFullYear() && curMonthIndex <= today.getMonth());

  const handlePrevMonth = () => {
    if (isCurrentMonthOrPast) return;
    setCalMonth(new Date(curYear, curMonthIndex - 1, 1));
  };
  const handleNextMonth = () => {
    setCalMonth(new Date(curYear, curMonthIndex + 1, 1));
  };

  const isPastDate = (day) => {
    const dayTimestamp = new Date(curYear, curMonthIndex, day).getTime();
    return dayTimestamp < todayStart;
  };

  const handleSelectDay = (day) => {
    if (isPastDate(day)) return; // Strictly ignore any click on passed dates
    const formattedMonth = String(curMonthIndex + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const chosenDate = `${curYear}-${formattedMonth}-${formattedDay}`;
    setEventDate(chosenDate);
    setActiveDropdown(null);
  };

  const handleQuickTimeline = (monthsAhead) => {
    const target = new Date();
    target.setMonth(target.getMonth() + monthsAhead);
    setCalMonth(new Date(target.getFullYear(), target.getMonth(), 1));
    // Default to the first Saturday of that month for weddings
    const d = new Date(target.getFullYear(), target.getMonth(), 1);
    while (d.getDay() !== 6) {
      d.setDate(d.getDate() + 1);
    }
    const formattedMonth = String(d.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(d.getDate()).padStart(2, '0');
    setEventDate(`${d.getFullYear()}-${formattedMonth}-${formattedDay}`);
    setActiveDropdown(null);
  };

  const isToday = (day) => {
    const today = new Date();
    return today.getFullYear() === curYear && today.getMonth() === curMonthIndex && today.getDate() === day;
  };

  const isSelected = (day) => {
    if (!eventDate) return false;
    const formattedMonth = String(curMonthIndex + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    return eventDate === `${curYear}-${formattedMonth}-${formattedDay}`;
  };

  return (
    <section style={{
      background: 'var(--color-hero-gradient)',
      color: '#FFFFFF',
      padding: 'clamp(3rem, 6vw, 4.5rem) 1.25rem clamp(3.5rem, 7vw, 5.5rem)',
      position: 'relative',
      zIndex: 30,
      overflow: 'visible'
    }}>
      {/* Background Ambient Glowing Orbs (contained to prevent horizontal overflow) */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute',
          top: '-120px',
          right: '-80px',
          width: '550px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(245, 166, 35, 0.3) 0%, transparent 65%)',
          borderRadius: '50%',
          filter: 'blur(65px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-120px',
          left: '-80px',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(140, 112, 91, 0.35) 0%, transparent 65%)',
          borderRadius: '50%',
          filter: 'blur(70px)',
          pointerEvents: 'none'
        }} />
      </div>

      <div className="container" style={{ maxWidth: '1080px', position: 'relative', zIndex: 10, textAlign: 'center' }}>
        
        {/* Floating Top Glass Badge & Ask MY DAY AI CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '0.5rem 1.3rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(255, 255, 255, 0.28)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#FFFFFF',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }} className="float-animation">
            <Sparkles size={16} color="#F5A623" />
            <span>{t('hero_badge', 'Tanzania’s #1 Verified Wedding Platform')}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/planner')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'linear-gradient(135deg, #F5A623 0%, #D98207 100%)',
              color: '#FFFFFF',
              padding: '0.55rem 1.3rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              fontSize: '0.85rem',
              fontWeight: 800,
              boxShadow: '0 6px 20px rgba(245, 166, 35, 0.45)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <span>✨ {t('ai_banner_btn', 'Ask MY DAY AI')}</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Main Hero Headline */}
        <h1 style={{
          fontSize: 'clamp(2.1rem, 5.2vw, 3.5rem)',
          fontFamily: 'var(--font-header)',
          fontWeight: 900,
          lineHeight: 1.12,
          letterSpacing: '-0.025em',
          marginBottom: '1.1rem',
          color: '#FFFFFF'
        }}>
          {t('hero_headline_pre', 'Plan Your Perfect Wedding Day')} <br />
          <span className="gradient-text-amber">{t('hero_headline_post', 'With Verified Vendors & Escrow Security')}</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.15rem)',
          color: 'rgba(255, 255, 255, 0.92)',
          maxWidth: '720px',
          margin: '0 auto 2.25rem',
          lineHeight: 1.65,
          fontWeight: 500
        }}>
          {t('hero_subtitle', 'Browse vetted venues, master decorators, live musicians, and bespoke catering across Tanzania with instant transparent pricing.')}
        </p>

        {/* Multi-Field Glassmorphic Search Bar with Custom Popovers */}
        <form 
          ref={searchBarRef}
          onSubmit={handleSearchSubmit} 
          className="hero-search" 
          role="search"
          style={{ position: 'relative', zIndex: 100 }}
        >
          {/* Keyword Search Input */}
          <div className="hero-field hero-field-grow">
            <Search size={19} color="#5C4331" />
            <input
              className="hero-input"
              type="text"
              aria-label="Search vendors"
              placeholder={t('hero_search_input_placeholder', 'Search venue, decorator, MC, cake...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setActiveDropdown(null)}
            />
          </div>

          <span className="hero-divider" />

          {/* Custom Category Picker Trigger */}
          <div 
            id="hero-category-trigger"
            className={`hero-field hero-field-interactive ${activeDropdown === 'category' ? 'is-active' : ''}`}
            onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
            role="button"
            tabIndex={0}
            aria-expanded={activeDropdown === 'category'}
            aria-haspopup="listbox"
          >
            <Sparkles size={18} color="#B86E00" />
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left', overflow: 'hidden' }}>
              <span style={{ display: 'block', fontSize: '0.67rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8C705B', lineHeight: 1 }}>
                {t('nav_categories', 'Category')}
              </span>
              <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#3D2C1F', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', marginTop: '2px' }}>
                {currentCategory.label}
              </span>
            </div>
            <ChevronDown 
              size={15} 
              color="#8C705B" 
              style={{ 
                flexShrink: 0,
                transition: 'transform 0.22s ease', 
                transform: activeDropdown === 'category' ? 'rotate(180deg)' : 'none' 
              }} 
            />

            {/* Custom Category Popover Dropdown */}
            {activeDropdown === 'category' && (
              <div 
                className="hero-popover" 
                style={{ left: 0, width: '420px', maxWidth: 'min(420px, calc(100vw - 2.5rem))' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="hero-popover-header">
                  <div>
                    <span className="hero-popover-title">
                      {language === 'sw' ? 'Chagua Kategoria ya Huduma' : 'Select Service Category'}
                    </span>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#8C705B', fontWeight: 500 }}>
                      {language === 'sw' ? 'Huduma zote zilizothibitishwa Tanzania' : 'Verified wedding vendors across Tanzania'}
                    </p>
                  </div>
                  <span className="hero-popover-badge">7 {language === 'sw' ? 'Huduma' : 'Categories'}</span>
                </div>

                <div className="hero-cat-grid">
                  {CATEGORY_ITEMS.map((cat) => {
                    const CatIcon = cat.icon;
                    const isSelectedCat = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        className={`hero-cat-item ${isSelectedCat ? 'is-selected' : ''}`}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setActiveDropdown(null);
                        }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: isSelectedCat ? 'linear-gradient(135deg, #F5A623 0%, #D98207 100%)' : '#FFFFFF',
                          color: isSelectedCat ? '#FFFFFF' : '#B86E00',
                          border: isSelectedCat ? 'none' : '1px solid #E8DCCF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: isSelectedCat ? '0 4px 10px rgba(245, 166, 35, 0.4)' : 'none'
                        }}>
                          <CatIcon size={18} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3D2C1F' }}>
                              {cat.label}
                            </span>
                            {isSelectedCat && <Check size={14} color="#B86E00" strokeWidth={3} />}
                          </div>
                          <span style={{ display: 'block', fontSize: '0.72rem', color: '#8C705B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cat.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <span className="hero-divider" />

          {/* Custom Region Picker Trigger */}
          <div 
            id="hero-region-trigger"
            className={`hero-field hero-field-interactive ${activeDropdown === 'region' ? 'is-active' : ''}`}
            onClick={() => setActiveDropdown(activeDropdown === 'region' ? null : 'region')}
            role="button"
            tabIndex={0}
            aria-expanded={activeDropdown === 'region'}
            aria-haspopup="listbox"
          >
            <MapPin size={18} color="#B86E00" />
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left', overflow: 'hidden' }}>
              <span style={{ display: 'block', fontSize: '0.67rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8C705B', lineHeight: 1 }}>
                {t('hero_region_label', 'Region')}
              </span>
              <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#3D2C1F', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', marginTop: '2px' }}>
                {currentRegion.name}
              </span>
            </div>
            <ChevronDown 
              size={15} 
              color="#8C705B" 
              style={{ 
                flexShrink: 0,
                transition: 'transform 0.22s ease', 
                transform: activeDropdown === 'region' ? 'rotate(180deg)' : 'none' 
              }} 
            />

            {/* Custom Region Popover Dropdown */}
            {activeDropdown === 'region' && (
              <div 
                className="hero-popover" 
                style={{ left: 0, width: '440px', maxWidth: 'min(440px, calc(100vw - 2.5rem))' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="hero-popover-header">
                  <div>
                    <span className="hero-popover-title">
                      {language === 'sw' ? 'Chagua Eneo / Mkoa wa Harusi' : 'Select Wedding Destination'}
                    </span>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#8C705B', fontWeight: 500 }}>
                      {language === 'sw' ? 'Miji na maeneo maarufu ya harusi' : 'Top destinations & wedding hubs in Tanzania'}
                    </p>
                  </div>
                  <span className="hero-popover-badge">8 {language === 'sw' ? 'Mikoa' : 'Regions'}</span>
                </div>

                <div className="hero-region-grid">
                  {REGION_ITEMS.map((reg) => {
                    const isSelectedReg = selectedRegion === reg.id;
                    return (
                      <button
                        key={reg.id}
                        type="button"
                        className={`hero-region-item ${isSelectedReg ? 'is-selected' : ''}`}
                        onClick={() => {
                          setSelectedRegion(reg.id);
                          setActiveDropdown(null);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                          <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{reg.icon}</span>
                          <div style={{ textAlign: 'left', minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#3D2C1F' }}>
                                {reg.name}
                              </span>
                              {isSelectedReg && <Check size={14} color="#B86E00" strokeWidth={3} />}
                            </div>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#8C705B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {reg.desc}
                            </span>
                          </div>
                        </div>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: isSelectedReg ? '#B86E00' : '#8C705B',
                          background: isSelectedReg ? 'rgba(245, 166, 35, 0.2)' : '#EDE4D8',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '8px',
                          whiteSpace: 'nowrap',
                          marginLeft: '0.4rem'
                        }}>
                          {reg.count.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <span className="hero-divider" />

          {/* Custom Date Picker Trigger */}
          <div 
            id="hero-date-trigger"
            className={`hero-field hero-field-interactive ${activeDropdown === 'date' ? 'is-active' : ''}`}
            onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
            role="button"
            tabIndex={0}
            aria-expanded={activeDropdown === 'date'}
            aria-haspopup="dialog"
          >
            <Calendar size={18} color="#B86E00" />
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left', overflow: 'hidden' }}>
              <span style={{ display: 'block', fontSize: '0.67rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8C705B', lineHeight: 1 }}>
                {t('event_date', 'Event Date')}
              </span>
              <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: eventDate ? '#B86E00' : '#3D2C1F', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', marginTop: '2px' }}>
                {formatDateLabel(eventDate)}
              </span>
            </div>
            
            {eventDate ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEventDate('');
                }}
                style={{ 
                  background: 'rgba(140, 112, 91, 0.1)', 
                  border: 'none', 
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer', 
                  color: '#8C705B',
                  padding: 0,
                  flexShrink: 0
                }}
                title={language === 'sw' ? 'Futa tarehe' : 'Clear date'}
              >
                <X size={12} />
              </button>
            ) : (
              <ChevronDown 
                size={15} 
                color="#8C705B" 
                style={{ 
                  flexShrink: 0,
                  transition: 'transform 0.22s ease', 
                  transform: activeDropdown === 'date' ? 'rotate(180deg)' : 'none' 
                }} 
              />
            )}

            {/* Custom Calendar Popover */}
            {activeDropdown === 'date' && (
              <div 
                className="hero-popover hero-cal-wrapper" 
                style={{ right: 0, width: '340px', maxWidth: 'min(340px, calc(100vw - 2.5rem))' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="hero-popover-header" style={{ marginBottom: '0.5rem' }}>
                  <div>
                    <span className="hero-popover-title">
                      {language === 'sw' ? 'Tarehe ya Harusi' : 'Select Wedding Date'}
                    </span>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#8C705B', fontWeight: 500 }}>
                      {language === 'sw' ? 'Angalia upatikanaji wa watoa huduma' : 'Check vendor availability for your big day'}
                    </p>
                  </div>
                  {eventDate && (
                    <button
                      type="button"
                      onClick={() => setEventDate('')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#B86E00',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {language === 'sw' ? 'Futa' : 'Clear'}
                    </button>
                  )}
                </div>

                {/* Quick Timeline Chips */}
                <div className="hero-quick-chips">
                  <button type="button" className="hero-quick-chip" onClick={() => handleQuickTimeline(1)}>
                    {language === 'sw' ? 'Mwezi Ujao' : 'Next Month'}
                  </button>
                  <button type="button" className="hero-quick-chip" onClick={() => handleQuickTimeline(3)}>
                    {language === 'sw' ? 'Miezi 3' : 'In 3 Months'}
                  </button>
                  <button type="button" className="hero-quick-chip" onClick={() => handleQuickTimeline(6)}>
                    {language === 'sw' ? 'Miezi 6' : 'In 6 Months'}
                  </button>
                  <button type="button" className="hero-quick-chip" onClick={() => {
                    setCalMonth(new Date(2026, 11, 1));
                    setEventDate('2026-12-25');
                    setActiveDropdown(null);
                  }}>
                    {language === 'sw' ? 'Des 2026' : 'Dec 2026'}
                  </button>
                </div>

                {/* Month Navigator */}
                <div className="hero-cal-nav">
                  <button 
                    type="button" 
                    className="hero-cal-nav-btn" 
                    onClick={handlePrevMonth} 
                    disabled={isCurrentMonthOrPast}
                    style={isCurrentMonthOrPast ? { opacity: 0.28, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
                    aria-label="Previous Month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="hero-cal-month-title">
                    {language === 'sw' ? monthNamesFullSw[curMonthIndex] : monthNamesFullEn[curMonthIndex]} {curYear}
                  </span>
                  <button type="button" className="hero-cal-nav-btn" onClick={handleNextMonth} aria-label="Next Month">
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Weekdays Row */}
                <div className="hero-cal-grid" style={{ marginBottom: '0.35rem' }}>
                  {(language === 'sw' ? weekdaysSw : weekdaysEn).map((wd, i) => (
                    <span key={i} className="hero-cal-weekday">{wd}</span>
                  ))}
                </div>

                {/* Month Days Grid */}
                <div className="hero-cal-grid">
                  {/* Empty cells before 1st day */}
                  {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                    <div key={`empty-${idx}`} style={{ aspectRatio: '1' }} />
                  ))}

                  {/* Days */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const selected = isSelected(day);
                    const isCurrentDay = isToday(day);
                    const isPast = isPastDate(day);

                    return (
                      <button
                        key={`day-${day}`}
                        type="button"
                        disabled={isPast}
                        className={`hero-cal-day ${selected ? 'is-selected' : ''} ${isCurrentDay ? 'is-today' : ''} ${isPast ? 'is-past' : ''}`}
                        onClick={() => !isPast && handleSelectDay(day)}
                        title={isPast ? (language === 'sw' ? 'Tarehe iliyopita haichaguliwi' : 'Past date cannot be selected') : undefined}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <button type="submit" className="btn-pill-amber hero-search-btn">
            {t('hero_search_button', 'Search')} <ChevronRight size={18} />
          </button>
        </form>

        {/* Popular Tags / Quick Filter Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.6rem',
          fontSize: '0.88rem',
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          <span style={{ fontWeight: 700, color: '#FFC857' }}>{t('hero_popular_label', 'Popular:')}</span>
          {POPULAR_TAGS.map((tag, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSearchQuery(tag);
                navigate(`/marketplace?query=${encodeURIComponent(tag)}`);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-pill)',
                padding: '0.35rem 0.95rem',
                fontSize: '0.84rem',
                fontWeight: 600,
                boxShadow: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Trust Stats Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2.5rem',
          marginTop: '2.5rem',
          flexWrap: 'wrap',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          paddingTop: '1.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Star size={20} color="#F5A623" fill="#F5A623" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#FFFFFF' }}>{t('hero_verified_title', '100% Verified')}</div>
              <div style={{ fontSize: '0.84rem', opacity: 0.92 }}>{t('hero_verified_sub', 'Curated Vendor Excellence')}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={22} color="#F5A623" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#FFFFFF' }}>{t('hero_mobile_money_stat', 'M-Pesa & Tigo Pesa')}</div>
              <div style={{ fontSize: '0.84rem', opacity: 0.92 }}>{t('hero_escrow_stat', 'Escrow Milestone Security')}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Heart size={20} color="#F5A623" fill="#F5A623" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#FFFFFF' }}>{t('hero_nationwide_title', 'Tanzania Nationwide')}</div>
              <div style={{ fontSize: '0.84rem', opacity: 0.92 }}>{t('hero_nationwide_sub', 'Dar, Arusha, Zanzibar & Beyond')}</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
