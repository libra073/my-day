import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import PaymentModal from '../components/PaymentModal';
import { Calendar, Phone, MapPin, CheckCircle2, Download, PlusCircle } from 'lucide-react';

function MyBookingsPage() {
  const { bookings, providers, wedding } = useAppContext();
  const [activePayment, setActivePayment] = useState(null); // { bookingId, amount }

  const activeBookings = bookings.map(b => ({
    ...b,
    provider: providers.find(p => p.id === b.providerId)
  }));

  const handleDownloadReceipt = (booking) => {
    alert(`Downloading Official MY DAY Receipt & Booking Confirmation for ${booking.provider?.name || 'Vendor'} (Ref: ${booking.id})`);
  };

  return (
    <div className="container py-8">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-dark)', marginBottom: '0.25rem' }}>
            My Wedding Bookings & Receipts
          </h1>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            Manage reserved vendors for {wedding.title || "John & Sarah's Wedding"}
          </p>
        </div>

        <Link
          to="/marketplace"
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
            padding: '0.6rem 1.2rem',
            borderRadius: '0.5rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <PlusCircle size={16} /> Book More Vendors
        </Link>
      </div>

      {activeBookings.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius)',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          border: '1px solid #EAE7E1'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💒</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Bookings Yet</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            You haven't reserved any wedding services yet. Browse our verified vendors across Venues, Catering, Decorators, MCs, Beauty, and Transport.
          </p>
          <Link to="/marketplace" className="button">Browse Marketplace</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeBookings.map(b => (
            <div
              key={b.id}
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius)',
                padding: '1.5rem',
                border: '1px solid #EAE7E1',
                boxShadow: 'var(--shadow-sm)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{
                    background: 'var(--color-muted)',
                    color: 'var(--color-dark)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {b.category}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#777', fontFamily: 'monospace' }}>
                    Ref: {b.id}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.3rem', color: 'var(--color-dark)', marginBottom: '0.35rem' }}>
                  {b.provider?.name || 'Vendor'}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                  <MapPin size={14} color="var(--color-primary)" /> {b.provider?.location}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={14} color="var(--color-primary)" /> Contact: {b.provider?.contact || '+255 700 000 000'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.2rem' }}>Reserved Wedding Date</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-dark)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  <Calendar size={16} color="var(--color-primary)" /> {b.date}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#E8F5E9', color: '#2E7D32', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '1rem' }}>
                  <CheckCircle2 size={13} /> Status: {b.status.toUpperCase()}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>Total Service Cost</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                  TSh {b.price.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.75rem' }}>
                  Paid: <strong style={{ color: 'var(--color-success)' }}>TSh {(b.paidAmount || 0).toLocaleString()}</strong>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleDownloadReceipt(b)}
                    style={{
                      background: '#F4F2EE',
                      color: '#333',
                      fontSize: '0.8rem',
                      padding: '0.45rem 0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Download size={14} /> Download Receipt
                  </button>

                  {b.price > (b.paidAmount || 0) && (
                    <button
                      onClick={() => setActivePayment({ bookingId: b.id, amount: b.price - (b.paidAmount || 0) })}
                      style={{
                        background: 'var(--color-dark)',
                        color: '#fff',
                        fontSize: '0.8rem',
                        padding: '0.45rem 0.75rem'
                      }}
                    >
                      Pay Remaining (TSh {(b.price - (b.paidAmount || 0)).toLocaleString()})
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activePayment && (
        <PaymentModal
          bookingId={activePayment.bookingId}
          amount={activePayment.amount}
          isFullPayment={true}
          onClose={() => setActivePayment(null)}
          onSuccess={() => setActivePayment(null)}
        />
      )}
    </div>
  );
}

export default MyBookingsPage;
