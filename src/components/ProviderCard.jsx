import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import BookingModal from './BookingModal';
import PaymentModal from './PaymentModal';
import { MapPin, Calendar, CheckCircle2 } from 'lucide-react';

function ProviderCard({ provider }) {
  const { id, name, location, category, image, rating = 4.8, reviewsCount = 18, isFeatured } = provider;

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activePayment, setActivePayment] = useState(null);

  // Price formatting
  let priceDisplay = '';
  if (category === 'kumbi') priceDisplay = `TSh ${(provider.pricePerDay || 2000000).toLocaleString()}/day`;
  else if (category === 'catering') priceDisplay = `TSh ${(provider.pricePerPerson || 25000).toLocaleString()}/person`;
  else if (category === 'transport') priceDisplay = `TSh ${(provider.pricePerDay || 500000).toLocaleString()}/day`;
  else if (provider.pricePerEvent) priceDisplay = `TSh ${provider.pricePerEvent.toLocaleString()}/event`;
  else if (provider.packages && provider.packages.length) priceDisplay = `From TSh ${provider.packages[0].price.toLocaleString()}`;
  else priceDisplay = `TSh 500,000`;

  const defaultImage = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="card" style={{
      background: '#ffffff',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      border: '1px solid #EAE7E1',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {isFeatured && (
        <span style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          background: 'var(--color-primary)',
          color: '#ffffff',
          fontSize: '0.7rem',
          fontWeight: 800,
          padding: '0.2rem 0.5rem',
          borderRadius: '0.25rem',
          zIndex: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          textTransform: 'uppercase'
        }}>
          Featured
        </span>
      )}

      {/* Image header */}
      <div style={{ height: 190, overflow: 'hidden', position: 'relative' }}>
        <img
          src={image || defaultImage}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <span style={{
          position: 'absolute',
          bottom: '0.5rem',
          right: '0.5rem',
          background: 'rgba(10, 46, 35, 0.85)',
          color: '#fff',
          fontSize: '0.7rem',
          fontWeight: 700,
          padding: '0.2rem 0.5rem',
          borderRadius: '0.25rem',
          textTransform: 'uppercase'
        }}>
          {category}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--color-dark)', marginBottom: '0.35rem', lineHeight: 1.3 }}>
          {name}
        </h3>

        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <MapPin size={14} color="var(--color-primary)" /> {location}
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <StarRating rating={rating} count={reviewsCount} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600, marginBottom: '0.75rem' }}>
          <CheckCircle2 size={13} /> Available for Booking
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #F0EEEA' }}>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>Starting Price</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            {priceDisplay}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <Link
              to={`/vendor/${category}/${id}`}
              style={{
                background: '#F4F2EE',
                color: 'var(--color-dark)',
                textAlign: 'center',
                padding: '0.55rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              View Profile
            </Link>
            <button
              onClick={() => setShowBookingModal(true)}
              style={{
                background: 'var(--color-primary)',
                color: '#ffffff',
                padding: '0.55rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: 'none'
              }}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          provider={provider}
          onClose={() => setShowBookingModal(false)}
          onSuccess={(bookingId, depositAmount) => {
            setShowBookingModal(false);
            setActivePayment({ bookingId, amount: depositAmount });
          }}
        />
      )}

      {activePayment && (
        <PaymentModal
          bookingId={activePayment.bookingId}
          amount={activePayment.amount}
          onClose={() => setActivePayment(null)}
          onSuccess={() => setActivePayment(null)}
        />
      )}
    </div>
  );
}

export default ProviderCard;
