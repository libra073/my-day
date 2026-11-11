import { useSparkleBurst } from './motion/MotionSparkles';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import StarRating from './StarRating';
import BookingModal from './BookingModal';
import PaymentModal from './PaymentModal';
import { MapPin, Heart, ShieldCheck } from 'lucide-react';
import { setSharedTransition } from '../lib/sharedTransition';

export default function ProviderCard({ provider }) {
  const { t, isLoggedIn, openAuthPrompt } = useAppContext();
  const { id, name, location, category, image, rating = 4.8, reviewsCount = 18, isFeatured } = provider;

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activePayment, setActivePayment] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const { triggerSparkles, SparkleOverlay } = useSparkleBurst();

  // Price formatting
  let priceDisplay = '';
  if (category === 'kumbi') {
    priceDisplay = `TSh ${(provider.pricePerDay || 2000000).toLocaleString()}/${t('per_day')}`;
  } else if (category === 'catering') {
    priceDisplay = `TSh ${(provider.pricePerPerson || 25000).toLocaleString()}/${t('per_person')}`;
  } else if (category === 'transport') {
    priceDisplay = `TSh ${(provider.pricePerDay || 500000).toLocaleString()}/${t('per_day')}`;
  } else if (provider.pricePerEvent) {
    priceDisplay = `TSh ${provider.pricePerEvent.toLocaleString()}/${t('per_event')}`;
  } else if (provider.packages && provider.packages.length) {
    priceDisplay = `${t('from_price')} TSh ${provider.packages[0].price.toLocaleString()}`;
  } else {
    priceDisplay = `TSh 500,000`;
  }

  const defaultImage = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="dash-vendor-card provider-card-wrapper glass-slab glass-card interactive-glass" style={{
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      borderRadius: '20px',
      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      
      {/* Top Banner Image Container — Inset Optical Glass Frame */}
      <div className="pcard-image-frame" style={{
        position: 'relative',
        height: '164px',
        margin: '0.55rem 0.55rem 0',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.28)',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(0, 102, 238, 0.08) 0%, rgba(15, 23, 42, 0.12) 100%)'
      }}>
        <img 
          src={image || defaultImage} 
          alt={name}
          loading="lazy"
          decoding="async"
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

        {/* Top Glass Specular Meniscus */}
        <div className="card-specular-meniscus" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1.5px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.1) 100%)',
          zIndex: 3,
          pointerEvents: 'none'
        }} />

        {/* Dark Vignette Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.55) 0%, transparent 60%)'
        }} />

        {/* Featured Badge */}
        {isFeatured && (
          <span className="pcard-featured glass-lens" style={{
            position: 'absolute',
            top: '0.65rem',
            left: '0.65rem',
            fontSize: '0.65rem',
            fontWeight: 800,
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-pill)',
            zIndex: 2,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {t('featured')}
          </span>
        )}

        {/* Verified Badge */}
        <span className="pcard-verified glass-lens" style={{
          position: 'absolute',
          bottom: '0.65rem',
          left: '0.65rem',
          fontSize: '0.68rem',
          fontWeight: 800,
          padding: '0.2rem 0.55rem',
          borderRadius: 'var(--radius-pill)',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <ShieldCheck size={12} color="#10b981" /> {t('verified')}
        </span>

        {/* Favorite Heart Button with Elastic Pop and Sparkle Burst */}
        <button
          onClick={(e) => {
            if (!isLoggedIn) {
              openAuthPrompt({
                onAuthenticated: () => setIsLiked(true)
              });
              return;
            }
            if (!isLiked) {
              triggerSparkles(e);
            }
            setIsLiked(!isLiked);
          }}
          className={`btn-favorite-heart ${isLiked ? 'is-liked' : ''} motion-sparkles-host glass-lens`}
          style={{
            position: 'absolute',
            top: '0.65rem',
            right: '0.65rem',
            width: 32,
            height: 32,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
            padding: 0
          }}
          aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={15} color={isLiked ? '#38BDF8' : '#FFFFFF'} fill={isLiked ? '#0071E3' : 'none'} />
          <SparkleOverlay />
        </button>
      </div>

      {/* Card Details Section */}
      <div style={{
        padding: '0.85rem 1rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'space-between'
      }}>
        <div>
          {/* Header Title & Rating */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              lineHeight: 1.3,
              margin: 0
            }}>
              {name}
            </h3>
          </div>

          {/* Location & Reviews */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              <MapPin size={13} color="var(--color-primary, #0071E3)" />
              <span>{location}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: 800, color: 'var(--app-text-primary, #0f172a)' }}>
              <StarRating rating={rating} size={13} showText={false} />
              <span>{rating}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', fontWeight: 500 }}>({reviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Pricing & Booking Action Footer */}
        <div style={{ borderTop: '1px solid var(--glass-border-subtle, rgba(0, 102, 238, 0.12))', paddingTop: '0.55rem', marginTop: '0.25rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('starting_price')}
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginTop: '0.2rem'
          }}>
            <div style={{
              fontSize: '1rem',
              fontWeight: 900,
              color: 'var(--app-text-primary, #0f172a)',
              lineHeight: 1.2
            }}>
              {priceDisplay}
            </div>

            <div style={{
              display: 'flex',
              gap: '0.45rem',
              width: '100%'
            }}>
              <Link 
                to={`/vendor/${category}/${id}`}
                onClick={(e) => {
                  const img = e.currentTarget
                    .closest('.dash-vendor-card')
                    ?.querySelector('.pcard-image-frame img');
                  if (!img) return;
                  setSharedTransition({
                    rect: img.getBoundingClientRect(),
                    src: img.currentSrc || img.src,
                  });
                }}
                className="btn-liquid-white"
                style={{
                  flex: '1 1 0',
                  minWidth: '0',
                  padding: '0.5rem 0.4rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'var(--app-text-primary, #0f172a)',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none'
                }}
              >
                {t('view_profile')}
              </Link>

              <button 
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    openAuthPrompt({
                      onAuthenticated: () => setShowBookingModal(true)
                    });
                    return;
                    }
                  setShowBookingModal(true);
                }}
                className="btn-primary glass-puck btn-sweep"
                style={{
                  flex: '1 1 0',
                  minWidth: '0',
                  padding: '0.5rem 0.4rem',
                  fontSize: '0.78rem',
                  fontWeight: 850,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  borderRadius: '9999px'
                }}
              >
                {t('book_now')}
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
          onSuccess={(bookingId, depositAmount) => {
            setShowBookingModal(false);
            setActivePayment({ bookingId, depositAmount });
          }}
        />
      )}

      {activePayment && (
        <PaymentModal 
          bookingId={activePayment.bookingId}
          amount={activePayment.depositAmount}
          onClose={() => setActivePayment(null)} 
        />
      )}
    </div>
  );
}
