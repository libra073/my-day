import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import StarRating from '../components/StarRating';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import BookingModal from '../components/BookingModal';
import PaymentModal from '../components/PaymentModal';
import AppointmentModal from '../components/AppointmentModal';
import { getEffectiveVendorSchedule, getCurrentOfficeStatus } from '../services/businessSchedule';
import { MapPin, Phone, CheckCircle, ShieldCheck, ArrowLeft, Clock, CalendarCheck } from 'lucide-react';

function VendorDetailPage() {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const { providers, wedding, t, language } = useAppContext();

  const provider = providers.find(p => p.id === id);

  const [selectedDate, setSelectedDate] = useState(wedding?.date || '');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [activePaymentBooking, setActivePaymentBooking] = useState(null);

  const vendorSchedule = provider ? getEffectiveVendorSchedule(provider) : null;
  const vendorStatus = vendorSchedule ? getCurrentOfficeStatus(new Date(), vendorSchedule) : null;

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

      <div className="vendor-detail-grid">
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
                  <StarRating rating={provider.rating || 5.0} count={provider.reviewsCount || 0} />
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
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                ✨ Couples can book & reserve dates 24/7 anytime.
              </div>
            </div>

            {/* Vendor Business Operating Schedule Card */}
            <div style={{
              ...glassCard,
              padding: '1.25rem',
              marginTop: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                  <Clock size={16} color="var(--color-primary)" /> Business Hours
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-pill)',
                  background: vendorStatus?.isOpen ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                  color: vendorStatus?.isOpen ? '#15803d' : '#b91c1c',
                  border: `1px solid ${vendorStatus?.isOpen ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.25)'}`,
                }}>
                  ● {vendorStatus?.isOpen ? 'Open Now' : 'Closed Now'}
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                Timezone: <strong>Africa/Dar_es_Salaam (EAT, UTC+3)</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Monday – Friday:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    {vendorSchedule?.workingHours?.open || '08:00'} – {vendorSchedule?.workingHours?.close || '17:00'} EAT
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Saturday:</span>
                  <span style={{ fontWeight: 600, color: vendorSchedule?.workingDays?.includes(6) ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {vendorSchedule?.workingDays?.includes(6)
                      ? `${vendorSchedule.specialHours?.['6']?.open || vendorSchedule.workingHours.open} – ${vendorSchedule.specialHours?.['6']?.close || vendorSchedule.workingHours.close} EAT`
                      : 'Closed'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Sunday:</span>
                  <span style={{ fontWeight: 600, color: vendorSchedule?.workingDays?.includes(0) ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {vendorSchedule?.workingDays?.includes(0) ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAppointmentModal(true)}
                style={{
                  width: '100%',
                  background: 'var(--color-surface-soft)',
                  color: 'var(--color-primary-hover)',
                  border: '1px solid var(--color-primary)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                <CalendarCheck size={16} /> Book Consultation / Tasting
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal provider={provider} selectedPackage={selectedPackage} onClose={() => setShowBookingModal(false)} onSuccess={handleBookingSuccess} />
      )}
      {showAppointmentModal && (
        <AppointmentModal
          provider={provider}
          onClose={() => setShowAppointmentModal(false)}
          onSuccess={(newAppt) => {
            setShowAppointmentModal(false);
            alert(`Appointment scheduled successfully with ${provider.name} for ${newAppt.date} at ${newAppt.startTime} EAT!`);
          }}
        />
      )}
      {activePaymentBooking && (
        <PaymentModal bookingId={activePaymentBooking.bookingId} amount={activePaymentBooking.depositAmount} onClose={() => setActivePaymentBooking(null)} onSuccess={handlePaymentSuccess} />
      )}
    </div>
  );
}

export default VendorDetailPage;
