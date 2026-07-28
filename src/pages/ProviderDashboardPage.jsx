import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { Store, Plus, ShieldCheck, MapPin } from 'lucide-react';

function ProviderDashboardPage() {
  const { providers, setProviders, bookings, setBookings, commissionRate } = useAppContext();

  // Current logged in provider (for demo, defaults to Grand Imperial Hall venue-1)
  const currentProviderId = 'venue-1';
  const provider = providers.find(p => p.id === currentProviderId) || providers[0];

  const providerBookings = bookings.filter(b => b.providerId === provider.id);

  // Financial calculations
  const grossRevenue = providerBookings.reduce((sum, b) => sum + b.price, 0);
  const totalCommissionDeducted = Math.round(grossRevenue * commissionRate);
  const netPayout = grossRevenue - totalCommissionDeducted;

  // Package builder state
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [newPkg, setNewPkg] = useState({ name: '', price: 1000000, description: '' });

  const handleAddPackage = (e) => {
    e.preventDefault();
    if (!newPkg.name) return;

    const pkgObj = {
      id: `pkg-${Date.now()}`,
      name: newPkg.name,
      price: parseInt(newPkg.price) || 0,
      description: newPkg.description
    };

    setProviders(prev =>
      prev.map(p =>
        p.id === provider.id
          ? { ...p, packages: [...(p.packages || []), pkgObj] }
          : p
      )
    );

    setNewPkg({ name: '', price: 1000000, description: '' });
    setShowPackageForm(false);
  };

  const handleToggleBookingStatus = (bookingId, newStatus) => {
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
    );
  };

  const handleToggleDateAvailability = (dateISO) => {
    const isBlocked = (provider.unavailableDates || []).includes(dateISO);
    let updatedDates = [];

    if (isBlocked) {
      updatedDates = (provider.unavailableDates || []).filter(d => d !== dateISO);
    } else {
      updatedDates = [...(provider.unavailableDates || []), dateISO];
    }

    setProviders(prev =>
      prev.map(p => p.id === provider.id ? { ...p, unavailableDates: updatedDates } : p)
    );
  };

  return (
    <div className="container py-8">
      {/* Header Banner */}
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius)',
        padding: '1.75rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid #EAE7E1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: 'var(--color-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-dark)'
          }}>
            <Store size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--color-dark)', marginBottom: '0.2rem' }}>
              {provider.name}
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={14} color="var(--color-primary)" /> {provider.location} • Category: <strong style={{ textTransform: 'capitalize' }}>{provider.category}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{
            background: '#E8F5E9',
            color: '#2E7D32',
            padding: '0.4rem 0.75rem',
            borderRadius: '1rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <ShieldCheck size={14} /> Verified Partner Provider
          </span>
        </div>
      </div>

      {/* Earnings & Financials Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card p-4">
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Gross Revenue (Booked)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-dark)' }}>
            TSh {grossRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>From {providerBookings.length} confirmed bookings</div>
        </div>

        <div className="card p-4">
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>MY DAY Commission ({commissionRate * 100}%)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#C62828' }}>
            - TSh {totalCommissionDeducted.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>Platform facilitation fee</div>
        </div>

        <div className="card p-4">
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Net Payout Balance</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)' }}>
            TSh {netPayout.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>Direct Mobile Money/Bank payout</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Bookings & Package Builder */}
        <div>
          {/* Bookings Management */}
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid #EAE7E1', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-dark)' }}>
              Incoming Wedding Bookings ({providerBookings.length})
            </h2>

            {providerBookings.length === 0 ? (
              <p style={{ color: '#888', fontSize: '0.9rem', padding: '1rem 0' }}>
                No active bookings yet. Once couples book your service on the marketplace, requests will appear here.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {providerBookings.map(b => (
                  <div key={b.id} style={{ border: '1px solid #E0DDD7', borderRadius: '0.5rem', padding: '1rem', background: '#FAF9F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}>{b.id}</span>
                      <span style={{
                        background: b.status === 'confirmed' ? '#E8F5E9' : '#FFF3E0',
                        color: b.status === 'confirmed' ? '#2E7D32' : '#E65100',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {b.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      <span>Wedding Date: <strong>{b.date}</strong></span>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>TSh {b.price.toLocaleString()}</span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.75rem' }}>
                      Deposit Paid: TSh {(b.deposit || 0).toLocaleString()} • MY DAY Fee: TSh {(b.commission || 0).toLocaleString()}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {b.status !== 'confirmed' && (
                        <button
                          onClick={() => handleToggleBookingStatus(b.id, 'confirmed')}
                          style={{ background: '#2E7D32', color: '#fff', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                        >
                          Accept Booking
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleBookingStatus(b.id, 'cancelled')}
                        style={{ background: '#C62828', color: '#fff', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Package Builder */}
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid #EAE7E1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--color-dark)' }}>Package & Service Catalog</h2>
              <button
                onClick={() => setShowPackageForm(!showPackageForm)}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={16} /> Add Package
              </button>
            </div>

            {showPackageForm && (
              <form onSubmit={handleAddPackage} style={{ background: '#FAF9F6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #E0DDD7' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Package Name</label>
                  <input
                    type="text"
                    placeholder="E.g. VIP Reception Decor"
                    value={newPkg.name}
                    onChange={e => setNewPkg({ ...newPkg, name: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #DDD', borderRadius: '0.35rem' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Price in TSh</label>
                  <input
                    type="number"
                    step="100000"
                    value={newPkg.price}
                    onChange={e => setNewPkg({ ...newPkg, price: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #DDD', borderRadius: '0.35rem' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Description / Highlights</label>
                  <textarea
                    rows="2"
                    value={newPkg.description}
                    onChange={e => setNewPkg({ ...newPkg, description: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #DDD', borderRadius: '0.35rem' }}
                  />
                </div>
                <button type="submit" style={{ background: 'var(--color-dark)', color: '#fff', fontSize: '0.85rem' }}>Save Package</button>
              </form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {(provider.packages || []).map(p => (
                <div key={p.id} style={{ border: '1px solid #E0DDD7', padding: '1rem', borderRadius: '0.5rem', background: '#fff' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{p.name}</h4>
                  <div style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '1.1rem', margin: '0.25rem 0' }}>
                    TSh {p.price.toLocaleString()}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#666' }}>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Availability Control Calendar */}
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--color-dark)' }}>Manage Date Availability</h3>
          <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.75rem' }}>
            Click any date on the calendar to manually block or unblock your availability.
          </p>
          <AvailabilityCalendar
            unavailableDates={provider.unavailableDates || []}
            selectedDate={null}
            onSelectDate={dateISO => handleToggleDateAvailability(dateISO)}
          />
        </div>
      </div>
    </div>
  );
}

export default ProviderDashboardPage;
