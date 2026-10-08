import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Percent, ShieldCheck } from 'lucide-react';

function AdminDashboardPage() {
  const { providers, setProviders, bookings, commissionRate, setCommissionRate } = useAppContext();
  const [activeTab, setActiveTab] = useState('overview');

  const totalPlatformGMV = bookings.reduce((sum, b) => sum + b.price, 0);
  const totalPlatformCommission = Math.round(totalPlatformGMV * commissionRate);
  const totalVendors = providers.length;
  const totalBookingsCount = bookings.length;

  const handleCommissionChange = (e) => { setCommissionRate((parseFloat(e.target.value) || 0) / 100); };
  const handleVerifyProvider = (providerId) => { setProviders(prev => prev.map(p => p.id === providerId ? { ...p, verified: true } : p)); };

  const glassCard = { background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #785C45 0%, #5E4532 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <ShieldCheck size={14} /> MY DAY Superadmin Command Center
          </div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.2rem', fontWeight: 800 }}>Platform Governance & Revenue Ledger</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>Manage platform commissions, verify service providers, and monitor high-volume transactions across Tanzania.</p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
            <Percent size={14} color="#FFFFFF" /> Global Platform Commission Rate
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="number" min="1" max="25" step="0.5" value={commissionRate * 100} onChange={handleCommissionChange}
              style={{ width: 75, padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '1rem', textAlign: 'center', color: '#3B2B1F', background: '#FFFFFF' }} />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>%</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Gross Platform GMV', value: `TSh ${totalPlatformGMV.toLocaleString()}`, color: 'var(--color-text)', sub: 'Total processed transaction value' },
          { label: 'Net MY DAY Commission Revenue', value: `TSh ${totalPlatformCommission.toLocaleString()}`, color: 'var(--color-primary-hover)', sub: `Based on ${commissionRate * 100}% platform fee` },
          { label: 'Active Service Providers', value: `${totalVendors} Vendors`, color: 'var(--color-text)', sub: 'Across 6 core categories' },
          { label: 'Total Platform Bookings', value: `${totalBookingsCount} Bookings`, color: 'var(--color-success)', sub: 'Verified couple reservations' },
        ].map((card, i) => (
          <div key={i} style={{ ...glassCard, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', fontWeight: 500 }}>{card.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.25rem' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
        {['overview', 'ledger'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            background: 'none', boxShadow: 'none',
            color: activeTab === tab ? 'var(--color-primary-hover)' : 'var(--color-text-muted)',
            borderBottom: activeTab === tab ? '3px solid var(--color-primary)' : '3px solid transparent',
            borderRadius: 0, padding: '0.6rem 1rem', fontWeight: 700
          }}>
            {tab === 'overview' ? 'Provider Verifications' : `Master Booking Ledger (${bookings.length})`}
          </button>
        ))}
      </div>

      {/* Tab 1: Provider Verification Queue */}
      {activeTab === 'overview' && (
        <div style={{ ...glassCard, padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text)', fontWeight: 800 }}>Registered Vendors Directory & Approvals</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {providers.map(p => (
              <div key={p.id} style={{
                border: '1px solid var(--color-border)', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-soft)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text)' }}>{p.name}</h4>
                  <span style={{
                    background: p.verified ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                    color: p.verified ? 'var(--color-success)' : 'var(--color-warning)',
                    padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 800
                  }}>{p.verified ? 'VERIFIED' : 'PENDING'}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Location: {p.location} • Category: <strong style={{ textTransform: 'capitalize', color: 'var(--color-text)' }}>{p.category}</strong></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginBottom: '0.75rem' }}>Contact: {p.contact || 'No phone'}</div>
                {!p.verified && (
                  <button onClick={() => handleVerifyProvider(p.id)} style={{ background: 'var(--color-success)', color: '#FFFFFF', fontSize: '0.8rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-pill)' }}>Approve & Verify Vendor</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Master Ledger */}
      {activeTab === 'ledger' && (
        <div style={{ ...glassCard, padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text)', fontWeight: 800 }}>All Transactions & Bookings Ledger</h2>
          {bookings.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', padding: '1rem 0' }}>No transactions recorded on platform yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-soft)', borderBottom: '1px solid var(--color-border)' }}>
                    {['Booking ID', 'Category', 'Event Date', 'Gross Value', 'Deposit (30%)', 'Platform Fee (5%)', 'Status'].map(h => (
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
                        }}>{b.status}</span>
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
