import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProviderCard from '../components/ProviderCard';
import { Search, X, Sparkles } from 'lucide-react';

function MarketplacePage() {
  const { providers, t } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortBy, setSortBy] = useState('recommended');

  const CATEGORIES = [
    { id: '', name: t('all_categories'), icon: '✨' },
    { id: 'kumbi', name: t('cat_venues_title'), icon: '🏰' },
    { id: 'wapambaji', name: t('cat_decorators_title'), icon: '🎨' },
    { id: 'entertainment', name: t('cat_entertainment_title'), icon: '🎤' },
    { id: 'catering', name: t('cat_catering_title'), icon: '🍽️' },
    { id: 'saloon', name: t('cat_saloon_title'), icon: '💇' },
    { id: 'transport', name: t('cat_transport_title'), icon: '🚗' },
  ];

  const LOCATIONS = [
    { id: 'All Locations', label: t('all_locations') },
    { id: 'Dar es Salaam', label: t('dar_es_salaam') },
    { id: 'Arusha', label: t('arusha') },
    { id: 'Mwanza', label: t('mwanza') },
    { id: 'Zanzibar', label: t('zanzibar') }
  ];

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    const params = {};
    if (catId) params.category = catId;
    if (searchTerm) params.q = searchTerm;
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (activeCategory) params.category = activeCategory;
    if (searchTerm) params.q = searchTerm;
    setSearchParams(params);
  };

  const filteredProviders = useMemo(() => {
    let result = providers.filter(p => {
      const matchesCategory = activeCategory ? p.category === activeCategory : true;
      const matchesLocation = selectedLocation !== 'All Locations'
        ? (p.location && p.location.toLowerCase().includes(selectedLocation.toLowerCase()))
        : true;
      const matchesSearch = searchTerm
        ? (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.description?.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
      return matchesCategory && matchesLocation && matchesSearch;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.pricePerDay || a.pricePerPerson || a.pricePerEvent || 0) - (b.pricePerDay || b.pricePerPerson || b.pricePerEvent || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.pricePerDay || b.pricePerPerson || b.pricePerEvent || 0) - (a.pricePerDay || a.pricePerPerson || a.pricePerEvent || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [providers, activeCategory, selectedLocation, searchTerm, sortBy]);

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: '#FFFFFF',
          color: 'var(--color-accent)',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '0.75rem',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <Sparkles size={14} color="var(--color-primary)" /> {t('verified_directory')}
        </div>

        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-text)', marginBottom: '0.5rem', fontWeight: 800 }}>
          {t('explore_vendors')}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
          {t('nav_browse') === 'Tafuta Huduma'
            ? 'Gundua, linganisha vifurushi, thibitisha hakiki halisi za wateja, kagua upatikanaji wa tarehe, na uweke akiba kwa dhamana ya malipo ya awali ya 30%.'
            : 'Discover, compare packages, verify real customer reviews, check date availability, and reserve with 30% deposit guarantee.'}
        </p>
      </div>

      {/* Category Pill Filters */}
      <div style={{
        display: 'flex',
        gap: '0.6rem',
        overflowX: 'auto',
        paddingBottom: '0.75rem',
        marginBottom: '1.75rem',
        scrollSnapType: 'x mandatory'
      }}>
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              style={{
                background: isActive ? 'var(--color-primary)' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : 'var(--color-text)',
                border: isActive ? '1px solid transparent' : '1px solid var(--color-border)',
                padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 800 : 600,
                whiteSpace: 'nowrap',
                boxShadow: isActive ? 'var(--shadow-glow)' : 'var(--shadow-xs)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              <span style={{ marginRight: '0.25rem' }}>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls Bar */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '2rem'
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--color-text-dim)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-dim)',
                  padding: 0,
                  boxShadow: 'none'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div>
            <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}>
              {LOCATIONS.map(loc => <option key={loc.id} value={loc.id}>{loc.label}</option>)}
            </select>
          </div>

          <div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="recommended">{t('sort_recommended')}</option>
              <option value="rating">{t('sort_rating')}</option>
              <option value="price-asc">{t('sort_price_asc')}</option>
              <option value="price-desc">{t('sort_price_desc')}</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              fontWeight: 700,
              padding: '0.75rem',
              boxShadow: 'var(--shadow-glow)',
              borderRadius: 'var(--radius-pill)',
            }}
          >
            {t('filter_btn')} ({filteredProviders.length})
          </button>
        </form>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text)', fontWeight: 800 }}>
          {t('available_providers')} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>({filteredProviders.length} {t('listings_found')})</span>
        </h2>
      </div>

      {/* Vendor Cards Grid */}
      {filteredProviders.length === 0 ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '4rem 2rem',
          textAlign: 'center',
          border: '1px dashed var(--color-border)',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-text)', marginBottom: '0.5rem', fontWeight: 700 }}>{t('no_vendors_match')}</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{t('try_clearing')}</p>
          <button
            onClick={() => {
              setActiveCategory('');
              setSearchTerm('');
              setSelectedLocation('All Locations');
              setSearchParams({});
            }}
            className="button button-outline"
          >
            {t('reset_filters')}
          </button>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {filteredProviders.map(provider => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MarketplacePage;
