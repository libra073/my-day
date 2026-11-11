import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Percent, ShieldCheck, Wallet, Store, CalendarCheck } from 'lucide-react';

function AdminDashboardPage() {
  const { providers, setProviders, bookings, commissionRate, setCommissionRate, language = 'en' } = useAppContext();
  const [activeTab, setActiveTab] = useState('overview');

  const totalPlatformGMV = bookings.reduce((sum, b) => sum + b.price, 0);
  const totalPlatformCommission = Math.round(totalPlatformGMV * commissionRate);
  const totalVendors = providers.length;
  const totalBookingsCount = bookings.length;

  const handleCommissionChange = (e) => { setCommissionRate((parseFloat(e.target.value) || 0) / 100); };
  const handleVerifyProvider = (providerId) => { setProviders(prev => prev.map(p => p.id === providerId ? { ...p, verified: true } : p)); };

  const glassCard = {
    background: 'var(--slab-bg)',
    borderRadius: '26px',
    border: 'var(--slab-border, 1px solid rgba(255, 255, 255, 0.35))',
    boxShadow: 'var(--slab-shadow)',
    backdropFilter: 'blur(24px) saturate(190%)',
    WebkitBackdropFilter: 'blur(28px) saturate(195%)'
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Header Banner - Liquid Glass Superadmin Command */}
      <div className="dash-hero glass-slab glass-reflective-edge" style={{
        ...glassCard,
        color: 'var(--app-text-primary, #0f172a)',
        borderRadius: '28px',
        padding: '2.25rem',
        marginBottom: '2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem'
      }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'var(--puck-bg)',
            color: '#ffffff',
            padding: '0.38rem 0.95rem',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.8rem',
            fontWeight: 800,
            marginBottom: '0.65rem',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            boxShadow: '0 6px 16px -4px rgba(0, 102, 238, 0.45)'
          }}>
            <ShieldCheck size={14} color="#ffffff" /> {language === 'sw' ? 'Kituo Kikuu cha Utawala cha MY DAY' : 'MY DAY Superadmin Command Center'}
          </div>
          <h1 style={{ fontSize: '2.1rem', color: 'var(--app-text-primary)', marginBottom: '0.35rem', fontWeight: 900, letterSpacing: '-0.025em' }}>
            {language === 'sw' ? 'Usimamizi wa Jukwaa & Daftari la Mapato' : 'Platform Governance & Revenue Ledger'}
          </h1>
          <p style={{ color: 'var(--app-text-secondary, #475569)', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {language === 'sw'
              ? 'Simamia kamisheni za jukwaa, thibitisha watoa huduma, na fuatilia miamala ya harusi Tanzania kote.'
              : 'Manage platform commissions, verify service providers, and monitor high-volume transactions across Tanzania.'}
          </p>
        </div>

        <div style={{
          background: 'var(--lens-bg)',
          padding: '1rem 1.4rem',
          borderRadius: '20px',
          border: '1.5px solid rgba(0, 102, 238, 0.25)',
          boxShadow: '0 8px 24px rgba(0, 102, 238, 0.08)'
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--app-text-muted, #64748B)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
            <Percent size={14} color="var(--color-primary, #0071E3)" /> {language === 'sw' ? 'Kiwango cha Kamisheni ya Jukwaa' : 'Global Platform Commission Rate'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="number" min="1" max="25" step="0.5" value={commissionRate * 100} onChange={handleCommissionChange}
              style={{
                width: 80,
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 800,
                fontSize: '1.05rem',
                textAlign: 'center',
                color: 'var(--app-text-primary, #0F172A)',
                background: 'var(--app-input-bg, #ffffff)',
                border: '1.5px solid var(--color-primary, #0071E3)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
              }} />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary, #0071E3)' }}>%</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          {
            label: language === 'sw' ? 'Jumla ya Miamala ya Jukwaa (GMV)' : 'Gross Platform GMV',
            value: `TSh ${totalPlatformGMV.toLocaleString()}`,
            color: 'var(--app-text-primary, #0F172A)',
            sub: language === 'sw' ? 'Thamani yote ya miamala iliyochakatwa' : 'Total processed transaction value',
            tint: 'cerulean', accent: 'var(--color-primary, #0071E3)', Icon: Wallet
          },
          {
            label: language === 'sw' ? 'Mapato Halisi ya Kamisheni ya MY DAY' : 'Net MY DAY Commission Revenue',
            value: `TSh ${totalPlatformCommission.toLocaleString()}`,
            color: 'var(--color-primary, #0071E3)',
            sub: language === 'sw' ? `Kulingana na ada ya ${commissionRate * 100}% ya jukwaa` : `Based on ${commissionRate * 100}% platform fee`,
            tint: 'cerulean', accent: 'var(--color-primary, #0071E3)', Icon: Percent
          },
          {
            label: language === 'sw' ? 'Watoa Huduma Wanaofanya Kazi' : 'Active Service Providers',
            value: `${totalVendors} ${language === 'sw' ? 'Watoa Huduma' : 'Vendors'}`,
            color: 'var(--color-primary, #0071E3)',
            sub: language === 'sw' ? 'Katika kategoria 6 kuu' : 'Across 6 core categories',
            tint: 'cerulean', accent: 'var(--color-primary, #0071E3)', Icon: Store
          },
          {
            label: language === 'sw' ? 'Nafasi Zilizohifadhiwa Jukwaani' : 'Total Platform Bookings',
            value: `${totalBookingsCount} ${language === 'sw' ? 'Uhifadhi' : 'Bookings'}`,
            color: '#059669',
            sub: language === 'sw' ? 'Uhifadhi uliothibitishwa wa maharusi' : 'Verified couple reservations',
            tint: 'mint', accent: '#059669', Icon: CalendarCheck
          },
        ].map((card, i) => (
          <div key={i} className="glass-frosted-optical" style={{ ...glassCard, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 750, color: 'var(--app-text-muted)' }}>{card.label}</div>
              <span style={{
                width: 32, height: 32, borderRadius: '10px',
                background: 'rgba(0, 102, 238, 0.1)', color: card.accent,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <card.Icon size={16} strokeWidth={2.2} />
              </span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: card.color, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{card.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--app-text-muted)' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Optical Capsule Tab Switcher */}
      <div className="glass-lens" style={{ display: 'inline-flex', gap: '0.4rem', background: 'var(--lens-bg)', padding: '0.3rem', borderRadius: '9999px', border: 'var(--lens-border)', marginBottom: '2rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)' }}>
        {['overview', 'ledger'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.45rem 1.15rem',
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === tab ? 'var(--puck-bg)' : 'transparent',
              color: activeTab === tab ? '#ffffff' : 'var(--app-text-muted)',
              fontWeight: 750,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeTab === tab ? '0 4px 12px rgba(0, 102, 238, 0.35)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {tab === 'overview'
              ? (language === 'sw' ? 'Uthibitishaji wa Watoa Huduma' : 'Provider Verifications')
              : (language === 'sw' ? `Daftari Kuu la Uhifadhi (${bookings.length})` : `Master Booking Ledger (${bookings.length})`)}
          </button>
        ))}
      </div>

      {/* Tab 1: Provider Verification Queue */}
      {activeTab === 'overview' && (
        <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text)', fontWeight: 800 }}>
            {language === 'sw' ? 'Orodha ya Watoa Huduma & Idhini' : 'Registered Vendors Directory & Approvals'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
            {providers.map(p => (
              <div key={p.id} className="admin-vendor-card" style={{
                background: 'var(--lens-bg)',
                border: 'var(--lens-border)',
                padding: '1.15rem',
                borderRadius: '20px',
                boxShadow: 'var(--lens-highlight)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.45rem' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--color-text)', lineHeight: 1.25 }}>{p.name}</h4>
                  <span style={{
                    background: p.verified ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.16)',
                    color: p.verified ? '#059669' : '#D97706',
                    border: `1px solid ${p.verified ? 'rgba(16, 185, 129, 0.32)' : 'rgba(245, 158, 11, 0.35)'}`,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '9999px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    alignSelf: 'flex-start'
                  }}>
                    {p.verified
                      ? (language === 'sw' ? 'IMETHIBITISHWA' : 'VERIFIED')
                      : (language === 'sw' ? 'INASUBIRI' : 'PENDING')}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                  {language === 'sw' ? 'Eneo:' : 'Location:'} {p.location} • {language === 'sw' ? 'Kategoria:' : 'Category:'} <strong style={{ textTransform: 'capitalize', color: 'var(--color-text)' }}>{p.category}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginBottom: '0.75rem' }}>
                  {language === 'sw' ? 'Mawasiliano:' : 'Contact:'} {p.contact || (language === 'sw' ? 'Hakuna simu' : 'No phone')}
                </div>
                {!p.verified && (
                  <button onClick={() => handleVerifyProvider(p.id)} className="btn-emerald" style={{
                    fontSize: '0.8rem',
                    fontWeight: 750,
                    padding: '0.45rem 1rem',
                    borderRadius: 'var(--radius-pill)',
                    cursor: 'pointer'
                  }}>
                    {language === 'sw' ? 'Idhinisha & Thibitisha Mtoa Huduma' : 'Approve & Verify Vendor'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Master Ledger */}
      {activeTab === 'ledger' && (
        <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text)', fontWeight: 800 }}>
            {language === 'sw' ? 'Daftari la Miamala Yote & Uhifadhi' : 'All Transactions & Bookings Ledger'}
          </h2>
          {bookings.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', padding: '1rem 0' }}>
              {language === 'sw' ? 'Hakuna miamala iliyorekodiwa kwenye jukwaa bado.' : 'No transactions recorded on platform yet.'}
            </p>
          ) : (
            <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--app-surface-secondary, rgba(255, 255, 255, 0.55))', borderBottom: '1px solid var(--app-border, rgba(255, 255, 255, 0.8))' }}>
                    {(language === 'sw'
                      ? ['Namba ya Uhifadhi', 'Kategoria', 'Tarehe ya Sherehe', 'Jumla ya Gharama', 'Kianzio (30%)', 'Ada ya Jukwaa (5%)', 'Hali']
                      : ['Booking ID', 'Category', 'Event Date', 'Gross Value', 'Deposit (30%)', 'Platform Fee (5%)', 'Status']
                    ).map(h => (
                      <th key={h} style={{ padding: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-text)' }}>{b.id}</td>
                      <td style={{ padding: '0.75rem', textTransform: 'capitalize', color: 'var(--color-text-muted)' }}>{b.category}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)' }}>{b.date}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 800, color: 'var(--color-text)' }}>TSh {b.price.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--color-success)', fontWeight: 700 }}>TSh {(b.deposit || 0).toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--color-primary-hover)', fontWeight: 800 }}>TSh {(b.commission || 0).toLocaleString()}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          background: b.status === 'confirmed' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                          color: b.status === 'confirmed' ? 'var(--color-success)' : 'var(--color-warning)',
                          padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)', fontWeight: 800, fontSize: '0.75rem'
                        }}>
                          {b.status === 'confirmed' ? (language === 'sw' ? 'imethibitishwa' : 'confirmed') : b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;
