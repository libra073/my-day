import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProviderCard from '../components/ProviderCard';
import {
  Search, X, Sparkles, MapPin, SlidersHorizontal, ArrowUpDown,
  Building2, Palette, Music, UtensilsCrossed, Scissors, Car,
  ShieldCheck, Check, RotateCcw, Wallet, Star
} from 'lucide-react';

export default function MarketplacePage() {
  const { providers, t, language } = useAppContext();
  const isSw = language === 'sw';
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || searchParams.get('query') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || searchParams.get('cat') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('region') || 'All Locations');
  const [priceTier, setPriceTier] = useState('all'); // 'all' | 'under-15m' | '15m-3m' | 'above-3m'
  const [sortBy, setSortBy] = useState('recommended');

  const CATEGORIES = [
    { id: '', name: isSw ? 'Makundi Yote' : 'All Categories', icon: '✨', short: 'All' },
    { id: 'kumbi', name: isSw ? 'Kumbi – Venues' : 'Kumbi – Venues', icon: '🏰', short: 'Venues' },
    { id: 'wapambaji', name: isSw ? 'Wapambaji – Mapambo' : 'Wapambaji – Decorators', icon: '🎨', short: 'Decorators' },
    { id: 'entertainment', name: isSw ? 'MCs & Burudani' : 'MCs & Entertainment', icon: '🎤', short: 'MCs & Music' },
    { id: 'catering', name: isSw ? 'Chakula & Vinywaji' : 'Catering & Food', icon: '🍽️', short: 'Catering' },
    { id: 'saloon', name: isSw ? 'Saluni & Urembo' : 'Saloon & Beauty', icon: '💇', short: 'Saloon' },
    { id: 'transport', name: isSw ? 'Usafiri & Magari' : 'Transport & Luxury Cars', icon: '🚗', short: 'Transport' },
  ];

  const LOCATIONS = [
    { id: 'All Locations', label: isSw ? 'Mikoa Yote' : 'All Regions' },
    { id: 'Dar es Salaam', label: 'Dar es Salaam' },
    { id: 'Arusha', label: 'Arusha' },
    { id: 'Mwanza', label: 'Mwanza' },
    { id: 'Zanzibar', label: 'Zanzibar' },
    { id: 'Dodoma', label: 'Dodoma' }
  ];

  const PRICE_TIERS = [
    { id: 'all', label: isSw ? 'Bei Zote' : 'All Budgets' },
    { id: 'under-15m', label: isSw ? '< TSh 1.5M' : '< TSh 1.5M' },
    { id: '15m-3m', label: 'TSh 1.5M – 3M' },
    { id: 'above-3m', label: isSw ? '> TSh 3M' : '> TSh 3M' }
  ];

  // Helper to get vendor price
  const getVendorBasePrice = (p) => {
    return p.pricePerDay || p.pricePerEvent || (p.pricePerPerson ? p.pricePerPerson * 200 : null) || (p.packages && p.packages[0] ? p.packages[0].price : 1500000);
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { '': providers.length };
    CATEGORIES.forEach(c => {
      if (c.id) {
        counts[c.id] = providers.filter(p => p.category === c.id).length;
      }
    });
    return counts;
  }, [providers]);

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    const params = {};
    if (catId) params.category = catId;
    if (searchTerm) params.q = searchTerm;
    if (selectedLocation !== 'All Locations') params.region = selectedLocation;
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (activeCategory) params.category = activeCategory;
    if (searchTerm) params.q = searchTerm;
    if (selectedLocation !== 'All Locations') params.region = selectedLocation;
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setActiveCategory('');
    setSearchTerm('');
    setSelectedLocation('All Locations');
    setPriceTier('all');
    setSortBy('recommended');
    setSearchParams({});
  };

  const hasActiveFilters = activeCategory !== '' || searchTerm.trim() !== '' || selectedLocation !== 'All Locations' || priceTier !== 'all';

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

      // Price tier matching
      let matchesPrice = true;
      const price = getVendorBasePrice(p);
      if (priceTier === 'under-15m') {
        matchesPrice = price < 1500000;
      } else if (priceTier === '15m-3m') {
        matchesPrice = price >= 1500000 && price <= 3000000;
      } else if (priceTier === 'above-3m') {
        matchesPrice = price > 3000000;
      }

      return matchesCategory && matchesLocation && matchesSearch && matchesPrice;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => getVendorBasePrice(a) - getVendorBasePrice(b));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => getVendorBasePrice(b) - getVendorBasePrice(a));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [providers, activeCategory, selectedLocation, searchTerm, priceTier, sortBy]);

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 6.5rem' }}>
      {/* Top Hero Section with ample clearance */}
      <div className="mkt-hero">
        <div className="mkt-badge">
          <Sparkles size={14} color="#D97706" />
          {t('verified_directory', "Verified Tanzania Wedding Directory")}
        </div>

        <h1 className="mkt-title">
          {t('explore_vendors', "Explore Wedding Services & Verified Vendors")}
        </h1>

        <p className="mkt-sub">
          {isSw
            ? "Gundua, linganisha vifurushi vya harusi, hakiki halisi za wateja, kagua upatikanaji wa tarehe, na uweke akiba kwa dhamana ya malipo ya awali ya 30%."
            : "Discover, compare packages, verify real customer reviews, check date availability, and reserve with 30% deposit guarantee across Tanzania."}
        </p>

        {/* Trust Badges Bar */}
        <div className="mkt-trust-bar">
          <span className="mkt-trust-item">
            <ShieldCheck size={16} color="#16A34A" /> {isSw ? 'Watoa Huduma Waliothibitishwa' : '100% Verified Partners'}
          </span>
          <span style={{ color: '#E5D7C7' }}>•</span>
          <span className="mkt-trust-item">
            <Wallet size={16} color="#D97706" /> {isSw ? 'Amana ya 30% Imelindwa' : 'Protected 30% Escrow'}
          </span>
          <span style={{ color: '#E5D7C7' }}>•</span>
          <span className="mkt-trust-item">
            <Star size={16} color="#F5A623" fill="#F5A623" /> {isSw ? 'Ukadiriaji wa Nyota 4.9' : '4.9★ Average Rating'}
          </span>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="mkt-categories-bar" role="tablist" aria-label="Wedding service categories">
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          const count = categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleCategorySelect(cat.id)}
              className={`mkt-cat-btn ${isActive ? 'is-active' : ''}`}
            >
              <span className="mkt-cat-icon">{cat.icon}</span>
              <span>{cat.name}</span>
              <span className="mkt-cat-badge">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Main Filter & Search Control Card */}
      <div className="mkt-filter-card">
        <form onSubmit={handleSearchSubmit}>
          <div className="mkt-filter-grid">
            {/* Search Input */}
            <div className="mkt-search-wrap">
              <Search size={18} className="mkt-search-icon" />
              <input
                type="text"
                placeholder={isSw ? "Tafuta jina la mtoa huduma au huduma..." : "Search by vendor name, style or service..."}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    background: 'none',
                    border: 'none',
                    color: '#9C7D64',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Region Dropdown */}
            <div>
              <select
                value={selectedLocation}
                onChange={e => {
                  setSelectedLocation(e.target.value);
                  const params = {};
                  if (activeCategory) params.category = activeCategory;
                  if (searchTerm) params.q = searchTerm;
                  if (e.target.value !== 'All Locations') params.region = e.target.value;
                  setSearchParams(params);
                }}
              >
                {LOCATIONS.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="recommended">{t('sort_recommended', "Sort by: Recommended")}</option>
                <option value="rating">{t('sort_rating', "Sort by: Highest Rated ★")}</option>
                <option value="price-asc">{t('sort_price_asc', "Sort by: Price Low to High")}</option>
                <option value="price-desc">{t('sort_price_desc', "Sort by: Price High to Low")}</option>
              </select>
            </div>

            {/* Filter Submit Button */}
            <button type="submit" className="mkt-filter-btn">
              <SlidersHorizontal size={16} />
              {t('filter_btn', "Filter Vendors")} ({filteredProviders.length})
            </button>
          </div>

          {/* Quick Filter Chips (Regions & Budget Tiers) */}
          <div className="mkt-chips-bar">
            {/* Regions Group */}
            <div className="mkt-chips-group">
              <span className="mkt-chips-label">
                <MapPin size={13} style={{ display: 'inline', marginRight: 3 }} />
                {isSw ? 'Mikoa:' : 'Region:'}
              </span>
              {LOCATIONS.map(loc => (
                <button
                  key={loc.id}
                  type="button"
                  className={`vreg-pill-btn ${selectedLocation === loc.id ? 'is-active' : ''}`}
                  onClick={() => setSelectedLocation(loc.id)}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            {/* Budget Range Group */}
            <div className="mkt-chips-group">
              <span className="mkt-chips-label">
                <Wallet size={13} style={{ display: 'inline', marginRight: 3 }} />
                {isSw ? 'Kiwango cha Bei:' : 'Budget:'}
              </span>
              {PRICE_TIERS.map(pt => (
                <button
                  key={pt.id}
                  type="button"
                  className={`vreg-pill-btn ${priceTier === pt.id ? 'is-active' : ''}`}
                  onClick={() => setPriceTier(pt.id)}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Results Header & Active Filter Summary */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div>
          <h2 style={{
            fontSize: '1.4rem',
            color: '#1E130B',
            fontWeight: 850,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            {t('available_providers', "Available Service Providers")}
            <span style={{
              fontSize: '0.86rem',
              fontWeight: 800,
              color: '#92400E',
              background: '#FEF3C7',
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              border: '1px solid rgba(245, 166, 35, 0.35)'
            }}>
              {filteredProviders.length} {t('listings_found', "listings found")}
            </span>
          </h2>

          {hasActiveFilters && (
            <div style={{ fontSize: '0.84rem', color: '#7A6657', marginTop: '0.35rem' }}>
              {isSw ? 'Chujio lililowekwa:' : 'Filtered by:'}{' '}
              {activeCategory && <strong>{CATEGORIES.find(c => c.id === activeCategory)?.name} </strong>}
              {selectedLocation !== 'All Locations' && <span>• {selectedLocation} </span>}
              {priceTier !== 'all' && <span>• {PRICE_TIERS.find(p => p.id === priceTier)?.label} </span>}
              {searchTerm && <span>• "{searchTerm}" </span>}
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.84rem',
              fontWeight: 750,
              color: '#D97706',
              background: '#FFF8EE',
              border: '1px solid rgba(245, 166, 35, 0.4)',
              padding: '0.45rem 0.95rem',
              borderRadius: '999px',
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
          >
            <RotateCcw size={14} />
            {t('reset_filters', "Reset All Filters")}
          </button>
        )}
      </div>

      {/* Vendor Cards Grid */}
      {filteredProviders.length === 0 ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '4.5rem 2rem',
          textAlign: 'center',
          border: '1.5px dashed #E8DCCF',
          boxShadow: '0 10px 30px rgba(61, 44, 31, 0.05)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            fontSize: '2rem'
          }}>
            🔍
          </div>
          <h3 style={{ fontSize: '1.45rem', color: '#1E130B', marginBottom: '0.6rem', fontWeight: 850 }}>
            {t('no_vendors_match', "No vendors matched your search")}
          </h3>
          <p style={{ color: '#7A6657', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            {t('try_clearing', "Try clearing keyword filters or selecting a different service category.")}
          </p>
          <button
            onClick={handleResetFilters}
            className="mkt-filter-btn"
            style={{ margin: '0 auto' }}
          >
            <RotateCcw size={16} />
            {t('reset_filters', "Reset All Filters")}
          </button>
        </div>
      ) : (
        <div className="mkt-grid">
          {filteredProviders.map(provider => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}
