import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Sparkles, Search, Plus, ArrowUpRight, Check, Compass, Sliders, Eye,
  ShieldCheck, Heart, MapPin, Calendar, Star, Building2, Palette, Music, UtensilsCrossed, ChevronRight
} from 'lucide-react';
import LiquidGlassFilterDefs from './LiquidGlassFilterDefs';
import LiquidGlassButton from './LiquidGlassButton';
import LiquidGlassNav from './LiquidGlassNav';
import LiquidGlassSearchCapsule from './LiquidGlassSearchCapsule';
import LiquidGlassAIAssistant from './LiquidGlassAIAssistant';

export default function LiquidGlassPrototype() {
  const navigate = useNavigate();
  const { language, t } = useAppContext();
  
  // Interactive prototype view modes: 'kit' | 'hero'
  const [viewMode, setViewMode] = useState('hero'); 
  const [activeTab, setActiveTab] = useState('Toast');
  const [lightPos, setLightPos] = useState({ x: 30, y: 18 });

  // Update light coordinates based on mouse movement for live optical specular reflection
  useEffect(() => {
    const handlePointerMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--lg-light-x', `${x.toFixed(1)}%`);
      document.documentElement.style.setProperty('--lg-light-y', `${y.toFixed(1)}%`);
      setLightPos({ x: Math.round(x), y: Math.round(y) });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  return (
    <div className="lg-optical-studio" style={{ paddingBottom: '6rem' }}>
      <LiquidGlassFilterDefs />
      
      {/* Dynamic light spotlight tracking the pointer */}
      <div className="lg-studio-spotlight" aria-hidden="true" />

      {/* Floating prototype mode switch pill */}
      <div style={{
        position: 'relative',
        zIndex: 1100,
        maxWidth: '1240px',
        margin: '12px auto 0',
        padding: '0 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          borderRadius: '999px',
          background: 'rgba(255, 255, 255, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 4px 12px rgba(30, 20, 60, 0.08)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981',
            display: 'inline-block'
          }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e1b4b', letterSpacing: '0.02em' }}>
            APPLE iOS 26/27 LIQUID GLASS PROTOTYPE
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            (Light: {lightPos.x}%, {lightPos.y}%)
          </span>
        </div>

        {/* View mode toggle */}
        <div className="lg-segmented-glass-tray">
          <button
            type="button"
            className={`lg-segment-btn ${viewMode === 'hero' ? 'is-active' : ''}`}
            onClick={() => setViewMode('hero')}
          >
            {language === 'sw' ? 'MY DAY Mwonekano' : 'MY DAY Integrated'}
          </button>
          <button
            type="button"
            className={`lg-segment-btn ${viewMode === 'kit' ? 'is-active' : ''}`}
            onClick={() => setViewMode('kit')}
          >
            {language === 'sw' ? 'UI Kit Rejeleo' : 'Apple Glass UI Kit'}
          </button>
        </div>
      </div>

      {/* 1. FLOATING NAVIGATION ASSEMBLY */}
      <LiquidGlassNav />

      {/* MAIN CONTAINER */}
      <div style={{ maxWidth: '1240px', margin: '2rem auto 0', padding: '0 1rem', position: 'relative', zIndex: 10 }}>
        {viewMode === 'hero' ? (
          /* =========================================================================
             VIEW MODE 1: MY DAY INTEGRATED LIQUID GLASS HERO
             ========================================================================= */
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            {/* Trust badge capsule */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 1.1rem',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 6px 18px -4px rgba(0, 102, 238, 0.15), inset 0 1px 1px #ffffff',
              marginBottom: '1.5rem'
            }}>
              <ShieldCheck size={16} color="var(--color-primary, #0071E3)" />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--app-text-primary, #0F172A)' }}>
                {t('hero_badge', '100% Verified Vendors & Escrow Protection in Tanzania')}
              </span>
            </div>

            {/* Atmospheric Hero Headline */}
            <h1 style={{
              fontSize: 'clamp(2.4rem, 5.2vw, 4.4rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.035em',
              color: 'var(--app-text-primary, #0F172A)',
              maxWidth: '920px',
              margin: '0 auto 1.25rem'
            }}>
              {language === 'sw' ? (
                <>Panga Sherehe Yako ya Ndoto Kupitia <span style={{ color: 'var(--color-primary, #0071E3)' }}>Liquid Glass ya Kisasa</span></>
              ) : (
                <>Curate Your Unforgettable Wedding in <span style={{
                  background: 'var(--p3d-grad-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Pure Optical Glass</span></>
              )}
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#475569',
              maxWidth: '700px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.6,
              fontWeight: 450
            }}>
              {t('hero_subtitle', 'Browse vetted venues, master decorators, live musicians, and bespoke catering across Tanzania with instant transparent pricing.')}
            </p>

            {/* 3. OPTICAL SEARCH CAPSULE INSTRUMENT */}
            <LiquidGlassSearchCapsule />

            {/* 2. PRIMARY & SECONDARY GLASS BUTTON DEMONSTRATION */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap',
              marginTop: '2.5rem'
            }}>
              <LiquidGlassButton
                variant="primary"
                onClick={() => navigate('/planner')}
                icon={<Sparkles size={17} />}
              >
                {t('ask_myday_ai', 'Ask MY DAY AI Planner')}
              </LiquidGlassButton>

              <LiquidGlassButton
                variant="secondary"
                onClick={() => navigate('/marketplace')}
                icon={<Compass size={17} />}
              >
                {t('nav_browse', 'Explore Vendors')}
              </LiquidGlassButton>

              <LiquidGlassButton
                variant="bubble"
                onClick={() => navigate('/marketplace')}
                title="Quick Compass"
                icon={<ArrowUpRight size={20} color="#1e1b4b" strokeWidth={2.4} />}
              />
            </div>

            {/* FEATURED GLASS TILES (Transparent Floating Cards) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginTop: '4rem',
              textAlign: 'left'
            }}>
              {/* Card 1: Venues */}
              <div className="lg-glass-slab" style={{ padding: '1.6rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '16px',
                  background: 'var(--p3d-grad-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 8px 18px -4px rgba(0, 102, 238, 0.45)',
                  marginBottom: '1rem'
                }}>
                  <Building2 size={22} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 750, color: '#0f172a', margin: '0 0 0.4rem' }}>
                  {language === 'sw' ? 'Kumbi na Bustani' : 'Venues & Ballrooms'}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
                  {language === 'sw' ? 'Kumbi za kifahari kuanzia bichi za Zanzibar hadi Arusha' : 'Luxury beach resorts, scenic gardens and grand ballrooms.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="lg-pill-insert" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                    140+ Available
                  </span>
                  <LiquidGlassButton variant="bubble" onClick={() => navigate('/marketplace?category=kumbi')}>
                    <ChevronRight size={18} />
                  </LiquidGlassButton>
                </div>
              </div>

              {/* Card 2: Decor */}
              <div className="lg-glass-slab" style={{ padding: '1.6rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #F9DEC4 0%, #DFA371 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6E3C1B',
                  boxShadow: '0 8px 18px -4px rgba(223, 163, 113, 0.45)',
                  marginBottom: '1rem'
                }}>
                  <Palette size={22} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 750, color: '#0f172a', margin: '0 0 0.4rem' }}>
                  {language === 'sw' ? 'Wapambaji & Maua' : 'Decor & Floral'}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
                  {language === 'sw' ? 'Mapambo ya kisasa, maua safi na meza za kifalme' : 'Transform your celebration with bespoke floral arches and theme decor.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="lg-pill-insert" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                    95+ Designers
                  </span>
                  <LiquidGlassButton variant="bubble" onClick={() => navigate('/marketplace?category=wapambaji')}>
                    <ChevronRight size={18} />
                  </LiquidGlassButton>
                </div>
              </div>

              {/* Card 3: Iridescent Sunset Modern Glass Card (Matches Reference) */}
              <div className="lg-card-iridescent-sunset">
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-primary, #0071E3)',
                  display: 'block',
                  marginBottom: '0.4rem'
                }}>
                  Interactive AI Assistant
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--app-text-primary, #0F172A)', margin: '0 0 0.4rem' }}>
                  Modern Glass Wedding AI
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--app-text-secondary, #475569)', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
                  Calculate budgets, discover matched vendors, and generate timelines instantly.
                </p>
                <LiquidGlassButton
                  variant="pill"
                  onClick={() => navigate('/planner')}
                  icon={<ArrowUpRight size={15} color="var(--color-primary, #0071E3)" />}
                >
                  Launch AI Planner
                </LiquidGlassButton>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             VIEW MODE 2: UI KIT REFERENCE RECONSTRUCTION (MATCHES USER IMAGE 1:1)
             ========================================================================= */
          <div style={{ margin: '1rem auto', maxWidth: '780px' }}>
            {/* The Outer Clear Liquid Glass Mother Slab */}
            <div className="lg-glass-slab" style={{ padding: '2.5rem 2.8rem' }}>
              {/* Slab Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
                paddingBottom: '1.25rem',
                marginBottom: '2rem'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e1b4b', margin: 0, letterSpacing: '-0.02em' }}>
                    Liquid Glass UI Kit
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                    iOS 26/27 Physical Optical Simulation
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.9)',
                    fontSize: '0.75rem',
                    color: '#64748b',
                    boxShadow: 'inset 0 1px 1px #fff'
                  }}>
                    ◎
                  </span>
                  <span style={{
                    width: '20px',
                    height: '3px',
                    borderRadius: '2px',
                    background: 'rgba(100, 116, 139, 0.5)'
                  }} />
                </div>
              </div>

              {/* Grid of Components matching User Reference Image */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                {/* Column 1 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* 1. Primary Button */}
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Primary Button
                    </span>
                    <LiquidGlassButton variant="primary" style={{ width: '100%' }}>
                      Primary Button
                    </LiquidGlassButton>
                  </div>

                  {/* 2. Secondary Button */}
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Secondary Button
                    </span>
                    <LiquidGlassButton variant="secondary" style={{ width: '100%' }}>
                      Secondary Button
                    </LiquidGlassButton>
                  </div>

                  {/* 3. Circular Bubble Droplet Buttons */}
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Droplet / Bubble Lens Controls
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* White circular button */}
                      <button
                        type="button"
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #fff',
                          boxShadow: '0 6px 16px rgba(30, 20, 60, 0.12), inset 0 1px 1px #fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={20} color="#1e1b4b" />
                      </button>

                      {/* 3D Glass Bubble Droplet with Arrow */}
                      <LiquidGlassButton variant="bubble">
                        <ArrowUpRight size={22} color="#1e1b4b" strokeWidth={2.5} />
                      </LiquidGlassButton>

                      {/* Pill link: Nitestudio */}
                      <div className="lg-pill-insert" style={{ padding: '0.55rem 1rem' }}>
                        <span>Nitestudio</span>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>⚯</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Whitespace Pill with Checkmark */}
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Glass Status Capsule
                    </span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1.4rem',
                      borderRadius: '999px',
                      background: 'rgba(255, 255, 255, 0.55)',
                      border: '1px solid rgba(255, 255, 255, 0.85)',
                      boxShadow: 'inset 0 1px 2px #fff, 0 4px 12px rgba(30, 20, 60, 0.05)'
                    }}>
                      <span style={{ fontWeight: 650, color: '#1e1b4b', fontSize: '0.92rem' }}>whitespace</span>
                      <Check size={18} color="#10b981" strokeWidth={3} />
                    </div>
                  </div>

                  {/* 5. Toast | Tabs Segmented Control */}
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Segmented Glass Control
                    </span>
                    <div className="lg-segmented-glass-tray" style={{ width: '100%', justifyContent: 'space-between' }}>
                      <button
                        type="button"
                        className={`lg-segment-btn ${activeTab === 'Toast' ? 'is-active' : ''}`}
                        onClick={() => setActiveTab('Toast')}
                        style={{ flex: 1 }}
                      >
                        Toast
                        {activeTab === 'Toast' && <span className="lg-segment-indicator-line" />}
                      </button>
                      <button
                        type="button"
                        className={`lg-segment-btn ${activeTab === 'Tabs' ? 'is-active' : ''}`}
                        onClick={() => setActiveTab('Tabs')}
                        style={{ flex: 1 }}
                      >
                        Tabs
                        {activeTab === 'Tabs' && <span className="lg-segment-indicator-line" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* 1. Upper Glass Search Card with Prismatic Caustics */}
                  <div style={{
                    position: 'relative',
                    padding: '1.4rem',
                    borderRadius: '24px',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.7), rgba(240,245,255,0.4))',
                    border: '1.5px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 16px 36px -6px rgba(30, 20, 60, 0.15), inset 0 2px 2px #fff, 0 14px 28px -4px rgba(6, 182, 212, 0.25)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        background: 'var(--p3d-grad-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        boxShadow: '0 4px 10px rgba(0, 102, 238, 0.3)'
                      }}>
                        ✦
                      </div>
                      <span style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '1.5px solid rgba(168, 101, 62, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary, #0071E3)' }} />
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(255,255,255,0.9)',
                      padding: '0.45rem 0.5rem 0.45rem 1rem',
                      borderRadius: '999px',
                      boxShadow: 'inset 0 1px 1px #fff, 0 2px 8px rgba(30,20,60,0.06)'
                    }}>
                      <input
                        type="text"
                        placeholder="Search projects..."
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
                      />
                      <button
                        type="button"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--p3d-grad-primary)',
                          border: 'none',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(0, 102, 238, 0.4)',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* 2. Create new workspace pill */}
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Search Capsule
                    </span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '999px',
                      background: 'rgba(255,255,255,0.9)',
                      border: '1px solid #fff',
                      boxShadow: '0 4px 12px rgba(30,20,60,0.06)'
                    }}>
                      <span style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 500 }}>Create new workspace</span>
                      <Search size={16} color="#64748b" />
                    </div>
                  </div>

                  {/* 3. Iridescent Sunset Card (Matches Reference Bottom-Right) */}
                  <div className="lg-card-iridescent-sunset">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                      <span style={{
                        width: '24px',
                        height: '14px',
                        borderRadius: '999px',
                        border: '1px solid rgba(255,255,255,0.9)',
                        background: 'rgba(255,255,255,0.3)'
                      }} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e1b4b', margin: '0 0 0.35rem' }}>
                      Modern Glass UI Design
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 1.25rem' }}>
                      Explore more features
                    </p>
                    <LiquidGlassButton
                      variant="pill"
                      icon={<ArrowUpRight size={14} color="var(--color-primary, #0071E3)" />}
                    >
                      Upgrade plan
                    </LiquidGlassButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. FLOATING AI ASSISTANT (Physical Refractive Lens Orb) */}
      <LiquidGlassAIAssistant />
    </div>
  );
}
