import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProviderCard from '../components/ProviderCard';
import { Search, X, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { id: '', name: 'All Categories', icon: '✨' },
  { id: 'kumbi', name: 'Kumbi (Venues)', icon: '🏰' },
  { id: 'wapambaji', name: 'Wapambaji (Decorators)', icon: '🎨' },
  { id: 'entertainment', name: 'MCs & Entertainment', icon: '🎤' },
  { id: 'catering', name: 'Catering', icon: '🍽️' },
  { id: 'saloon', name: 'Saloon & Beauty', icon: '💇' },
  { id: 'transport', name: 'Transport', icon: '🚗' },
];

const LOCATIONS = ['All Locations', 'Dar es Salaam', 'Arusha', 'Mwanza', 'Zanzibar'];

function MarketplacePage() {
  const { providers } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'price-asc' | 'price-desc' | 'rating'

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

    // Sorting logic
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
    <div className="container py-8">
      {/* Header Banner */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary-dark)',
          padding: '0.35rem 0.9rem',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '0.75rem',
          border: '1px solid rgba(212, 175, 55, 0.3)'
        }}>
          <Sparkles size={14} /> Verified Tanzania Wedding Directory
        </div>

        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-dark)', marginBottom: '0.5rem' }}>
          Explore Wedding Service Professionals
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
          Discover, compare packages, verify real customer reviews, check date availability, and reserve with 30% deposit guarantee.
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
                background: isActive ? 'var(--color-dark)' : '#ffffff',
                color: isActive ? '#ffffff' : 'var(--color-text)',
                border: isActive ? '1px solid var(--color-dark)' : '1px solid var(--color-border)',
                padding: '0.55rem 1.1rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                whiteSpace: 'nowrap',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '2rem'
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Keyword Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#999" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search vendor name, location..."
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
                  color: '#999',
                  padding: 0,
                  boxShadow: 'none'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Location Filter Dropdown */}
          <div>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
            >
              {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="recommended">Sort by: Recommended</option>
              <option value="rating">Sort by: Highest Rated ★</option>
              <option value="price-asc">Sort by: Price Low to High</option>
              <option value="price-desc">Sort by: Price High to Low</option>
            </select>
          </div>

          {/* Submit Search button */}
          <button
            type="submit"
            style={{
              background: 'var(--color-primary)',
              color: '#ffffff',
              fontWeight: 700,
              padding: '0.7rem'
            }}
          >
            Filter Vendors ({filteredProviders.length})
          </button>
        </form>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--color-dark)' }}>
          Available Service Providers <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>({filteredProviders.length} listings found)</span>
        </h2>
      </div>

      {/* Vendor Cards Grid */}
      {filteredProviders.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '4rem 2rem',
          textAlign: 'center',
          border: '1px dashed var(--color-border)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-dark)', marginBottom: '0.5rem' }}>No vendors matched your search</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Try clearing keyword filters or selecting a different service category.</p>
          <button
            onClick={() => {
              setActiveCategory('');
              setSearchTerm('');
              setSelectedLocation('All Locations');
              setSearchParams({});
            }}
            className="button button-outline"
          >
            Reset All Filters
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
