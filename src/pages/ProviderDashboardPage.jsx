import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import VendorScheduleSettings from '../components/VendorScheduleSettings';
import { isPastDateInDarEsSalaam } from '../services/businessSchedule';
import { Store, Plus, ShieldCheck, MapPin, Calendar, Clock, Wallet, Percent, PiggyBank } from 'lucide-react';

function ProviderDashboardPage() {
  const { providers, setProviders, bookings, setBookings, commissionRate, user, language } = useAppContext();
  const isSw = language === 'sw';

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
    if (isPastDateInDarEsSalaam(dateISO)) return;
    const isBlocked = (provider.unavailableDates || []).includes(dateISO);
    const updatedDates = isBlocked
      ? (provider.unavailableDates || []).filter(d => d !== dateISO)
      : [...(provider.unavailableDates || []), dateISO];
    setProviders(prev => prev.map(p => p.id === provider.id ? { ...p, unavailableDates: updatedDates } : p));
  };

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
      {/* Header Banner */}
      <div className="glass-slab glass-frosted-optical" style={{
        ...glassCard,
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '18px',
            background: 'var(--puck-bg)',
            border: '1.5px solid rgba(255, 255, 255, 0.35)',
            boxShadow: '0 6px 16px rgba(0, 102, 238, 0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Store size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.2rem', fontWeight: 900, letterSpacing: '-0.025em' }}>{provider.name}</h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--app-text-muted, #64748B)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem 0.45rem' }}>
              <MapPin size={14} color="var(--color-primary, #0071E3)" style={{ flexShrink: 0 }} /> {provider.location} • {isSw ? 'Kategoria' : 'Category'}: <strong style={{ textTransform: 'capitalize', color: 'var(--app-text-primary, #0F172A)' }}>{provider.category}</strong>
            </p>
          </div>
        </div>

        <span className="badge-cerulean" style={{
          padding: '0.45rem 1rem',
          fontSize: '0.82rem',
          fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: '0.4rem'
        }}>
          <ShieldCheck size={16} color="var(--color-primary, #0071E3)" /> {isSw ? 'Mshirika Aliyehakikiwa' : 'Verified Partner Provider'}
        </span>
      </div>

      {/* Earnings & Financials Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          {
            label: isSw ? 'Mapato Ghafi (Yaliyohifadhiwa)' : 'Gross Revenue (Booked)',
            value: `TSh ${grossRevenue.toLocaleString()}`,
            color: 'var(--app-text-primary, #0F172A)',
            sub: isSw ? `Kutoka kwa maombi ${providerBookings.length} yaliyothibitishwa` : `From ${providerBookings.length} confirmed bookings`,
            tint: 'cerulean', accent: 'var(--color-primary, #0071E3)', Icon: Wallet
          },
          {
            label: isSw ? `Ada ya MY DAY (${commissionRate * 100}%)` : `MY DAY Commission (${commissionRate * 100}%)`,
            value: `- TSh ${totalCommissionDeducted.toLocaleString()}`,
            color: 'var(--color-primary, #0071E3)',
            sub: isSw ? 'Ada ya kuwezesha jukwaa' : 'Platform facilitation fee',
            tint: 'neon-rose', accent: 'var(--color-primary, #0071E3)', Icon: Percent
          },
          {
            label: isSw ? 'Salio Safi la Malipo' : 'Net Payout Balance',
            value: `TSh ${netPayout.toLocaleString()}`,
            color: '#059669',
            sub: isSw ? 'Malipo ya moja kwa moja ya Tigo Pesa/M-Pesa/Benki' : 'Direct Mobile Money/Bank payout',
            tint: 'mint', accent: '#059669', Icon: PiggyBank
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
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '9999px',
            border: 'none',
            background: activeTab === 'bookings' ? 'var(--puck-bg)' : 'transparent',
            color: activeTab === 'bookings' ? '#ffffff' : 'var(--app-text-muted)',
            fontWeight: 750,
            fontSize: '0.84rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'bookings' ? '0 4px 12px rgba(0, 102, 238, 0.35)' : 'none',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Calendar size={15} /> {isSw ? 'Maombi na Kalenda ya Harusi' : 'Wedding Bookings & Calendar'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '9999px',
            border: 'none',
            background: activeTab === 'schedule' ? 'var(--puck-bg)' : 'transparent',
            color: activeTab === 'schedule' ? '#ffffff' : 'var(--app-text-muted)',
            fontWeight: 750,
            fontSize: '0.84rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'schedule' ? '0 4px 12px rgba(0, 102, 238, 0.35)' : 'none',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Clock size={15} /> {isSw ? 'Ratiba ya Kazi na Ushauri' : 'Operating Schedule & Consultations'}
        </button>
      </div>

      {activeTab === 'schedule' ? (
        <VendorScheduleSettings vendorId={provider.id} />
      ) : (
        <div className="provider-dashboard-grid">
          {/* Left Column: Bookings & Package Builder */}
          <div style={{ minWidth: 0 }}>
            {/* Bookings Management */}
            <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text)', fontWeight: 800 }}>
                {isSw ? `Maombi ya Harusi Yaliyopokelewa (${providerBookings.length})` : `Incoming Wedding Bookings (${providerBookings.length})`}
              </h2>

              {providerBookings.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
                  {isSw ? 'Bado hakuna nafasi zilizoombwa. Wanandoa wakishaweka nafasi kwa huduma yako kwenye soko, maombi yataonekana hapa.' : 'No active bookings yet. Once couples book your service on the marketplace, requests will appear here.'}
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

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {b.status !== 'confirmed' && (
                          <button onClick={() => handleToggleBookingStatus(b.id, 'confirmed')}
                            className="btn-emerald"
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 750,
                              padding: '0.45rem 1rem',
                              borderRadius: 'var(--radius-pill)',
                            }}>
                            Accept Booking
                          </button>
                        )}
                        <button onClick={() => handleToggleBookingStatus(b.id, 'cancelled')}
                          className="btn-danger"
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 750,
                            padding: '0.45rem 1rem',
                            borderRadius: 'var(--radius-pill)'
                          }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Package Builder */}
            <div className="glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--app-text-primary, #0f172a)', fontWeight: 800 }}>Package &amp; Service Catalog</h2>
                <button onClick={() => setShowPackageForm(!showPackageForm)}
                  className="btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Plus size={16} /> {isSw ? 'Ongeza Kifurushi' : 'Add Package'}
                </button>
              </div>

              {showPackageForm && (
                <form onSubmit={handleAddPackage} style={{
                  background: 'var(--app-surface-secondary, rgba(255, 255, 255, 0.75))',
                  padding: '1.25rem', borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem', border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
                  boxShadow: 'var(--clay-shadow-tile)'
                }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--app-text-primary, #0f172a)' }}>
                      {isSw ? 'Jina la Kifurushi' : 'Package Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={isSw ? 'Mfano: Mapambo ya VIP ya Ukumbini' : 'E.g. VIP Reception Decor'}
                      value={newPkg.name}
                      onChange={e => setNewPkg({ ...newPkg, name: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--app-text-primary, #0f172a)' }}>
                      {isSw ? 'Bei kwa TSh' : 'Price in TSh'}
                    </label>
                    <input type="number" step="100000" value={newPkg.price} onChange={e => setNewPkg({ ...newPkg, price: e.target.value })} required />
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--app-text-primary, #0f172a)' }}>
                      {isSw ? 'Maelezo / Sifa Kuu' : 'Description / Highlights'}
                    </label>
                    <textarea rows="2" value={newPkg.description} onChange={e => setNewPkg({ ...newPkg, description: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.6rem 1.4rem' }}>
                    {isSw ? 'Hifadhi Kifurushi' : 'Save Package'}
                  </button>
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
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--color-text)', fontWeight: 700 }}>
              {isSw ? 'Simamia Tarehe za Upatikanaji' : 'Manage Date Availability'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
              {isSw ? 'Bofya tarehe yoyote kwenye kalenda kuzuia au kufungua upatikanaji wako.' : 'Click any date on the calendar to manually block or unblock your availability.'}
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
