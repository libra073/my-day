import { useSparkleBurst } from './motion/MotionSparkles';
import RefractionCanvas from './lab/RefractionCanvas';
import useImageLens from './liquid-glass/useImageLens';
import RacingSpark from './motion/RacingSpark';
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Sparkles, Search, MapPin, Calendar, ChevronRight, ChevronDown, ChevronLeft, Check, X,
  Building2, Palette, Music, UtensilsCrossed, Scissors, Car, 
  ShieldCheck, Star, Heart
} from 'lucide-react';
import {
  getDarEsSalaamCalendarNow,
  canNavigatePrevMonth
} from '../services/businessSchedule';

export default function ModernHero() {
  const navigate = useNavigate();
  const { t, language } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [eventDate, setEventDate] = useState('');

  // Active popover: 'category' | 'region' | 'date' | null
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { triggerSparkles, SparkleOverlay } = useSparkleBurst();
  const [isSearching, setIsSearching] = useState(false);

  // Timezone-aware Dar es Salaam calendar state & midnight auto-recalculation
  const [darNow, setDarNow] = useState(() => getDarEsSalaamCalendarNow());

  useEffect(() => {
    const checkMidnight = () => {
      const latest = getDarEsSalaamCalendarNow();
      setDarNow(prev => prev.todayStr !== latest.todayStr ? latest : prev);
    };
    const interval = setInterval(checkMidnight, 30000);
    const onVis = () => { if (document.visibilityState === 'visible') checkMidnight(); };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // Calendar month state
  const [calMonth, setCalMonth] = useState(() => {
    const { year, month } = getDarEsSalaamCalendarNow();
    return new Date(year, month, 1);
  });

  const searchBarRef = useRef(null);
  const heroTiles = useRef([]);
  const stageRef = useRef(null);
  const pillTopRef = useRef(null);
  const pillBottomRef = useRef(null);
  const topLens = useImageLens(pillTopRef, stageRef);
  const bottomLens = useImageLens(pillBottomRef, stageRef);

  // Scroll parallax: the three photographs drift at different rates.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const rates = [24, -16, 38];
    let frame = 0;

    const update = () => {
      frame = 0;
      const tiles = heroTiles.current.filter(Boolean);
      if (!tiles.length) return;
      const progress = Math.min(window.scrollY, 820) / 820;
      tiles.forEach((tile, i) => {
        tile.style.transform = `translate3d(0, ${(progress * rates[i]).toFixed(2)}px, 0) scale(1.06)`;
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

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

  const curYear = calMonth.getFullYear();
  const curMonthIndex = calMonth.getMonth();
  const daysInMonth = new Date(curYear, curMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(curYear, curMonthIndex, 1).getDay();

  // Prevent navigating to past months in Africa/Dar_es_Salaam
  const isCurrentMonthOrPast = !canNavigatePrevMonth(curYear, curMonthIndex);

  const handlePrevMonth = () => {
    if (isCurrentMonthOrPast) return;
    const prevMonth = curMonthIndex - 1;
    const targetYear = prevMonth < 0 ? curYear - 1 : curYear;
    const targetMonth = prevMonth < 0 ? 11 : prevMonth;
    if (!canNavigatePrevMonth(targetYear, targetMonth + 1)) {
      setCalMonth(new Date(darNow.year, darNow.month, 1));
      return;
    }
    setCalMonth(new Date(targetYear, targetMonth, 1));
  };
  const handleNextMonth = () => {
    setCalMonth(new Date(curYear, curMonthIndex + 1, 1));
  };

  const isPastDate = (day) => {
    const formattedMonth = String(curMonthIndex + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${curYear}-${formattedMonth}-${formattedDay}`;
    return dateStr < darNow.todayStr;
  };

  const handleSelectDay = (day) => {
    if (isPastDate(day)) return; // Strictly ignore any click on past dates
    const formattedMonth = String(curMonthIndex + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const chosenDate = `${curYear}-${formattedMonth}-${formattedDay}`;
    if (chosenDate < darNow.todayStr) return;
    setEventDate(chosenDate);
    setActiveDropdown(null);
  };

  const handleQuickTimeline = (monthsAhead) => {
    const target = new Date(darNow.year, darNow.month + monthsAhead, 1);
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
    const formattedMonth = String(curMonthIndex + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${curYear}-${formattedMonth}-${formattedDay}`;
    return dateStr === darNow.todayStr;
  };

  const isSelected = (day) => {
    if (!eventDate) return false;
    const formattedMonth = String(curMonthIndex + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    return eventDate === `${curYear}-${formattedMonth}-${formattedDay}`;
  };

  const handleInstrumentMouseMove = (e) => {
    if (!searchBarRef.current) return;
    const rect = searchBarRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    searchBarRef.current.style.setProperty('--specular-x', `${x}%`);
    searchBarRef.current.style.setProperty('--specular-y', `${y}%`);
    searchBarRef.current.style.setProperty('--specular-opacity', '1');
  };

  const toggleDropdownKey = (e, name) => {
    if (e.target !== e.currentTarget && e.target.closest('.hero-popover')) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveDropdown((prev) => (prev === name ? null : name));
    }
  };

  return (
    <section
      className="hero-section"
      style={{
        background: 'transparent',
        color: '#0f172a',
        position: 'relative',
        zIndex: 30,
        overflow: 'visible'
      }}
    >
      <div className="container hero-container" style={{ maxWidth: '1180px', position: 'relative', zIndex: 10, textAlign: 'center' }}>
        
        {/* Editorial Top Badge */}
        <div className="glass-clear-crystal hero-editorial-badge">
          <Sparkles size={14} color="var(--liquid-sapphire-500)" />
          <span>{t('hero_editorial_badge', "Tanzania's Premier Wedding Marketplace")}</span>
        </div>

        {/* Confident Editorial Headline */}
        <h1 className="hero-editorial-headline">
          {t('hero_headline_pre', 'Your day.')}{' '}
          <span className="hero-editorial-shimmer">
            {t('hero_headline_post', 'Beautifully planned.')}
          </span>
        </h1>

        {/* Editorial Supporting Subtitle */}
        <p className="hero-editorial-subtitle">
          {t('hero_subtitle', 'Discover exceptional wedding professionals and bring your dream celebration to life.')}
        </p>

        {/* Editorial Dual Action Group */}
        <div className="hero-editorial-actions">
          <button
            type="button"
            onClick={() => navigate('/marketplace')}
            className="btn-primary glass-puck hero-cta-primary"
          >
            <span>{t('hero_explore_vendors', 'Explore vendors')}</span>
            <ChevronRight size={17} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/planner')}
            className="glass-clear-crystal hero-cta-secondary"
          >
            <Sparkles size={16} color="var(--liquid-sapphire-500)" />
            <span>{t('hero_plan_with_ai', 'Plan with AI')}</span>
          </button>
        </div>

        {/* Engineered Optical Search Instrument */}
        <div className="hero-search-instrument-container">
          <form 
          ref={searchBarRef}
          onSubmit={handleSearchSubmit} 
          onMouseMove={handleInstrumentMouseMove}
          onMouseLeave={() => searchBarRef.current?.style.setProperty('--specular-opacity', '0')}
          className="hero-glass-instrument glass-reflective"
          role="search"
        >
          <span className="hero-lens" aria-hidden="true" />
          {/* Keyword Search Input */}
          <div className="hero-glass-sector hero-glass-sector--search">
            <div className="hero-sector-trigger-row">
              <Search size={18} color="var(--liquid-sapphire-500)" style={{ flexShrink: 0 }} />
              <div className="hero-sector-copy">
                <label htmlFor="hero-search-input" className="hero-search-mobile-label">
                  {language === 'sw' ? 'Tafuta Huduma' : 'Search Vendors'}
                </label>
                <input
                  id="hero-search-input"
                  className="hero-input"
                  type="text"
                  aria-label={language === 'sw' ? 'Tafuta watoa huduma' : 'Search vendors'}
                  placeholder={t('hero_search_input_placeholder', 'Search venue, decorator, MC, cake...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setActiveDropdown(null)}
                />
              </div>
            </div>
          </div>

          <span className="hero-glass-divider" />

          {/* Custom Category Picker Trigger */}
          <div
            id="hero-category-trigger"
            className={`hero-glass-sector hero-glass-sector--dropdown ${activeDropdown === 'category' ? 'is-active' : ''}`}
            onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
            onKeyDown={(e) => toggleDropdownKey(e, 'category')}
            role="button"
            tabIndex={0}
            aria-expanded={activeDropdown === 'category'}
            aria-haspopup="listbox"
          >
            <div className="hero-sector-trigger-row">
              <Sparkles size={17} color="var(--liquid-sapphire-500)" style={{ flexShrink: 0 }} />
              <div className="hero-sector-copy">
                <span className="hero-sector-label">
                  {t('nav_categories', 'Category')}
                </span>
                <span className="hero-sector-value">
                  {currentCategory.label}
                </span>
              </div>
              <ChevronDown
                size={15}
                color="var(--liquid-sapphire-500)"
                style={{
                  flexShrink: 0,
                  transition: 'transform 0.22s ease',
                  transform: activeDropdown === 'category' ? 'rotate(180deg)' : 'none'
                }}
              />
            </div>

            {/* Custom Category Popover Dropdown */}
            {activeDropdown === 'category' && (
              <div
                className="hero-popover hero-popover--category glass-smoked"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="hero-popover-header">
                  <div className="hero-popover-heading">
                    <span className="hero-popover-title">
                      {language === 'sw' ? 'Chagua Kategoria ya Huduma' : 'Select Service Category'}
                    </span>
                    <p className="hero-popover-subtitle">
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
                        <div className="hero-cat-item-top">
                          <div className={`hero-cat-item-icon ${isSelectedCat ? 'is-selected' : ''}`}>
                            <CatIcon size={17} />
                          </div>
                          {isSelectedCat && (
                            <Check size={14} color="var(--liquid-sapphire-500)" strokeWidth={3} className="hero-cat-item-check-mobile" />
                          )}
                        </div>
                        <div className="hero-cat-item-body">
                          <div className="hero-cat-item-title-row">
                            <span className="hero-cat-item-title">
                              {cat.label}
                            </span>
                            {isSelectedCat && (
                              <Check size={14} color="var(--liquid-sapphire-500)" strokeWidth={3} className="hero-cat-item-check-desktop" />
                            )}
                          </div>
                          <span className="hero-cat-item-desc">
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

          <span className="hero-glass-divider" />

          {/* Custom Region Picker Trigger */}
          <div
            id="hero-region-trigger"
            className={`hero-glass-sector hero-glass-sector--dropdown ${activeDropdown === 'region' ? 'is-active' : ''}`}
            onClick={() => setActiveDropdown(activeDropdown === 'region' ? null : 'region')}
            onKeyDown={(e) => toggleDropdownKey(e, 'region')}
            role="button"
            tabIndex={0}
            aria-expanded={activeDropdown === 'region'}
            aria-haspopup="listbox"
          >
            <div className="hero-sector-trigger-row">
              <MapPin size={17} color="var(--liquid-sapphire-500)" style={{ flexShrink: 0 }} />
              <div className="hero-sector-copy">
                <span className="hero-sector-label">
                  {t('hero_region_label', 'Region')}
                </span>
                <span className="hero-sector-value">
                  {currentRegion.name}
                </span>
              </div>
              <ChevronDown
                size={15}
                color="var(--liquid-sapphire-500)"
                style={{
                  flexShrink: 0,
                  transition: 'transform 0.22s ease',
                  transform: activeDropdown === 'region' ? 'rotate(180deg)' : 'none'
                }}
              />
            </div>

            {/* Custom Region Popover Dropdown */}
            {activeDropdown === 'region' && (
              <div
                className="hero-popover hero-popover--region glass-smoked"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="hero-popover-header">
                  <div className="hero-popover-heading">
                    <span className="hero-popover-title">
                      {language === 'sw' ? 'Chagua Eneo / Mkoa wa Harusi' : 'Select Wedding Destination'}
                    </span>
                    <p className="hero-popover-subtitle">
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
                        <div className="hero-region-item-top">
                          <div className="hero-region-item-lead">
                            <span className="hero-region-item-flag">{reg.icon}</span>
                            <span className="hero-region-item-name-row">
                              <span className="hero-region-item-name">{reg.name}</span>
                              {isSelectedReg && <Check size={14} color="var(--liquid-sapphire-500)" strokeWidth={3} style={{ flexShrink: 0 }} />}
                            </span>
                          </div>
                          <span className={`hero-region-item-count ${isSelectedReg ? 'is-selected' : ''}`}>
                            {reg.count.split(' ')[0]}
                          </span>
                        </div>
                        <span className="hero-region-item-desc">
                          {reg.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <span className="hero-glass-divider" />

          {/* Custom Date Picker Trigger */}
          <div
            id="hero-date-trigger"
            className={`hero-glass-sector hero-glass-sector--dropdown ${activeDropdown === 'date' ? 'is-active' : ''}`}
            onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
            onKeyDown={(e) => toggleDropdownKey(e, 'date')}
            role="button"
            tabIndex={0}
            aria-expanded={activeDropdown === 'date'}
            aria-haspopup="dialog"
          >
            <div className="hero-sector-trigger-row">
              <Calendar size={17} color="var(--liquid-sapphire-500)" style={{ flexShrink: 0 }} />
              <div className="hero-sector-copy">
                <span className="hero-sector-label">
                  {t('event_date', 'Event Date')}
                </span>
                <span
                  className="hero-sector-value"
                  style={{ color: eventDate ? 'var(--liquid-sapphire-500)' : 'var(--app-text-primary)' }}
                >
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
                    background: 'rgba(0, 102, 238, 0.12)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--liquid-sapphire-500)',
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
                  color="var(--liquid-sapphire-500)"
                  style={{
                    flexShrink: 0,
                    transition: 'transform 0.22s ease',
                    transform: activeDropdown === 'date' ? 'rotate(180deg)' : 'none'
                  }}
                />
              )}
            </div>

            {/* Custom Calendar Popover */}
            {activeDropdown === 'date' && (
              <div
                className="hero-popover hero-popover--date hero-cal-wrapper glass-smoked"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="hero-popover-header" style={{ marginBottom: '0.5rem' }}>
                  <div className="hero-popover-heading">
                    <span className="hero-popover-title">
                      {language === 'sw' ? 'Tarehe ya Harusi' : 'Select Wedding Date'}
                    </span>
                    <p className="hero-popover-subtitle">
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
                        color: 'var(--liquid-sapphire-500)',
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
                  <button type="button" className="hero-quick-chip" onClick={() => handleQuickTimeline(12)}>
                    {language === 'sw' ? 'Mwaka 1' : 'In 1 Year'}
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
                    aria-label={language === 'sw' ? "Mwezi uliopita" : "Previous Month"}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="hero-cal-month-title">
                    {language === 'sw' ? monthNamesFullSw[curMonthIndex] : monthNamesFullEn[curMonthIndex]} {curYear}
                  </span>
                  <button type="button" className="hero-cal-nav-btn" onClick={handleNextMonth} aria-label={language === 'sw' ? "Mwezi ujao" : "Next Month"}>
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

          {/* Search Button (Dimensional Reflective Glass Meniscus Puck) */}
          <button type="submit" className="hero-search-btn hero-glass-puck glass-puck" onClick={(e) => triggerSparkles(e)}>
            <span>{t('hero_explore_vendors', 'Explore vendors')}</span> <ChevronRight size={18} />
          </button>
        </form>
        </div>

        {/* Minimal Integrated Trust Ribbon */}
        <div
          className="hero-trust-minimal glass-clear-crystal"
          style={{
            opacity: activeDropdown ? 0.08 : 1,
            transition: 'opacity 0.22s ease',
            pointerEvents: activeDropdown ? 'none' : 'auto'
          }}
        >
          <div className="hero-trust-point">
            <div className="hero-trust-dot" />
            <span>{t('hero_mobile_money_stat', '30% Protected Escrow')}</span>
          </div>
          <span className="hero-trust-sep">•</span>
          <div className="hero-trust-point">
            <div className="hero-trust-dot" />
            <span>{t('hero_verified_title', '100% Curated & Vetted')}</span>
          </div>
          <span className="hero-trust-sep">•</span>
          <div className="hero-trust-point">
            <div className="hero-trust-dot" />
            <span>{t('hero_nationwide_title', 'Tanzania Nationwide')}</span>
          </div>
        </div>

        {/* Photographic Wedding Stage */}
        <div className="hero-photo-stage">
          <div className="hero-photo-viewport hero-photo-viewport--triptych" ref={stageRef}>
            <div className="hero-photo-tile" ref={(el) => { heroTiles.current[0] = el; }}>
              <img src="/portfolio/beach-tide.jpg" alt="Bride and groom on the beach in Zanzibar" loading="eager" />
            </div>
            <div className="hero-photo-tile" ref={(el) => { heroTiles.current[1] = el; }}>
              <img src="/portfolio/gele-portrait.jpg" alt={language === 'sw' ? 'Bibi harusi wa Kitanzania akiwa na dhahabu na shela' : 'Tanzanian bride in gold and veil'} loading="eager" />
            </div>
            <div className="hero-photo-tile" ref={(el) => { heroTiles.current[2] = el; }}>
              <img src="/portfolio/stone-town-vows.jpg" alt={language === 'sw' ? 'Wanandoa wakiwa na kanzu na lace Stone Town' : 'Couple in kanzu and lace in Stone Town'} loading="eager" />
            </div>
            <div className="hero-photo-overlay" />

            <div className="hero-photo-pill hero-photo-pill-top" ref={pillTopRef}>
              {topLens && (
                <RefractionCanvas
                  texture={topLens.texture}
                  origin={{ x: 0, y: 0 }}
                  width={topLens.width}
                  height={topLens.height}
                  strength={12}
                  blur={1.2}
                  rim={0.3}
                  tint={0.46}
                  tintColor={[0.035, 0.07, 0.13]}
                  className="hero-lens-canvas"
                />
              )}
              <MapPin size={13} color="var(--liquid-sapphire-400)" />
              <span>{t('hero_photo_caption_location', 'Coastal and Inland Tanzania • Curated Celebrations')}</span>
            </div>

            <div className="hero-photo-pill hero-photo-pill-bottom" ref={pillBottomRef}>
              {bottomLens && (
                <RefractionCanvas
                  texture={bottomLens.texture}
                  origin={{ x: 0, y: 0 }}
                  width={bottomLens.width}
                  height={bottomLens.height}
                  strength={12}
                  blur={1.2}
                  rim={0.3}
                  tint={0.46}
                  tintColor={[0.035, 0.07, 0.13]}
                  className="hero-lens-canvas"
                />
              )}
              <ShieldCheck size={14} color="#10b981" />
              <span>{t('hero_photo_caption_escrow', 'Protected 30% Escrow Guarantee')}</span>
            </div>
          </div>
        </div>

      {/* Closing .container */}
      </div>
    </section>
  );
}
