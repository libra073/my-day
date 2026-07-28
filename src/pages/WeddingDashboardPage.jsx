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

  const [activePaymentModal, setActivePaymentModal] = useState(null); // { bookingId, amount, isFull }

  // Financial calculations
  const totalBookedAmount = bookings.reduce((sum, b) => sum + b.price, 0);
  const totalPaidAmount = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const remainingBudget = Math.max(0, wedding.budget - totalBookedAmount);

  const budgetUsagePct = Math.min(100, Math.round((totalBookedAmount / (wedding.budget || 1)) * 100));

  // Determine category booking statuses
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
    <div className="container py-8">
      {/* Event Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-dark) 0%, #174E3E 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius)',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--color-primary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Sparkles size={14} /> Official Wedding Event Planner
          </div>
          <h1 style={{ fontSize: '2.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>
            {wedding.title}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Heart size={16} color="var(--color-primary)" /> {wedding.bride} & {wedding.groom}
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
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(4px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '0.6rem 1.25rem',
            borderRadius: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          Edit Wedding Settings
        </Link>
      </div>

      {/* Financial Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card p-4">
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Total Target Budget</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-dark)' }}>
            TSh {wedding.budget.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>Set during profile setup</div>
        </div>

        <div className="card p-4">
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Total Committed/Booked</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            TSh {totalBookedAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>{budgetUsagePct}% of total budget used</div>
        </div>

        <div className="card p-4">
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Total Paid To Date</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)' }}>
            TSh {totalPaidAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>Verified Mobile Money / Card</div>
        </div>

        <div className="card p-4">
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Remaining Available Budget</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: remainingBudget > 0 ? '#2E7D32' : '#C62828' }}>
            TSh {remainingBudget.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>Unallocated funds remaining</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ background: '#ffffff', borderRadius: 'var(--radius)', padding: '1.25rem', border: '1px solid #EAE7E1', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <span>Wedding Budget Utilization</span>
          <span>{budgetUsagePct}% Allocated</span>
        </div>
        <div style={{ width: '100%', height: 12, background: '#F0EEEA', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{
            width: `${budgetUsagePct}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
            borderRadius: 6,
            transition: 'width 0.5s ease'
          }}></div>
        </div>
      </div>

      {/* 6 Core Categories Booking Tracker */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-dark)' }}>6 Core Services Checklist</h2>
          <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
            <PlusCircle size={16} /> Browse Marketplace
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {categoryStatusMap.map(cat => (
            <div
              key={cat.id}
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius)',
                padding: '1.25rem',
                border: cat.isBooked ? '1.5px solid var(--color-primary)' : '1px dashed #D1CDC6',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{cat.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: cat.isBooked ? 'var(--color-success)' : '#888', fontWeight: 600 }}>
                      {cat.isBooked ? '✓ Reserved & Booked' : 'Not Reserved Yet'}
                    </div>
                  </div>
                </div>

                {cat.isBooked ? (
                  <span style={{ background: '#E8F5E9', color: '#2E7D32', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
                    BOOKED
                  </span>
                ) : (
                  <span style={{ background: '#FFF3E0', color: '#E65100', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
                    PENDING
                  </span>
                )}
              </div>

              {cat.isBooked ? (
                <div style={{ background: '#FAF9F6', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-dark)' }}>{cat.provider?.name || 'Vendor'}</div>
                  <div style={{ color: '#666' }}>Location: {cat.provider?.location}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    <span>Service Cost:</span>
                    <span>TSh {cat.booking.price.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666' }}>
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
                        background: 'var(--color-dark)',
                        color: '#ffffff',
                        padding: '0.45rem',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      Pay Remaining Balance (TSh {(cat.booking.price - (cat.booking.paidAmount || 0)).toLocaleString()})
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.75rem' }}>
                    Find & compare top {cat.name} vendors in {wedding.location}
                  </p>
                  <Link
                    to={`/marketplace?category=${cat.id}`}
                    style={{
                      display: 'inline-block',
                      background: 'var(--color-primary)',
                      color: '#ffffff',
                      padding: '0.45rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 600
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

      {/* Payment Simulator Modal */}
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
