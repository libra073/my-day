import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAiPlanner } from '../context/AiPlannerContext';
import { useAppContext } from '../context/AppContext';
import BookingModal from './BookingModal';
import PaymentModal from './PaymentModal';
import StarRating from './StarRating';
import { MapPin, CheckCircle, ExternalLink, Calendar, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AIVendorMatchesCard() {
  const navigate = useNavigate();
  const { vendorMatches, selectedVendors, selectVendor, deselectVendor } = useAiPlanner();
  const { language, t } = useAppContext();
  const isSwahili = language === 'sw';

  const [bookingVendor, setBookingVendor] = useState(null);
  const [activePaymentBooking, setActivePaymentBooking] = useState(null);

  if (!vendorMatches || !vendorMatches.categories || vendorMatches.categories.length === 0) {
    return null;
  }

  const handleBookingSuccess = (bookingId, depositAmount) => {
    setBookingVendor(null);
    setActivePaymentBooking({ bookingId, depositAmount });
  };

  const handlePaymentSuccess = () => {
    setActivePaymentBooking(null);
    navigate('/dashboard');
  };

  return (
    <div className="card" style={{
      padding: 'clamp(0.9rem, 3vw, 1.5rem)',
      marginTop: '1.25rem',
      background: '#FFFFFF',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
      minWidth: 0,
      width: '100%'
    }}>
      <div style={{ marginBottom: '1.25rem', minWidth: 0 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'var(--color-primary-light)',
          color: 'var(--color-accent)',
          padding: '0.25rem 0.75rem',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.75rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '0.35rem'
        }}>
          <ShieldCheck size={14} color="#F5A623" />
          <span>{t('ai_verified_vendors_badge', 'Verified Vendor Matches')}</span>
        </div>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text)', overflowWrap: 'anywhere' }}>
          {t('ai_vendor_matches_title', 'Matched Service Providers')}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', overflowWrap: 'anywhere' }}>
          {t('ai_vendor_matches_subtitle', 'Real providers matching your category allocations and location from the MY DAY marketplace.')}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
        {vendorMatches.categories.map((catResult) => {
          const { category, allocatedBudget, matches, overBudget, status, message } = catResult;
          const allCards = [...(matches || []), ...(overBudget || [])];

          return (
            <div
              key={category}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                background: 'var(--color-surface-soft)',
                minWidth: 0
              }}
            >
              {/* Category Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', minWidth: 0 }}>
                  <span style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: 'var(--color-text)',
                    textTransform: 'capitalize',
                    overflowWrap: 'anywhere'
                  }}>
                    {category}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    background: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    padding: '0.15rem 0.55rem',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'nowrap'
                  }}>
                    {t('ai_allocated_budget', 'Allocated')}: TSh {allocatedBudget.toLocaleString()}
                  </span>
                </div>

                {status === 'over_budget' && (
                  <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', minWidth: 0, overflowWrap: 'anywhere' }}>
                    <AlertCircle size={14} style={{ flexShrink: 0 }} /> {isSwahili ? 'Watoa huduma wamezidi bajeti kidogo' : 'Providers slightly above allocated budget'}
                  </span>
                )}
              </div>

              {/* No match state */}
              {status === 'no_match' && (
                <div style={{
                  padding: '1rem',
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--color-text-muted)',
                  fontStyle: 'italic',
                  border: '1px dashed var(--color-border)',
                  minWidth: 0,
                  overflowWrap: 'anywhere'
                }}>
                  {message || (isSwahili ? `Hakuna watoa huduma wa ${category} waliopatikana kwa bajeti hii.` : `No suitable ${category} vendors found within this allocation.`)}
                </div>
              )}

              {/* Matches Grid */}
              {allCards.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
                  gap: '1rem',
                  minWidth: 0
                }}>
                  {allCards.map((item) => {
                    const prov = item.provider;
                    if (!prov) return null;
                    const isSelected = selectedVendors.some(v => v.id === prov.id);
                    const isOverBudget = item.overBudgetAmount > 0;

                    return (
                      <div
                        key={prov.id}
                        style={{
                          background: '#FFFFFF',
                          border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                          borderRadius: 'var(--radius)',
                          padding: 'clamp(0.75rem, 2vw, 1rem)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-xs)',
                          transition: 'var(--transition)',
                          minWidth: 0
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem', minWidth: 0 }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', flex: '1 1 140px', minWidth: 0, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                              {prov.name}
                            </h4>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-pill)',
                              background: item.matchScore >= 80 ? 'var(--color-success-bg)' : 'var(--color-primary-light)',
                              color: item.matchScore >= 80 ? 'var(--color-success)' : 'var(--color-accent)',
                              flexShrink: 0,
                              whiteSpace: 'nowrap'
                            }}>
                              {item.matchLabel} ({item.matchScore}%)
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', flexWrap: 'wrap', minWidth: 0 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', overflowWrap: 'anywhere', minWidth: 0 }}>
                              <MapPin size={13} color="var(--color-primary)" style={{ flexShrink: 0 }} /> {prov.location}
                            </span>
                            <StarRating rating={prov.rating || 4.8} count={prov.reviewCount || 18} />
                          </div>

                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-accent)', marginBottom: '0.5rem', overflowWrap: 'anywhere' }}>
                            TSh {item.price.toLocaleString()}
                          </div>

                          {isOverBudget && (
                            <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700, marginBottom: '0.5rem', overflowWrap: 'anywhere' }}>
                              ⚠️ +TSh {item.overBudgetAmount.toLocaleString()} {t('ai_above_allocation', 'above allocation')}
                            </div>
                          )}

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem', minWidth: 0 }}>
                            {item.reasons && item.reasons.slice(0, 2).map((reason, idx) => (
                              <span key={idx} style={{
                                fontSize: '0.7rem',
                                color: 'var(--color-text-muted)',
                                background: 'var(--color-surface-soft)',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                overflowWrap: 'anywhere'
                              }}>
                                ✓ {reason}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{
                          display: 'flex',
                          gap: '0.4rem',
                          borderTop: '1px solid var(--color-border)',
                          paddingTop: '0.75rem',
                          flexWrap: 'wrap',
                          minWidth: 0
                        }}>
                          {/* 1. View Profile */}
                          <button
                            type="button"
                            onClick={() => navigate(`/vendor/${prov.category}/${prov.id}`)}
                            style={{
                              flex: '1 1 95px',
                              minWidth: 0,
                              padding: '0.45rem 0.65rem',
                              fontSize: '0.76rem',
                              background: 'transparent',
                              color: 'var(--color-text)',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-pill)',
                              boxShadow: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <ExternalLink size={13} style={{ flexShrink: 0 }} />
                            <span>{t('view_profile', 'View Profile')}</span>
                          </button>

                          {/* 2. Select / Deselect for Planner */}
                          <button
                            type="button"
                            onClick={() => isSelected ? deselectVendor(prov.id) : selectVendor(prov)}
                            style={{
                              flex: '1 1 85px',
                              minWidth: 0,
                              padding: '0.45rem 0.65rem',
                              fontSize: '0.76rem',
                              background: isSelected ? 'var(--color-surface-soft)' : '#FFFFFF',
                              color: isSelected ? 'var(--color-text-muted)' : 'var(--color-accent)',
                              border: '1px solid var(--color-accent)',
                              borderRadius: 'var(--radius-pill)',
                              boxShadow: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <CheckCircle size={13} style={{ flexShrink: 0 }} />
                            <span>{isSelected ? (isSwahili ? 'Imechaguliwa' : 'Selected') : t('select_vendor', 'Select')}</span>
                          </button>

                          {/* 3. Book Now (Reusing Existing Flow) */}
                          <button
                            type="button"
                            onClick={() => setBookingVendor(prov)}
                            style={{
                              flex: '1 1 95px',
                              minWidth: 0,
                              padding: '0.45rem 0.65rem',
                              fontSize: '0.76rem',
                              background: 'var(--color-primary)',
                              color: '#FFFFFF',
                              borderRadius: 'var(--radius-pill)',
                              border: 'none',
                              boxShadow: 'var(--shadow-amber)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Calendar size={13} style={{ flexShrink: 0 }} />
                            <span>{t('book_now', 'Book Now')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reusing Existing BookingModal */}
      {bookingVendor && (
        <BookingModal
          provider={bookingVendor}
          selectedPackage={bookingVendor.packages ? bookingVendor.packages[0] : null}
          onClose={() => setBookingVendor(null)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Reusing Existing PaymentModal */}
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
