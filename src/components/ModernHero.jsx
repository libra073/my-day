import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Sparkles, Search, MapPin, CalendarDays, ArrowRight, ShieldCheck, Wallet } from 'lucide-react';
import GlassSelect from './ui/GlassSelect';
import GlassDatePicker from './ui/GlassDatePicker';
import { getDarEsSalaamCalendarNow } from '../services/businessSchedule';

export default function ModernHero() {
  const navigate = useNavigate();
  const { t, language } = useAppContext();
  const isSw = language === 'sw';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Locations');
  const [eventDate, setEventDate] = useState('');

  const [darNow, setDarNow] = useState(() => getDarEsSalaamCalendarNow());

  useEffect(() => {
    const checkMidnight = () => {
      const latest = getDarEsSalaamCalendarNow();
      setDarNow((prev) => (prev.todayStr !== latest.todayStr ? latest : prev));
    };
    const interval = setInterval(checkMidnight, 30000);
    const onVis = () => { if (document.visibilityState === 'visible') checkMidnight(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const CATEGORY_OPTIONS = [
    { value: '', label: t('cat_all', 'All Categories') },
    { value: 'kumbi', label: t('cat_kumbi', 'Venues & Halls') },
    { value: 'wapambaji', label: t('cat_wapambaji', 'Decor & Floral') },
    { value: 'entertainment', label: t('cat_entertainment', 'Music & DJ / MC') },
    { value: 'catering', label: t('cat_catering', 'Catering & Drinks') },
    { value: 'saloon', label: t('cat_saloon', 'Beauty & Saloon') },
    { value: 'transport', label: t('cat_transport', 'Bridal Transport') },
  ];

  const REGION_OPTIONS = [
    { value: 'All Locations', label: t('region_all', 'All Tanzania') },
    { value: 'Dar es Salaam', label: 'Dar es Salaam' },
    { value: 'Arusha', label: 'Arusha' },
    { value: 'Zanzibar', label: 'Zanzibar' },
    { value: 'Dodoma', label: 'Dodoma' },
    { value: 'Mwanza', label: 'Mwanza' },
  ];

  const TRUST_ITEMS = [
    { icon: ShieldCheck, text: t('hero_trust_verified', 'Verified vendors') },
    { icon: Wallet, text: t('hero_trust_secure', 'Secure mobile money') },
    { icon: Sparkles, text: t('hero_trust_ai', 'AI planning assistant') },
  ];

  const PHOTOS = [
    { src: '/images/hero-arch.jpg', alt: isSw ? 'Mapambo ya harusi' : 'Wedding floral arch', tag: isSw ? 'Mapambo' : 'Decor' },
    { src: '/images/hero-hands.jpg', alt: isSw ? 'Mikono ya maharusi' : 'Couple holding hands', tag: isSw ? 'Mapenzi' : 'Romance' },
    { src: '/images/hero-balloons.jpg', alt: isSw ? 'Baluni za sherehe' : 'Celebration balloons', tag: isSw ? 'Sherehe' : 'Party' },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('query', searchQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedRegion && selectedRegion !== 'All Locations') params.set('region', selectedRegion);
    if (eventDate) params.set('date', eventDate);
    const qs = params.toString();
    navigate(qs ? `/marketplace?${qs}` : '/marketplace');
  };

  return (
    <section className="md-hero">
      <div className="md-floats" aria-hidden="true">
        <span className="md-orb" />
        <span className="md-cube" />
        <span className="md-torus" />
      </div>

      <div className="md-hero__inner">
        <div className="md-hero__copy">
          <div className="md-hero__badge md-glass">
            <Sparkles size={14} />
            <span>{t('hero_editorial_badge', "Tanzania's Premier Wedding Marketplace")}</span>
          </div>

          <h1 className="md-hero__title">
            {t('hero_headline_pre', 'Your day.')}{' '}
            <span className="md-hero__title-accent">{t('hero_headline_post', 'Beautifully planned.')}</span>
          </h1>

          <p className="md-hero__subtitle">
            {t('hero_subtitle', 'Discover exceptional wedding professionals and bring your dream celebration to life.')}
          </p>

          <div className="md-hero__actions">
            <button type="button" className="md-button md-button--primary" onClick={() => navigate('/marketplace')}>
              <span>{t('hero_explore_vendors', 'Explore vendors')}</span>
              <ArrowRight size={17} />
            </button>
            <button type="button" className="md-button md-glass" onClick={() => navigate('/planner')}>
              <Sparkles size={16} />
              <span>{t('hero_plan_with_ai', 'Plan with AI')}</span>
            </button>
          </div>

          <form className="md-search md-glass" role="search" onSubmit={handleSearchSubmit}>
            <div className="md-search__query">
              <Search size={18} />
              <input
                type="text"
                className="md-search__input"
                aria-label={isSw ? 'Tafuta watoa huduma' : 'Search vendors'}
                placeholder={t('hero_search_input_placeholder', 'Search venue, decorator, MC, cake…')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <span className="md-search__divider" aria-hidden="true" />

            <div className="md-search__field">
              <label className="md-search__label" htmlFor="md-hero-category">
                <Sparkles size={14} />
                {t('nav_categories', 'Category')}
              </label>
              <GlassSelect
                id="md-hero-category"
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={CATEGORY_OPTIONS}
                ariaLabel={t('nav_categories', 'Category')}
              />
            </div>

            <div className="md-search__field">
              <label className="md-search__label" htmlFor="md-hero-region">
                <MapPin size={14} />
                {t('filter_region', 'Region')}
              </label>
              <GlassSelect
                id="md-hero-region"
                value={selectedRegion}
                onChange={setSelectedRegion}
                options={REGION_OPTIONS}
                ariaLabel={t('filter_region', 'Region')}
              />
            </div>

            <div className="md-search__field">
              <label className="md-search__label" htmlFor="md-hero-date">
                <CalendarDays size={14} />
                {isSw ? 'Tarehe' : 'Date'}
              </label>
              <GlassDatePicker
                id="md-hero-date"
                value={eventDate}
                onChange={setEventDate}
                min={darNow.todayStr}
                ariaLabel={isSw ? 'Chagua tarehe ya harusi' : 'Choose wedding date'}
              />
            </div>

            <button type="submit" className="md-search__submit" aria-label={isSw ? 'Tafuta' : 'Search'}>
              <Search size={18} />
              <span>{t('hero_search_button', 'Search')}</span>
            </button>
          </form>

          <ul className="md-trust">
            {TRUST_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.text} className="md-trust__item">
                  <Icon size={15} />
                  <span>{item.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="md-photos">
          {PHOTOS.map((photo, i) => (
            <figure key={photo.src} className={`md-photos__frame md-glass md-photos__frame--${i + 1}`}>
              <img src={photo.src} alt={photo.alt} loading="lazy" />
              <figcaption className="md-photos__tag">{photo.tag}</figcaption>
            </figure>
          ))}
          <p className="md-photos__caption">
            {isSw ? 'Harusi halisi kutoka Tanzania nzima' : 'Real celebrations from across Tanzania'}
          </p>
        </div>
      </div>
    </section>
  );
}
