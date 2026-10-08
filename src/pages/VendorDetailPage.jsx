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
  const [activePaymentBooking, setActivePaymentBooking] = useState(null);

  if (!provider) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-text)' }}>Vendor Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>The vendor you are looking for does not exist or has been removed.</p>
        <Link to="/marketplace" className="button">Return to Marketplace</Link>
      </div>
    );
  }

  const handleBookingSuccess = (bookingId, depositAmount) => { setShowBookingModal(false); setActivePaymentBooking({ bookingId, depositAmount }); };
  const handlePaymentSuccess = () => { setActivePaymentBooking(null); navigate('/dashboard'); };

  const glassCard = { background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Marketplace
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Details Left Column */}
        <div>
          <div style={{ ...glassCard, padding: '1.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary-hover)',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-pill)',
                  marginBottom: '0.5rem',
                  border: '1px solid rgba(255, 157, 59, 0.3)',
                }}>
                  {provider.category}
                </span>
                <h1 style={{ fontSize: '2rem', color: 'var(--color-text)', lineHeight: 1.2, marginBottom: '0.5rem', fontWeight: 800 }}>
                  {provider.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={16} color="var(--color-primary)" /> {provider.location}
                  </span>
                  <StarRating rating={4.9} count={24} />
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Starting Price</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-hover)' }}>
                  {provider.pricePerDay && `TSh ${provider.pricePerDay.toLocaleString()}/day`}
                  {provider.pricePerPerson && `TSh ${provider.pricePerPerson.toLocaleString()}/person`}
                  {provider.pricePerEvent && `TSh ${provider.pricePerEvent.toLocaleString()}/event`}
                  {provider.packages && provider.packages.length > 0 && `TSh ${provider.packages[0].price.toLocaleString()}`}
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {provider.description || `${provider.name} is one of the top rated ${provider.category} providers in ${provider.location}, specializing in creating memorable wedding experiences.`}
            </p>

            {/* Category specific details */}
            {provider.category === 'kumbi' && (
              <div style={{ background: 'var(--color-surface-soft)', padding: '1.25rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-text)', fontWeight: 700 }}>Venue Specs & Amenities</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
                  <div><strong>Capacity:</strong> {provider.capacity} Guests</div>
                  <div><strong>Rules:</strong> {provider.rules || 'Standard Guidelines'}</div>
                </div>
                {provider.facilities && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {provider.facilities.map(f => (
                      <span key={f} style={{ background: '#FFFFFF', border: '1px solid var(--color-border)', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600 }}>✓ {f}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {provider.category === 'catering' && provider.menuSamples && (
              <div style={{ background: 'var(--color-surface-soft)', padding: '1.25rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-text)', fontWeight: 700 }}>Sample Menu Included</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {provider.menuSamples.map(item => (
                    <span key={item} style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 700 }}>🍽️ {item}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Packages Section */}
            {provider.packages && provider.packages.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--color-text)', fontWeight: 700 }}>Available Packages</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {provider.packages.map(pkg => (
                    <div key={pkg.id} onClick={() => setSelectedPackage(pkg)} style={{
                      background: selectedPackage?.id === pkg.id ? 'var(--color-primary-light)' : '#FFFFFF',
                      border: selectedPackage?.id === pkg.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius)', padding: '1.25rem', cursor: 'pointer', transition: 'var(--transition)',
                      boxShadow: selectedPackage?.id === pkg.id ? 'var(--shadow-glow)' : 'var(--shadow-xs)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)' }}>{pkg.name}</h4>
                        {selectedPackage?.id === pkg.id && <CheckCircle size={18} color="var(--color-primary)" />}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-hover)', marginBottom: '0.5rem' }}>TSh {pkg.price.toLocaleString()}</div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                        {pkg.description || (pkg.services ? pkg.services.join(' • ') : 'Full professional package included.')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={16} color="var(--color-primary)" /> Verified Provider Contact: {provider.contact || '+255 700 000 000'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-success)', fontWeight: 700 }}>
                <ShieldCheck size={16} /> MY DAY Buyer Protection Guarantee
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Calendar & Booking Callout */}
        <div>
          <div style={{ position: 'sticky', top: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--color-text)', fontWeight: 700 }}>Check Date Availability</h3>
            <AvailabilityCalendar
              unavailableDates={provider.unavailableDates || []}
              selectedDate={selectedDate}
              onSelectDate={dateISO => setSelectedDate(dateISO)}
            />

            <div style={{
              ...glassCard,
              padding: '1.25rem',
              marginTop: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>Selected Wedding Date</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>{selectedDate || 'No date selected'}</div>
              <button onClick={() => setShowBookingModal(true)} style={{
                width: '100%',
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                fontWeight: 700, fontSize: '1rem', padding: '0.85rem',
                borderRadius: 'var(--radius-pill)',
                boxShadow: 'var(--shadow-glow)',
              }}>
                Reserve Now (30% Deposit)
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal provider={provider} selectedPackage={selectedPackage} onClose={() => setShowBookingModal(false)} onSuccess={handleBookingSuccess} />
      )}
      {activePaymentBooking && (
        <PaymentModal bookingId={activePaymentBooking.bookingId} amount={activePaymentBooking.depositAmount} onClose={() => setActivePaymentBooking(null)} onSuccess={handlePaymentSuccess} />
      )}
    </div>
  );
}

export default VendorDetailPage;
