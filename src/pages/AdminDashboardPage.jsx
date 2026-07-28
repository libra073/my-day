import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Percent, ShieldCheck } from 'lucide-react';

function AdminDashboardPage() {
  const { providers, setProviders, bookings, commissionRate, setCommissionRate } = useAppContext();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'vendors' | 'ledger'

  // Key platform stats
  const totalPlatformGMV = bookings.reduce((sum, b) => sum + b.price, 0);
  const totalPlatformCommission = Math.round(totalPlatformGMV * commissionRate);
  const totalVendors = providers.length;
  const totalBookingsCount = bookings.length;

  const handleCommissionChange = (e) => {
    const ratePct = parseFloat(e.target.value) || 0;
    setCommissionRate(ratePct / 100);
  };

  const handleVerifyProvider = (providerId) => {
    setProviders(prev =>
      prev.map(p => p.id === providerId ? { ...p, verified: true } : p)
    );
  };

  return (
    <div className="container py-8">
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0A2E23 0%, #1A4D3E 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius)',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--color-primary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <ShieldCheck size={14} /> MY DAY Superadmin Command Center
          </div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.2rem' }}>
            Platform Governance & Revenue Ledger
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            Manage platform commissions, verify service providers, and monitor high-volume transactions across Tanzania.
          </p>
        </div>

        {/* Global Commission Setting */}
        <div style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(6px)',
          padding: '0.85rem 1.25rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(255,255,255,0.25)'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Percent size={14} color="var(--color-primary)" /> Global Platform Commission Rate
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="number"
              min="1"
              max="25"
              step="0.5"
              value={commissionRate * 100}
              onChange={handleCommissionChange}
              style={{
                width: 70,
                padding: '0.35rem 0.5rem',
                borderRadius: '0.25rem',
                border: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                textAlign: 'center'
              }}
            />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>%</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card p-4">
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Gross Platform GMV</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-dark)' }}>
            TSh {totalPlatformGMV.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>Total processed transaction value</div>
        </div>

        <div className="card p-4">
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Net MY DAY Commission Revenue</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            TSh {totalPlatformCommission.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>Based on {commissionRate * 100}% platform fee</div>
        </div>

        <div className="card p-4">
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Active Service Providers</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-dark)' }}>
            {totalVendors} Vendors
          </div>
          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>Across 6 core categories</div>
        </div>

        <div className="card p-4">
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Total Platform Bookings</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)' }}>
            {totalBookingsCount} Bookings
          </div>
          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>Verified couple reservations</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #EAE7E1', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            background: 'none',
            boxShadow: 'none',
            color: activeTab === 'overview' ? 'var(--color-primary)' : '#666',
            borderBottom: activeTab === 'overview' ? '3px solid var(--color-primary)' : '3px solid transparent',
            borderRadius: 0,
            padding: '0.6rem 1rem',
            fontWeight: 700
          }}
        >
          Provider Verifications
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          style={{
            background: 'none',
            boxShadow: 'none',
            color: activeTab === 'ledger' ? 'var(--color-primary)' : '#666',
            borderBottom: activeTab === 'ledger' ? '3px solid var(--color-primary)' : '3px solid transparent',
            borderRadius: 0,
            padding: '0.6rem 1rem',
            fontWeight: 700
          }}
        >
          Master Booking Ledger ({bookings.length})
        </button>
      </div>

      {/* Tab 1: Provider Verification Queue */}
      {activeTab === 'overview' && (
        <div style={{ background: '#ffffff', borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid #EAE7E1' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-dark)' }}>
            Registered Vendors Directory & Approvals
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {providers.map(p => (
              <div key={p.id} style={{ border: '1px solid #E0DDD7', padding: '1rem', borderRadius: '0.5rem', background: '#FAF9F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{p.name}</h4>
                  <span style={{
                    background: p.verified ? '#E8F5E9' : '#FFF3E0',
                    color: p.verified ? '#2E7D32' : '#E65100',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {p.verified ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                  Location: {p.location} • Category: <strong style={{ textTransform: 'capitalize' }}>{p.category}</strong>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#777', marginBottom: '0.75rem' }}>
                  Contact: {p.contact || 'No phone'}
                </div>

                {!p.verified && (
                  <button
                    onClick={() => handleVerifyProvider(p.id)}
                    style={{ background: '#2E7D32', color: '#fff', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  >
                    Approve & Verify Vendor
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Master Ledger */}
      {activeTab === 'ledger' && (
        <div style={{ background: '#ffffff', borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid #EAE7E1' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-dark)' }}>
            All Transactions & Bookings Ledger
          </h2>

          {bookings.length === 0 ? (
            <p style={{ color: '#888', padding: '1rem 0' }}>No transactions recorded on platform yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F4F2EE', borderBottom: '2px solid #E0DDD7' }}>
                    <th style={{ padding: '0.75rem' }}>Booking ID</th>
                    <th style={{ padding: '0.75rem' }}>Category</th>
                    <th style={{ padding: '0.75rem' }}>Event Date</th>
                    <th style={{ padding: '0.75rem' }}>Gross Value</th>
                    <th style={{ padding: '0.75rem' }}>Deposit (30%)</th>
                    <th style={{ padding: '0.75rem' }}>Platform Fee (5%)</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #EAE7E1' }}>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>{b.id}</td>
                      <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{b.category}</td>
                      <td style={{ padding: '0.75rem' }}>{b.date}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 700 }}>TSh {b.price.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', color: '#2E7D32' }}>TSh {(b.deposit || 0).toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                        TSh {(b.commission || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          background: b.status === 'confirmed' ? '#E8F5E9' : '#FFF3E0',
                          color: b.status === 'confirmed' ? '#2E7D32' : '#E65100',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '0.25rem',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}>
                          {b.status}
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
