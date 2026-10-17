import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import VendorScheduleSettings from '../components/VendorScheduleSettings';
import { Store, Plus, ShieldCheck, MapPin, Calendar, Clock } from 'lucide-react';

function ProviderDashboardPage() {
  const { providers, setProviders, bookings, setBookings, commissionRate, user } = useAppContext();

  const currentProviderId = user?.providerId || (user?.role === 'provider' ? user.id : 'venue-1');
  const provider = providers.find(p => p.id === currentProviderId || p.id === user?.id) || providers[0];

  const providerBookings = bookings.filter(b => b.providerId === provider.id);

  const grossRevenue = providerBookings.reduce((sum, b) => sum + b.price, 0);
  const totalCommissionDeducted = Math.round(grossRevenue * commissionRate);
  const netPayout = grossRevenue - totalCommissionDeducted;

  const [activeTab, setActiveTab] = useState('bookings');
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [newPkg, setNewPkg] = useState({ name: '', price: 1000000, description: '' });

  const handleAddPackage = (e) => {
    e.preventDefault();
    if (!newPkg.name) return;
    const pkgObj = { id: `pkg-${Date.now()}`, name: newPkg.name, price: parseInt(newPkg.price) || 0, description: newPkg.description };
    setProviders(prev => prev.map(p => p.id === provider.id ? { ...p, packages: [...(p.packages || []), pkgObj] } : p));
    setNewPkg({ name: '', price: 1000000, description: '' });
    setShowPackageForm(false);
  };

  const handleToggleBookingStatus = (bookingId, newStatus) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
  };

  const handleToggleDateAvailability = (dateISO) => {
    const isBlocked = (provider.unavailableDates || []).includes(dateISO);
    const updatedDates = isBlocked
      ? (provider.unavailableDates || []).filter(d => d !== dateISO)
      : [...(provider.unavailableDates || []), dateISO];
    setProviders(prev => prev.map(p => p.id === provider.id ? { ...p, unavailableDates: updatedDates } : p));
  };

  const glassCard = {
    background: '#FFFFFF',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm)',
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Header Banner */}
      <div style={{
        ...glassCard,
        padding: '1.75rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 54, height: 54, borderRadius: '50%',
            background: 'var(--color-primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-primary-hover)'
          }}>
            <Store size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--color-text)', marginBottom: '0.2rem', fontWeight: 800 }}>{provider.name}</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={14} color="var(--color-primary)" /> {provider.location} • Category: <strong style={{ textTransform: 'capitalize', color: 'var(--color-text)' }}>{provider.category}</strong>
            </p>
          </div>
        </div>

        <span style={{
          background: 'var(--color-success-bg)',
          color: 'var(--color-success)',
          padding: '0.4rem 0.85rem',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.8rem',
          fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: '0.35rem'
        }}>
          <ShieldCheck size={14} /> Verified Partner Provider
        </span>
      </div>

      {/* Earnings & Financials Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Gross Revenue (Booked)', value: `TSh ${grossRevenue.toLocaleString()}`, color: 'var(--color-text)', sub: `From ${providerBookings.length} confirmed bookings` },
          { label: `MY DAY Commission (${commissionRate * 100}%)`, value: `- TSh ${totalCommissionDeducted.toLocaleString()}`, color: 'var(--color-error)', sub: 'Platform facilitation fee' },
          { label: 'Net Payout Balance', value: `TSh ${netPayout.toLocaleString()}`, color: 'var(--color-success)', sub: 'Direct Mobile Money/Bank payout' },
        ].map((card, i) => (
          <div key={i} style={{ ...glassCard, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{card.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.25rem' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          style={{
            background: activeTab === 'bookings' ? 'var(--color-primary)' : 'var(--color-surface-soft)',
            color: activeTab === 'bookings' ? '#FFFFFF' : 'var(--color-text)',
            border: `1px solid ${activeTab === 'bookings' ? 'var(--color-primary)' : 'var(--color-border)'}`,
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'var(--transition)',
          }}
        >
          <Calendar size={16} /> Wedding Bookings & Calendar
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          style={{
            background: activeTab === 'schedule' ? 'var(--color-primary)' : 'var(--color-surface-soft)',
            color: activeTab === 'schedule' ? '#FFFFFF' : 'var(--color-text)',
            border: `1px solid ${activeTab === 'schedule' ? 'var(--color-primary)' : 'var(--color-border)'}`,
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'var(--transition)',
          }}
        >
          <Clock size={16} /> Operating Schedule & Consultations
        </button>
      </div>

      {activeTab === 'schedule' ? (
        <VendorScheduleSettings vendorId={provider.id} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Left Column: Bookings & Package Builder */}
          <div>
            {/* Bookings Management */}
            <div style={{ ...glassCard, padding: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text)', fontWeight: 800 }}>
                Incoming Wedding Bookings ({providerBookings.length})
              </h2>

              {providerBookings.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
                  No active bookings yet. Once couples book your service on the marketplace, requests will appear here.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {providerBookings.map(b => (
                    <div key={b.id} style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1rem',
                      background: 'var(--color-surface-soft)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{b.id}</span>
                        <span style={{
                          background: b.status === 'confirmed' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                          color: b.status === 'confirmed' ? 'var(--color-success)' : 'var(--color-warning)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          textTransform: 'uppercase'
                        }}>
                          {b.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                        <span>Wedding Date: <strong style={{ color: 'var(--color-text)' }}>{b.date}</strong></span>
                        <span style={{ fontWeight: 800, color: 'var(--color-primary-hover)' }}>TSh {b.price.toLocaleString()}</span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                        Deposit Paid: TSh {(b.deposit || 0).toLocaleString()} • MY DAY Fee: TSh {(b.commission || 0).toLocaleString()}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {b.status !== 'confirmed' && (
                          <button onClick={() => handleToggleBookingStatus(b.id, 'confirmed')}
                            style={{ background: 'var(--color-success)', color: '#FFFFFF', fontSize: '0.8rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-pill)' }}>
                            Accept Booking
                          </button>
                        )}
                        <button onClick={() => handleToggleBookingStatus(b.id, 'cancelled')}
                          style={{ background: 'var(--color-error)', color: '#ffffff', fontSize: '0.8rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-pill)' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Package Builder */}
            <div style={{ ...glassCard, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text)', fontWeight: 800 }}>Package & Service Catalog</h2>
                <button onClick={() => setShowPackageForm(!showPackageForm)}
                  style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: 'var(--radius-pill)' }}>
                  <Plus size={16} /> Add Package
                </button>
              </div>

              {showPackageForm && (
                <form onSubmit={handleAddPackage} style={{
                  background: 'var(--color-surface-soft)',
                  padding: '1rem', borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem', border: '1px solid var(--color-border)'
                }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-text)' }}>Package Name</label>
                    <input type="text" placeholder="E.g. VIP Reception Decor" value={newPkg.name} onChange={e => setNewPkg({ ...newPkg, name: e.target.value })} required />
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-text)' }}>Price in TSh</label>
                    <input type="number" step="100000" value={newPkg.price} onChange={e => setNewPkg({ ...newPkg, price: e.target.value })} required />
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-text)' }}>Description / Highlights</label>
                    <textarea rows="2" value={newPkg.description} onChange={e => setNewPkg({ ...newPkg, description: e.target.value })} />
                  </div>
                  <button type="submit" style={{ background: 'var(--color-primary)', color: '#FFFFFF', fontSize: '0.85rem', borderRadius: 'var(--radius-pill)' }}>Save Package</button>
                </form>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {(provider.packages || []).map(p => (
                  <div key={p.id} style={{
                    border: '1px solid var(--color-border)',
                    padding: '1rem', borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-surface-soft)',
                  }}>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>{p.name}</h4>
                    <div style={{ color: 'var(--color-primary-hover)', fontWeight: 800, fontSize: '1.1rem', margin: '0.25rem 0' }}>TSh {p.price.toLocaleString()}</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Availability Control Calendar */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--color-text)', fontWeight: 700 }}>Manage Date Availability</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
              Click any date on the calendar to manually block or unblock your availability.
            </p>
            <AvailabilityCalendar
              unavailableDates={provider.unavailableDates || []}
              selectedDate={null}
              onSelectDate={dateISO => handleToggleDateAvailability(dateISO)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProviderDashboardPage;
