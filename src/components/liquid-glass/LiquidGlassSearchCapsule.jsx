import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Search, Sparkles, MapPin, Calendar, ChevronDown, Check } from 'lucide-react';
import LiquidGlassButton from './LiquidGlassButton';

export default function LiquidGlassSearchCapsule({ onSearch }) {
  const navigate = useNavigate();
  const { t, language } = useAppContext();

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('all');
  const [region, setRegion] = useState('all');
  const [openDropdown, setOpenDropdown] = useState(null); // 'cat' | 'reg' | null

  const CATEGORIES = [
    { id: 'all', label: language === 'sw' ? 'Kategoria Zote' : 'All Categories' },
    { id: 'kumbi', label: language === 'sw' ? 'Kumbi na Bustani' : 'Venues & Halls' },
    { id: 'wapambaji', label: language === 'sw' ? 'Wapambaji & Maua' : 'Decor & Floral' },
    { id: 'entertainment', label: language === 'sw' ? 'Muziki, DJ na MC' : 'Music & MC' },
    { id: 'catering', label: language === 'sw' ? 'Vyakula na Vinywaji' : 'Catering & Drinks' },
    { id: 'picha', label: language === 'sw' ? 'Picha na Video' : 'Photo & Video' },
    { id: 'saluni', label: language === 'sw' ? 'Saluni na Urembo' : 'Bridal Glam & Beauty' }
  ];

  const REGIONS = [
    { id: 'all', label: language === 'sw' ? 'Tanzania Nzima' : 'All Regions (Tanzania)' },
    { id: 'dar', label: 'Dar es Salaam' },
    { id: 'znz', label: 'Zanzibar' },
    { id: 'arusha', label: 'Arusha' },
    { id: 'mwanza', label: 'Mwanza' },
    { id: 'dodoma', label: 'Dodoma' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ keyword, category, region });
    } else {
      const params = new URLSearchParams();
      if (keyword.trim()) params.append('q', keyword.trim());
      if (category !== 'all') params.append('category', category);
      if (region !== 'all') params.append('region', region);
      navigate(`/marketplace?${params.toString()}`);
    }
  };

  const currentCatLabel = CATEGORIES.find(c => c.id === category)?.label || 'All Categories';
  const currentRegLabel = REGIONS.find(r => r.id === region)?.label || 'All Regions';

  return (
    <form className="lg-search-instrument" onSubmit={handleSubmit} role="search">
      {/* 1. Keyword search input */}
      <div className="lg-search-slot lg-search-slot-grow">
        <Search size={18} color="var(--color-primary, #0071E3)" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t('hero_search_input_placeholder', 'Search venue, decorator, MC, cake...')}
          aria-label={language === 'sw' ? 'Tafuta maneno muhimu' : 'Search keywords'}
        />
      </div>

      {/* 2. Category Dropdown Trigger */}
      <div
        className={`lg-search-slot ${openDropdown === 'cat' ? 'is-active' : ''}`}
        onClick={() => setOpenDropdown(openDropdown === 'cat' ? null : 'cat')}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        role="button"
        tabIndex={0}
      >
        <Sparkles size={16} color="var(--color-primary, #0071E3)" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--app-text-muted, #64748B)' }}>
            {t('nav_categories', 'Category')}
          </span>
          <span style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--app-text-primary, #0F172A)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentCatLabel}
          </span>
        </div>
        <ChevronDown size={14} color="var(--app-text-muted, #64748B)" />

        {/* Category Dropdown Menu */}
        {openDropdown === 'cat' && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              left: 0,
              width: '260px',
              borderRadius: '20px',
              background: 'var(--app-surface-elevated, rgba(255, 252, 247, 0.95))',
              border: '1px solid var(--app-border, rgba(168, 101, 62, 0.2))',
              boxShadow: '0 16px 36px -4px rgba(84, 50, 29, 0.2), inset 0 1px 1px rgba(255,255,255,0.9)',
              padding: '0.5rem',
              zIndex: 200
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategory(c.id);
                  setOpenDropdown(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  border: 'none',
                  background: category === c.id ? 'rgba(0, 102, 238, 0.12)' : 'transparent',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  color: category === c.id ? 'var(--color-primary, #0071E3)' : 'var(--app-text-primary, #0F172A)',
                  fontWeight: category === c.id ? 700 : 500,
                  fontSize: '0.85rem',
                  textAlign: 'left'
                }}
              >
                <span>{c.label}</span>
                {category === c.id && <Check size={14} color="var(--color-primary, #0071E3)" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Location Dropdown Trigger */}
      <div
        className={`lg-search-slot ${openDropdown === 'reg' ? 'is-active' : ''}`}
        onClick={() => setOpenDropdown(openDropdown === 'reg' ? null : 'reg')}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        role="button"
        tabIndex={0}
      >
        <MapPin size={16} color="var(--color-primary, #0071E3)" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
            {language === 'sw' ? 'Mkoa' : 'Region'}
          </span>
          <span style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#1e1b4b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentRegLabel}
          </span>
        </div>
        <ChevronDown size={14} color="#64748b" />

        {/* Region Dropdown Menu */}
        {openDropdown === 'reg' && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              left: 0,
              width: '240px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 16px 36px -4px rgba(30, 20, 60, 0.2), inset 0 1px 1px #fff',
              padding: '0.5rem',
              zIndex: 200
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {REGIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRegion(r.id);
                  setOpenDropdown(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  border: 'none',
                  background: region === r.id ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  color: region === r.id ? '#0891b2' : '#1e1b4b',
                  fontWeight: region === r.id ? 700 : 500,
                  fontSize: '0.85rem',
                  textAlign: 'left'
                }}
              >
                <span>{r.label}</span>
                {region === r.id && <Check size={14} color="#0891b2" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. The Action Button: Optical Violet Glass */}
      <LiquidGlassButton
        type="submit"
        variant="primary"
        icon={<Search size={16} />}
        style={{ padding: '0.75rem 1.8rem', whiteSpace: 'nowrap' }}
      >
        {language === 'sw' ? 'Tafuta' : 'Search'}
      </LiquidGlassButton>
    </form>
  );
}
