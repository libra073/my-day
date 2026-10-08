import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import StarRating from './StarRating';
import BookingModal from './BookingModal';
import PaymentModal from './PaymentModal';
import { MapPin, Heart, ShieldCheck } from 'lucide-react';

export default function ProviderCard({ provider }) {
  const { id, name, location, category, image, rating = 4.8, reviewsCount = 18, isFeatured } = provider;

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activePayment, setActivePayment] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  // Price formatting
  let priceDisplay = '';
  if (category === 'kumbi') {
    priceDisplay = `TSh ${(provider.pricePerDay || 2000000).toLocaleString()}/day`;
  } else if (category === 'catering') {
    priceDisplay = `TSh ${(provider.pricePerPerson || 25000).toLocaleString()}/person`;
  } else if (category === 'transport') {
    priceDisplay = `TSh ${(provider.pricePerDay || 500000).toLocaleString()}/day`;
  } else if (provider.pricePerEvent) {
    priceDisplay = `TSh ${provider.pricePerEvent.toLocaleString()}/event`;
  } else if (provider.packages && provider.packages.length) {
    priceDisplay = `From TSh ${provider.packages[0].price.toLocaleString()}`;
  } else {
    priceDisplay = `TSh 500,000`;
  }

  const defaultImage = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="card" style={{
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      borderRadius: 'var(--radius-lg)',
      background: '#FFFFFF',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid #E8DCCF',
      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      
      {/* Top Banner Image Container */}
      <div style={{
        position: 'relative',
        height: '210px',
        overflow: 'hidden',
        background: '#3D2C1F'
      }}>
        <img 
          src={image || defaultImage} 
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          className="card-img-zoom"
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />

        {/* Dark Vignette Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)'
        }} />

        {/* Featured Badge */}
        {isFeatured && (
          <span style={{
            position: 'absolute',
            top: '0.85rem',
            left: '0.85rem',
            background: 'var(--color-primary)',
            color: '#FFFFFF',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-pill)',
            zIndex: 2,
            boxShadow: 'var(--shadow-amber)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            Featured
          </span>
        )}

        {/* Verified Badge */}
        <span style={{
          position: 'absolute',
          bottom: '0.85rem',
          left: '0.85rem',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          color: '#2E7D32',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '0.25rem 0.65rem',
          borderRadius: 'var(--radius-pill)',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}>
          <ShieldCheck size={14} color="#2E7D32" /> Verified Vendor
        </span>

        {/* Favorite Heart Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          style={{
            position: 'absolute',
            top: '0.85rem',
            right: '0.85rem',
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'transform 0.2s ease',
            padding: 0
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.85)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart size={18} color={isLiked ? '#E53E3E' : '#5C4331'} fill={isLiked ? '#E53E3E' : 'none'} />
        </button>
      </div>

      {/* Card Details Section */}
      <div style={{
        padding: '1.25rem 1.25rem 1.4rem',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'space-between'
      }}>
        <div>
          {/* Header Title & Rating */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
            <h3 style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              lineHeight: 1.3,
              margin: 0
            }}>
              {name}
            </h3>
          </div>

          {/* Location & Reviews */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              <MapPin size={14} color="#F5A623" />
              <span>{location}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 700, color: '#3D2C1F' }}>
              <StarRating rating={rating} />
              <span>{rating}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-dim)', fontWeight: 400 }}>({reviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Pricing & Booking Action Footer */}
        <div style={{ borderTop: '1px solid #F0E8DF', paddingTop: '0.85rem', marginTop: '0.5rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Starting Price
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#3D2C1F' }}>
              {priceDisplay}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <Link 
                to={`/vendor/${category}/${id}`}
                className="button"
                style={{
                  background: 'transparent',
                  border: '1.5px solid #E8DCCF',
                  color: '#5C4331',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  boxShadow: 'none'
                }}
              >
                View
              </Link>

              <button 
                onClick={() => setShowBookingModal(true)}
                className="btn-pill-amber"
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 800
                }}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBookingModal && (
        <BookingModal 
          provider={provider} 
          onClose={() => setShowBookingModal(false)}
          onProceedToPayment={(booking) => {
            setShowBookingModal(false);
            setActivePayment(booking);
          }}
        />
      )}

      {activePayment && (
        <PaymentModal 
          booking={activePayment} 
          onClose={() => setActivePayment(null)} 
        />
      )}
    </div>
  );
}
