import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'kumbi', name: 'Kumbi – Venues' },
  { id: 'wapambaji', name: 'Wapambaji – Decorators' },
  { id: 'entertainment', name: 'MCs & Entertainment' },
  { id: 'catering', name: 'Catering' },
  { id: 'saloon', name: 'Saloon & Barbershop' },
  { id: 'transport', name: 'Transport' },
];

function BecomeVendorPage() {
  const { setProviders, switchRole } = useAppContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: 'kumbi',
    location: 'Dar es Salaam',
    contact: '',
    priceRate: 1500000,
    description: ''
  });

  const [registered, setRegistered] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.contact) {
      alert('Please fill out all required fields.');
      return;
    }

    const newVendor = {
      id: `vendor-${Date.now()}`,
      category: formData.category,
      name: formData.name,
      location: formData.location,
      pricePerDay: formData.category === 'kumbi' || formData.category === 'transport' ? formData.priceRate : null,
      pricePerPerson: formData.category === 'catering' ? formData.priceRate : null,
      pricePerEvent: formData.category === 'entertainment' ? formData.priceRate : null,
      packages: formData.category === 'wapambaji' || formData.category === 'saloon' ? [
        { id: 'pkg-1', name: 'Standard Wedding Package', price: formData.priceRate, description: formData.description || 'Full professional package included.' }
      ] : [],
      rating: 5.0,
      reviewsCount: 1,
      verified: false,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      description: formData.description,
      contact: formData.contact,
      unavailableDates: []
    };

    setProviders(prev => [newVendor, ...prev]);
    setRegistered(true);

    setTimeout(() => {
      switchRole('provider');
      navigate('/provider');
    }, 1500);
  };

  const benefits = [
    { title: 'Create Business Profile', desc: 'Showcase your portfolio, packages, pricing, and amenities to thousands of active couples.' },
    { title: 'Receive Direct Booking Requests', desc: 'Get instant booking requests and 30% advance deposits straight to your account.' },
    { title: 'Manage Calendar Availability', desc: 'Effortlessly block out unavailable dates and avoid scheduling conflicts.' },
    { title: 'Accept Online Payments', desc: 'Guaranteed payouts via M-Pesa, Tigo Pesa, Airtel Money, or direct bank transfer.' },
    { title: 'Track Earnings & Analytics', desc: 'Real-time financial breakdown of gross earnings, platform payouts, and upcoming events.' },
    { title: 'Build Client Reputation', desc: 'Gain verified 5-star customer reviews and boost your business ranking across Tanzania.' },
  ];

  return (
    <div className="container py-8">
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem' }}>
        <span style={{ background: 'var(--color-muted)', color: 'var(--color-dark)', padding: '0.35rem 0.85rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Vendor Partner Program
        </span>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-dark)', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
          Grow Your Wedding Business with MY DAY
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>
          Join Tanzania's premier wedding marketplace. Connect with hundreds of couples planning their dream weddings every month.
        </p>
      </div>

      {/* Benefits Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        {benefits.map((b, i) => (
          <div key={i} style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid #EAE7E1', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '1.05rem' }}>
              <CheckCircle2 size={20} /> {b.title}
            </div>
            <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5 }}>{b.desc}</p>
          </div>
        ))}
      </div>

      {/* Registration Form */}
      <div style={{ maxWidth: '680px', margin: '0 auto', background: '#ffffff', padding: '2.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #EEE', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-dark)' }}>
              Register as a Partner Vendor
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Instant publishing & digital contract setup
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)' }}></span>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)' }}></span>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)' }}></span>
          </div>
        </div>

        {registered ? (
          <div style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid rgba(27,122,67,0.3)', padding: '1.5rem', borderRadius: 'var(--radius)', fontWeight: 600, textAlign: 'center' }}>
            ✓ Registration successful! Redirecting to Provider Portal...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                Business Name
              </label>
              <input
                type="text"
                placeholder="E.g. Imperial Floral & Decor"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1CDC6', borderRadius: '0.5rem' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Service Category
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1CDC6', borderRadius: '0.5rem' }}
                >
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Location / City
                </label>
                <input
                  type="text"
                  placeholder="E.g. Dar es Salaam"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1CDC6', borderRadius: '0.5rem' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Phone / WhatsApp Contact
                </label>
                <input
                  type="text"
                  placeholder="+255 700 000 000"
                  value={formData.contact}
                  onChange={e => setFormData({ ...formData, contact: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1CDC6', borderRadius: '0.5rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Starting Price Rate (TSh)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={formData.priceRate}
                  onChange={e => setFormData({ ...formData, priceRate: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1CDC6', borderRadius: '0.5rem' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                Business Description & Amenities
              </label>
              <textarea
                rows="3"
                placeholder="Describe your services, capacity, amenities, or past experience..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1CDC6', borderRadius: '0.5rem' }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                background: 'var(--color-primary)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '0.85rem'
              }}
            >
              Register & Launch Listing
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default BecomeVendorPage;
