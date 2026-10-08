import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import PaymentModal from '../components/PaymentModal';
import { Heart, Calendar, Users, PlusCircle, Sparkles } from 'lucide-react';

const ALL_CATEGORIES = [
  { id: 'kumbi', name: 'Kumbi (Venue)', icon: '🏰' },
  { id: 'catering', name: 'Catering', icon: '🍽️' },
  { id: 'wapambaji', name: 'Wapambaji (Decorators)', icon: '🎨' },
  { id: 'entertainment', name: 'MCs & Entertainment', icon: '🎤' },
  { id: 'saloon', name: 'Saloon & Barbershop', icon: '💇' },
  { id: 'transport', name: 'Transport', icon: '🚗' },
];

function WeddingDashboardPage() {
  const { wedding, bookings, providers } = useAppContext();
  const [activePaymentModal, setActivePaymentModal] = useState(null);

  const totalBookedAmount = bookings.reduce((sum, b) => sum + b.price, 0);
  const totalPaidAmount = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const remainingBudget = Math.max(0, wedding.budget - totalBookedAmount);
  const budgetUsagePct = Math.min(100, Math.round((totalBookedAmount / (wedding.budget || 1)) * 100));

  const categoryStatusMap = ALL_CATEGORIES.map(cat => {
    const bookedCategory = bookings.find(b => b.category === cat.id);
    return {
      ...cat,
      isBooked: !!bookedCategory,
      booking: bookedCategory,
      provider: bookedCategory ? providers.find(p => p.id === bookedCategory.providerId) : null
    };
  });

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Event Header Banner */}
      <div style={{
        background: '#FFFFFF',
        color: 'var(--color-text)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--color-primary-light)', color: 'var(--color-primary-hover)', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Sparkles size={14} /> Official Wedding Event Planner
          </div>
          <h1 style={{ fontSize: '2.25rem', color: 'var(--color-text)', marginBottom: '0.5rem', fontWeight: 800 }}>
            {wedding.title}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Heart size={16} color="var(--color-primary)" fill="var(--color-primary)" /> {wedding.bride} & {wedding.groom}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={16} color="var(--color-primary)" /> {wedding.date} ({wedding.location})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Users size={16} color="var(--color-primary)" /> {wedding.guests} Invited Guests
            </span>
          </div>
        </div>

        <Link
          to="/wedding"
          style={{
            background: 'var(--color-surface-soft)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            padding: '0.65rem 1.35rem',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.85rem',
            fontWeight: 700
          }}
        >
          Edit Wedding Settings
        </Link>
      </div>

      {/* Financial Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Target Budget', value: `TSh ${wedding.budget.toLocaleString()}`, color: 'var(--color-text)', sub: 'Set during profile setup' },
          { label: 'Total Committed/Booked', value: `TSh ${totalBookedAmount.toLocaleString()}`, color: 'var(--color-primary-hover)', sub: `${budgetUsagePct}% of total budget used` },
          { label: 'Total Paid To Date', value: `TSh ${totalPaidAmount.toLocaleString()}`, color: 'var(--color-success)', sub: 'Verified Mobile Money / Card' },
          { label: 'Remaining Available Budget', value: `TSh ${remainingBudget.toLocaleString()}`, color: remainingBudget > 0 ? 'var(--color-success)' : 'var(--color-error)', sub: 'Unallocated funds remaining' },
        ].map((card, i) => (
          <div key={i} style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xs)',
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', fontWeight: 500 }}>{card.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.25rem' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius)',
        padding: '1.25rem',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-xs)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
          <span>Wedding Budget Utilization</span>
          <span>{budgetUsagePct}% Allocated</span>
        </div>
        <div style={{ width: '100%', height: 12, background: '#E6D9CC', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{
            width: `${budgetUsagePct}%`,
            height: '100%',
            background: 'var(--color-primary)',
            borderRadius: 6,
            transition: 'width 0.5s ease',
            boxShadow: 'var(--shadow-glow)',
          }}></div>
        </div>
      </div>

      {/* 6 Core Categories Booking Tracker */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-text)', fontWeight: 800 }}>6 Core Services Checklist</h2>
          <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: 'var(--color-primary-hover)' }}>
            <PlusCircle size={16} /> Browse Marketplace
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {categoryStatusMap.map(cat => (
            <div
              key={cat.id}
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                border: cat.isBooked ? '2px solid rgba(255, 157, 59, 0.4)' : '1px dashed var(--color-border)',
                boxShadow: cat.isBooked ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)' }}>{cat.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: cat.isBooked ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: 700 }}>
                      {cat.isBooked ? '✓ Reserved & Booked' : 'Not Reserved Yet'}
                    </div>
                  </div>
                </div>

                {cat.isBooked ? (
                  <span style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-pill)' }}>
                    BOOKED
                  </span>
                ) : (
                  <span style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-pill)' }}>
                    PENDING
                  </span>
                )}
              </div>

              {cat.isBooked ? (
                <div style={{ background: 'var(--color-surface-soft)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{cat.provider?.name || 'Vendor'}</div>
                  <div style={{ color: 'var(--color-text-muted)' }}>Location: {cat.provider?.location}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontWeight: 700, color: 'var(--color-primary-hover)' }}>
                    <span>Service Cost:</span>
                    <span>TSh {cat.booking.price.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <span>Paid to Date:</span>
                    <span>TSh {(cat.booking.paidAmount || 0).toLocaleString()}</span>
                  </div>

                  {cat.booking.price > (cat.booking.paidAmount || 0) && (
                    <button
                      onClick={() => setActivePaymentModal({
                        bookingId: cat.booking.id,
                        amount: cat.booking.price - (cat.booking.paidAmount || 0),
                        isFull: true
                      })}
                      style={{
                        width: '100%',
                        marginTop: '0.75rem',
                        background: 'var(--color-primary)',
                        color: '#FFFFFF',
                        padding: '0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-pill)',
                        boxShadow: 'var(--shadow-glow)'
                      }}
                    >
                      Pay Remaining Balance (TSh {(cat.booking.price - (cat.booking.paidAmount || 0)).toLocaleString()})
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                    Find & compare top {cat.name} vendors in {wedding.location}
                  </p>
                  <Link
                    to={`/marketplace?category=${cat.id}`}
                    style={{
                      display: 'inline-block',
                      background: 'var(--color-primary)',
                      color: '#FFFFFF',
                      padding: '0.5rem 1.1rem',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      boxShadow: 'var(--shadow-glow)',
                    }}
                  >
                    Select {cat.name.split(' ')[0]} Vendor
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {activePaymentModal && (
        <PaymentModal
          bookingId={activePaymentModal.bookingId}
          amount={activePaymentModal.amount}
          isFullPayment={activePaymentModal.isFull}
          onClose={() => setActivePaymentModal(null)}
          onSuccess={() => setActivePaymentModal(null)}
        />
      )}
    </div>
  );
}

export default WeddingDashboardPage;
