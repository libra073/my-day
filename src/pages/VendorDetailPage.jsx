import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import StarRating from '../components/StarRating';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import BookingModal from '../components/BookingModal';
import PaymentModal from '../components/PaymentModal';
import { MapPin, Phone, CheckCircle, ShieldCheck, ArrowLeft } from 'lucide-react';

function VendorDetailPage() {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const { providers, wedding } = useAppContext();

  const provider = providers.find(p => p.id === id);

  const [selectedDate, setSelectedDate] = useState(wedding.date || '2026-12-25');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activePaymentBooking, setActivePaymentBooking] = useState(null); // { bookingId, depositAmount }

  if (!provider) {
    return (
      <div className="container py-12 text-center">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Vendor Not Found</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>The vendor you are looking for does not exist or has been removed.</p>
        <Link to="/marketplace" className="button">Return to Marketplace</Link>
      </div>
    );
  }

  const handleBookingSuccess = (bookingId, depositAmount) => {
    setShowBookingModal(false);
    // Directly launch Payment Modal for instant 30% deposit payment
    setActivePaymentBooking({ bookingId, depositAmount });
  };

  const handlePaymentSuccess = () => {
    setActivePaymentBooking(null);
    navigate('/dashboard');
  };

  return (
    <div className="container py-8">
      <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to Marketplace
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Details Left Column */}
        <div>
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)', border: '1px solid #EAE7E1', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  background: 'var(--color-muted)',
                  color: 'var(--color-dark)',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '0.25rem',
                  marginBottom: '0.5rem'
                }}>
                  {provider.category}
                </span>
                <h1 style={{ fontSize: '2rem', color: 'var(--color-dark)', lineHeight: 1.2, marginBottom: '0.5rem' }}>
                  {provider.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={16} color="var(--color-primary)" /> {provider.location}
                  </span>
                  <StarRating rating={4.9} count={24} />
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>Starting Price</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {provider.pricePerDay && `TSh ${provider.pricePerDay.toLocaleString()}/day`}
                  {provider.pricePerPerson && `TSh ${provider.pricePerPerson.toLocaleString()}/person`}
                  {provider.pricePerEvent && `TSh ${provider.pricePerEvent.toLocaleString()}/event`}
                  {provider.packages && provider.packages.length > 0 && `TSh ${provider.packages[0].price.toLocaleString()}`}
                </div>
              </div>
            </div>

            <p style={{ color: '#444', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {provider.description || `${provider.name} is one of the top rated ${provider.category} providers in ${provider.location}, specializing in creating memorable wedding experiences.`}
            </p>

            {/* Category specific details */}
            {provider.category === 'kumbi' && (
              <div style={{ background: '#FAF9F6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #EAE7E1' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-dark)' }}>Venue Specs & Amenities</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  <div><strong>Capacity:</strong> {provider.capacity} Guests</div>
                  <div><strong>Rules:</strong> {provider.rules || 'Standard Guidelines'}</div>
                </div>
                {provider.facilities && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {provider.facilities.map(f => (
                      <span key={f} style={{ background: '#fff', border: '1px solid #DDD', padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', color: '#555' }}>
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {provider.category === 'catering' && provider.menuSamples && (
              <div style={{ background: '#FAF9F6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #EAE7E1' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-dark)' }}>Sample Menu Included</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {provider.menuSamples.map(item => (
                    <span key={item} style={{ background: '#fff', border: '1px solid #C8E6C9', color: '#2E7D32', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      🍽️ {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Packages Section */}
            {provider.packages && provider.packages.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Available Packages</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {provider.packages.map(pkg => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      style={{
                        background: selectedPackage?.id === pkg.id ? '#FFFBF0' : '#ffffff',
                        border: selectedPackage?.id === pkg.id ? '2px solid var(--color-primary)' : '1px solid #E0DDD7',
                        borderRadius: '0.5rem',
                        padding: '1.25rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{pkg.name}</h4>
                        {selectedPackage?.id === pkg.id && <CheckCircle size={18} color="var(--color-primary)" />}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                        TSh {pkg.price.toLocaleString()}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>
                        {pkg.description || (pkg.services ? pkg.services.join(' • ') : 'Full professional package included.')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid #EAE7E1', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#666' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={16} color="var(--color-primary)" /> Verified Provider Contact: {provider.contact || '+255 700 000 000'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-success)', fontWeight: 600 }}>
                <ShieldCheck size={16} /> MY DAY Buyer Protection Guarantee
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Calendar & Booking Callout */}
        <div>
          <div style={{ position: 'sticky', top: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--color-dark)' }}>Check Date Availability</h3>
            <AvailabilityCalendar
              unavailableDates={provider.unavailableDates || []}
              selectedDate={selectedDate}
              onSelectDate={dateISO => setSelectedDate(dateISO)}
            />

            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius)',
              padding: '1.25rem',
              marginTop: '1rem',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid #EAE7E1',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.35rem' }}>Selected Wedding Date</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-dark)', marginBottom: '1rem' }}>
                {selectedDate || 'No date selected'}
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                style={{
                  width: '100%',
                  background: 'var(--color-primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  padding: '0.85rem'
                }}
              >
                Reserve Now (30% Deposit)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          provider={provider}
          selectedPackage={selectedPackage}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Payment Modal */}
      {activePaymentBooking && (
        <PaymentModal
          bookingId={activePaymentBooking.bookingId}
          amount={activePaymentBooking.depositAmount}
          onClose={() => setActivePaymentBooking(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default VendorDetailPage;
