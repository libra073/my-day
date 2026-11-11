import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import StarRating from '../components/StarRating';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import BookingModal from '../components/BookingModal';
import PaymentModal from '../components/PaymentModal';
import AppointmentModal from '../components/AppointmentModal';
import VendorPortfolio from '../components/VendorPortfolio';
import { peekSharedTransition, clearSharedTransition } from '../lib/sharedTransition';
import { getEffectiveVendorSchedule, getCurrentOfficeStatus, getTodayDarEsSalaam, isPastDateInDarEsSalaam } from '../services/businessSchedule';
import { MapPin, Phone, CheckCircle, ShieldCheck, ArrowLeft, Clock, CalendarCheck } from 'lucide-react';

function VendorDetailPage() {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const { providers, wedding, isLoggedIn, openAuthPrompt, language = 'en' } = useAppContext();

  const provider = providers.find(p => p.id === id);

  // fly the card photograph into the hero (shared-element transition)
  useEffect(() => {
    const handoff = peekSharedTransition();
    if (!handoff) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      clearSharedTransition();
      return undefined;
    }

    let cancelled = false;
    let overlay = null;
    let heroImg = null;
    let attempts = 0;

    const detach = () => {
      if (heroImg) heroImg.style.opacity = '';
      if (overlay) {
        overlay.remove();
        overlay = null;
      }
    };

    // a finished flight can't be replayed; an interrupted one still can
    const finish = () => {
      detach();
      clearSharedTransition();
    };

    const run = (img) => {
      if (cancelled) return;
      const box = img.getBoundingClientRect();
      if (!box.width || !box.height) return;

      overlay = document.createElement('img');
      overlay.src = handoff.src;
      overlay.alt = '';
      overlay.className = 'shared-flight';
      Object.assign(overlay.style, {
        position: 'fixed',
        left: box.left + 'px',
        top: box.top + 'px',
        width: box.width + 'px',
        height: box.height + 'px',
        objectFit: 'cover',
        borderRadius: '22px',
        zIndex: 90,
        pointerEvents: 'none',
        willChange: 'transform, border-radius',
      });
      document.body.appendChild(overlay);

      const dx = handoff.rect.left - box.left;
      const dy = handoff.rect.top - box.top;
      const sx = handoff.rect.width / box.width;
      const sy = handoff.rect.height / box.height;

      heroImg = img;
      img.style.opacity = '0';

      const animation = overlay.animate(
        [
          { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(' + sx + ', ' + sy + ')', borderRadius: '16px' },
          { transform: 'translate(0px, 0px) scale(1, 1)', borderRadius: '22px' },
        ],
        { duration: 520, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' }
      );
      animation.onfinish = finish;
      animation.oncancel = finish;
    };

    // providers can arrive a tick after mount — wait for the hero photo to exist
    const seek = () => {
      if (cancelled) return;
      const img = document.querySelector('.vd-hero img');
      if (img) {
        if (img.complete && img.naturalWidth) run(img);
        else img.addEventListener('load', () => run(img), { once: true });
        return;
      }
      if (attempts++ < 90) requestAnimationFrame(seek);
    };
    seek();

    return () => {
      cancelled = true;
      detach();
    };
  }, []);

  const [selectedDate, setSelectedDate] = useState(() => {
    const todayStr = getTodayDarEsSalaam();
    if (wedding?.date && typeof wedding.date === 'string' && wedding.date >= todayStr) {
      return wedding.date;
    }
    return '';
  });
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [activePaymentBooking, setActivePaymentBooking] = useState(null);

  const handleOpenBooking = () => {
    if (!isLoggedIn) {
      openAuthPrompt({
        onAuthenticated: () => setShowBookingModal(true)
      });
      return;
    }
    setShowBookingModal(true);
  };

  const handleOpenAppointment = () => {
    if (!isLoggedIn) {
      openAuthPrompt({
        onAuthenticated: () => setShowAppointmentModal(true)
      });
      return;
    }
    setShowAppointmentModal(true);
  };

  const vendorSchedule = provider ? getEffectiveVendorSchedule(provider) : null;
  const vendorStatus = vendorSchedule ? getCurrentOfficeStatus(new Date(), vendorSchedule) : null;

  if (!provider) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
          {language === 'sw' ? 'Mtoa Huduma Hajapatikana' : 'Vendor Not Found'}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {language === 'sw' ? 'Mtoa huduma unayemtafuta hayupo au ameondolewa.' : 'The vendor you are looking for does not exist or has been removed.'}
        </p>
        <Link to="/marketplace" className="button">
          {language === 'sw' ? 'Rudi Sokoni' : 'Return to Marketplace'}
        </Link>
      </div>
    );
  }

  const handleBookingSuccess = (bookingId, depositAmount) => { setShowBookingModal(false); setActivePaymentBooking({ bookingId, depositAmount }); };
  const handlePaymentSuccess = () => { setActivePaymentBooking(null); navigate('/dashboard'); };

  const glassCard = {
    borderRadius: '28px',
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
        <ArrowLeft size={16} /> {language === 'sw' ? 'Rudi Sokoni' : 'Back to Marketplace'}
      </Link>

      <div className="vendor-detail-grid">
        {/* Main Details Left Column */}
        <div>
          <div className="vd-card vd-main-card" style={{ ...glassCard, padding: '1.75rem', marginBottom: '1.5rem' }}>
            {provider.photos?.[0] && (
              <div className="vd-hero">
                <img src={provider.photos[0]} alt={provider.name} loading="lazy" />
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span className="vd-cat-badge" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'rgba(0, 102, 238, 0.12)',
                  color: 'var(--color-primary, #0071E3)',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  marginBottom: '0.65rem',
                  border: '1px solid rgba(0, 102, 238, 0.22)',
                  boxShadow: 'none'
                }}>
                  {provider.category}
                </span>
                <h1 style={{ fontSize: '2.1rem', color: 'var(--app-text-primary, #0F172A)', lineHeight: 1.2, marginBottom: '0.5rem', fontWeight: 900, letterSpacing: '-0.025em' }}>
                  {provider.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={16} color="var(--color-primary, #0071E3)" /> {provider.location}
                  </span>
                  <StarRating rating={provider.rating || 5.0} count={provider.reviewsCount || 0} />
                </div>
              </div>

              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  {language === 'sw' ? 'Kuanzia Bei ya' : 'Starting Price'}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary, #0071E3)' }}>
                  {provider.pricePerDay && `TSh ${provider.pricePerDay.toLocaleString()}${language === 'sw' ? '/siku' : '/day'}`}
                  {provider.pricePerPerson && `TSh ${provider.pricePerPerson.toLocaleString()}${language === 'sw' ? '/mtu' : '/person'}`}
                  {provider.pricePerEvent && `TSh ${provider.pricePerEvent.toLocaleString()}${language === 'sw' ? '/sherehe' : '/event'}`}
                  {provider.packages && provider.packages.length > 0 && `TSh ${provider.packages[0].price.toLocaleString()}`}
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {provider.description || (language === 'sw'
                ? `${provider.name} ni miongoni mwa watoa huduma maarufu wa ${provider.category} jijini ${provider.location}, akibobea katika kuandaa sherehe za harusi zenye mafanikio.`
                : `${provider.name} is one of the top rated ${provider.category} providers in ${provider.location}, specializing in creating memorable wedding experiences.`)}
            </p>

            {/* Category specific details */}
            {provider.category === 'kumbi' && (
              <div className="vd-subcard" style={{ padding: '1.25rem', borderRadius: '20px', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-text)', fontWeight: 700 }}>
                  {language === 'sw' ? 'Vipimo vya Ukumbi & Huduma' : 'Venue Specs & Amenities'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
                  <div><strong>{language === 'sw' ? 'Uwezo:' : 'Capacity:'}</strong> {provider.capacity} {language === 'sw' ? 'Wageni' : 'Guests'}</div>
                  <div><strong>{language === 'sw' ? 'Masharti:' : 'Rules:'}</strong> {provider.rules || (language === 'sw' ? 'Miongozo ya Kawaida' : 'Standard Guidelines')}</div>
                </div>
                {provider.facilities && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {provider.facilities.map(f => (
                      <span key={f} className="vd-amenity-pill" style={{ padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 700 }}>✓ {f}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {provider.category === 'catering' && provider.menuSamples && (
              <div className="vd-subcard" style={{ padding: '1.25rem', borderRadius: '20px', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-text)', fontWeight: 700 }}>
                  {language === 'sw' ? 'Mfano wa Menyu ya Chakula' : 'Sample Menu Included'}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {provider.menuSamples.map(item => (
                    <span key={item} style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 700 }}>🍽️ {item}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio — their own photos first, topped up from the curated wall */}
            <VendorPortfolio provider={provider} />

            {/* Packages Section */}
            {provider.packages && provider.packages.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--color-text)', fontWeight: 700 }}>
                  {language === 'sw' ? 'Vifurushi Vinavyopatikana' : 'Available Packages'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
                  {provider.packages.map(pkg => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`vd-package-card ${selectedPackage?.id === pkg.id ? 'is-selected' : ''}`}
                      style={{
                        borderRadius: '20px',
                        padding: '1.25rem',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)' }}>{pkg.name}</h4>
                        {selectedPackage?.id === pkg.id && <CheckCircle size={18} color="var(--color-primary, #0071E3)" />}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary, #0071E3)', marginBottom: '0.5rem' }}>TSh {pkg.price.toLocaleString()}</div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                        {pkg.description || (pkg.services ? pkg.services.join(' • ') : (language === 'sw' ? 'Kifurushi kamili cha kitaalamu kimejumuishwa.' : 'Full professional package included.'))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                <Phone size={16} color="var(--color-primary, #0071E3)" /> {language === 'sw' ? 'Mawasiliano Yaliyothibitishwa:' : 'Verified Provider Contact:'} {provider.contact || '+255 700 000 000'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary, #0071E3)', fontWeight: 800 }}>
                <ShieldCheck size={16} color="var(--color-primary, #0071E3)" /> {language === 'sw' ? 'Ulinzi wa Malipo wa MY DAY' : 'MY DAY Buyer Protection Guarantee'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Calendar & Booking Callout */}
        <div>
          <div style={{ position: 'sticky', top: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--app-text-primary, #21143D)', fontWeight: 800 }}>
              {language === 'sw' ? 'Angalia Upatikanaji wa Tarehe' : 'Check Date Availability'}
            </h3>
            <AvailabilityCalendar
              unavailableDates={provider.unavailableDates || []}
              selectedDate={selectedDate}
              onSelectDate={dateISO => {
                if (!isPastDateInDarEsSalaam(dateISO)) {
                  setSelectedDate(dateISO);
                }
              }}
            />

            <div className="vd-card" style={{
              ...glassCard,
              padding: '1.25rem',
              marginTop: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                {language === 'sw' ? 'Tarehe ya Harusi Iliyochaguliwa' : 'Selected Wedding Date'}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--app-text-primary, #21143D)', marginBottom: '1rem' }}>
                {selectedDate || (language === 'sw' ? 'Hakuna tarehe iliyochaguliwa' : 'No date selected')}
              </div>
              <button onClick={handleOpenBooking} className="btn-primary btn-sweep" style={{
                width: '100%',
                fontWeight: 800,
                fontSize: '1rem',
                padding: '0.85rem'
              }}>
                {language === 'sw' ? 'Weka Nafasi Sasa (Dhamana 30%)' : 'Reserve Now (30% Deposit)'}
              </button>
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {language === 'sw' ? '✨ Mahrusi wanaweza kuhifadhi tarehe saa 24 wakati wowote.' : '✨ Couples can book & reserve dates 24/7 anytime.'}
              </div>
            </div>

            {/* Vendor Business Operating Schedule Card */}
            <div className="vd-card" style={{
              ...glassCard,
              padding: '1.25rem',
              marginTop: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                  <Clock size={16} color="var(--color-primary)" /> {language === 'sw' ? 'Saa za Kazi' : 'Business Hours'}
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
                  ● {vendorStatus?.isOpen ? (language === 'sw' ? 'Wazi Sasa' : 'Open Now') : (language === 'sw' ? 'Imefungwa Sasa' : 'Closed Now')}
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                {language === 'sw' ? 'Saa za Eneo: Africa/Dar_es_Salaam (EAT, UTC+3)' : 'Timezone: Africa/Dar_es_Salaam (EAT, UTC+3)'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {language === 'sw' ? 'Jumatatu – Ijumaa:' : 'Monday – Friday:'}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    {vendorSchedule?.workingHours?.open || '08:00'} – {vendorSchedule?.workingHours?.close || '17:00'} EAT
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {language === 'sw' ? 'Jumamosi:' : 'Saturday:'}
                  </span>
                  <span style={{ fontWeight: 600, color: vendorSchedule?.workingDays?.includes(6) ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {vendorSchedule?.workingDays?.includes(6)
                      ? `${vendorSchedule.specialHours?.['6']?.open || vendorSchedule.workingHours.open} – ${vendorSchedule.specialHours?.['6']?.close || vendorSchedule.workingHours.close} EAT`
                      : (language === 'sw' ? 'Imefungwa' : 'Closed')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {language === 'sw' ? 'Jumapili:' : 'Sunday:'}
                  </span>
                  <span style={{ fontWeight: 600, color: vendorSchedule?.workingDays?.includes(0) ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {vendorSchedule?.workingDays?.includes(0) ? (language === 'sw' ? 'Wazi' : 'Open') : (language === 'sw' ? 'Imefungwa' : 'Closed')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAppointment}
                className="btn-liquid-white"
                style={{
                  width: '100%',
                  color: 'var(--app-text-primary, #0f172a)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem'
                }}
              >
                <CalendarCheck size={16} color="var(--color-primary, #0071E3)" /> {language === 'sw' ? 'Panga Kikao cha Ushauri / Kuonja' : 'Book Consultation / Tasting'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          provider={provider}
          selectedPackage={selectedPackage}
          initialDate={selectedDate}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
      {showAppointmentModal && (
        <AppointmentModal
          provider={provider}
          onClose={() => setShowAppointmentModal(false)}
          onSuccess={(newAppt) => {
            setShowAppointmentModal(false);
            alert(language === 'sw'
              ? `Miadi imepangwa kwa mafanikio na ${provider.name} kwa tarehe ${newAppt.darDate || newAppt.date} saa ${newAppt.darStartTime || newAppt.startTime} EAT!`
              : `Appointment scheduled successfully with ${provider.name} for ${newAppt.darDate || newAppt.date} at ${newAppt.darStartTime || newAppt.startTime} EAT!`);
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
