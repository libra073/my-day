import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Search, MapPin, Calendar, ChevronRight, 
  Building2, Palette, Music, UtensilsCrossed, Scissors, Car, 
  ShieldCheck, Star, Heart
} from 'lucide-react';

export default function ModernHero() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [eventDate, setEventDate] = useState('');

  const CATEGORY_OPTIONS = [
    { id: 'all', label: 'All Categories', icon: Sparkles },
    { id: 'kumbi', label: 'Venues (Kumbi)', icon: Building2 },
    { id: 'wapambaji', label: 'Decorators (Wapambaji)', icon: Palette },
    { id: 'entertainment', label: 'MCs & Music', icon: Music },
    { id: 'catering', label: 'Catering', icon: UtensilsCrossed },
    { id: 'saloon', label: 'Saloon & Beauty', icon: Scissors },
    { id: 'transport', label: 'Bridal Transport', icon: Car },
  ];

  const REGION_OPTIONS = [
    'Dar es Salaam', 'Arusha', 'Dodoma', 'Zanzibar', 'Mwanza', 'Kilimanjaro', 'Tanga'
  ];

  const POPULAR_TAGS = [
    'Beach Venues in Zanzibar', 'Luxury Decorators', 'Dar es Salaam MCs', 'Garden Venues in Arusha', 'Swahili Catering'
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/marketplace?query=${encodeURIComponent(searchQuery)}&cat=${selectedCategory}&region=${selectedRegion}&date=${eventDate}`);
  };

  return (
    <section style={{
      background: 'var(--color-hero-gradient)',
      color: '#FFFFFF',
      padding: '5.5rem 1.25rem 7rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Ambient Glowing Orbs */}
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

      <div className="container" style={{ maxWidth: '1080px', position: 'relative', zIndex: 2, textAlign: 'center' }}>
        
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
            <span>Tanzania’s #1 All-in-One Wedding & Event Platform</span>
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
            <span>✨ Ask MY DAY AI</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Main Hero Headline */}
        <h1 style={{
          fontSize: '3.8rem',
          fontFamily: 'var(--font-header)',
          fontWeight: 900,
          lineHeight: 1.12,
          letterSpacing: '-0.025em',
          marginBottom: '1.4rem',
          color: '#FFFFFF'
        }}>
          Everything You Need for Your <br />
          <span className="gradient-text-amber">Perfect Wedding Day</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.2rem',
          color: 'rgba(255, 255, 255, 0.88)',
          maxWidth: '780px',
          margin: '0 auto 3rem',
          lineHeight: 1.65,
          fontWeight: 500
        }}>
          Book Tanzania’s top verified venues, decorators, MCs, catering, and bridal services with instant availability checking & secure mobile payment.
        </p>

        {/* Multi-Field Glassmorphic Search Bar */}
        <form 
          onSubmit={handleSearchSubmit}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '28px',
            padding: '0.75rem',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            maxWidth: '980px',
            margin: '0 auto 1.75rem'
          }}
        >
          {/* Keyword Search Input */}
          <div style={{ 
            flex: '2 1 240px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem',
            padding: '0.5rem 0.85rem'
          }}>
            <Search size={22} color="#5C4331" />
            <input 
              type="text" 
              placeholder="Search venues, MCs, decor, catering..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.95rem',
                color: 'var(--color-text)',
                width: '100%',
                fontWeight: 600,
                padding: 0
              }}
            />
          </div>

          {/* Category Dropdown */}
          <div style={{ 
            flex: '1 1 160px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 0.5rem'
          }}>
            <Sparkles size={18} color="#F5A623" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
                padding: 0
              }}
            >
              {CATEGORY_OPTIONS.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div style={{ width: 1, height: 32, background: '#E8DCCF' }} />

          {/* Region Dropdown */}
          <div style={{ 
            flex: '1 1 160px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 0.5rem'
          }}>
            <MapPin size={18} color="#F5A623" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
                padding: 0
              }}
            >
              <option value="all">All Regions</option>
              {REGION_OPTIONS.map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>

          <div style={{ width: 1, height: 32, background: '#E8DCCF' }} />

          {/* Event Date Picker */}
          <div style={{ 
            flex: '1 1 150px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 0.5rem'
          }}>
            <Calendar size={18} color="#F5A623" />
            <input 
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.85rem',
                color: 'var(--color-text)',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
                padding: 0
              }}
            />
          </div>

          {/* Search Button */}
          <button 
            type="submit"
            className="btn-pill-amber"
            style={{
              padding: '0.95rem 2.2rem',
              fontSize: '1rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '22px'
            }}
          >
            Search Vendors <ChevronRight size={18} />
          </button>
        </form>

        {/* Popular Tags / Quick Filter Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.6rem',
          fontSize: '0.82rem',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          <span style={{ fontWeight: 700, color: '#F5A623' }}>Popular searches:</span>
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
                padding: '0.3rem 0.85rem',
                fontSize: '0.78rem',
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
          marginTop: '3.5rem',
          flexWrap: 'wrap',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          paddingTop: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Star size={20} color="#F5A623" fill="#F5A623" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#FFFFFF' }}>4.9 / 5.0</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Over 5,000 Verified Reviews</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={22} color="#F5A623" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#FFFFFF' }}>100% Mobile Money</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Protected Escrow Deposit</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Heart size={20} color="#F5A623" fill="#F5A623" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#FFFFFF' }}>250+ Top Vendors</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Across All Tanzania Regions</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
