import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, CheckCircle2, Clock } from 'lucide-react';

function ContactUsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 2500);
  };

  return (
    <div className="container py-8">
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', color: 'var(--color-dark)', marginBottom: '0.5rem' }}>
          We're Here to Help Your Wedding Day
        </h1>
        <p style={{ color: '#666', fontSize: '1rem' }}>
          Have questions about vendor bookings, payments, or setting up your vendor listing? Get in touch with the MY DAY team.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        {/* Contact Info Card */}
        <div style={{ background: 'var(--color-dark)', color: '#ffffff', padding: '2rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>
            MY DAY Headquarters
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <MapPin size={20} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <div>
                <strong>Physical Office:</strong><br />
                Victoria Noble Tower, 6th Floor,<br />
                Ali Hassan Mwinyi Road,<br />
                Dar es Salaam, Tanzania.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Phone size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              <div>
                <strong>Support Hotline:</strong><br />
                +255 22 210 0900 / +255 777 MY-DAY
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              <div>
                <strong>Email Us:</strong><br />
                support@myday.co.tz / info@myday.co.tz
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Clock size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              <div>
                <strong>Working Hours:</strong><br />
                Monday – Saturday: 8:00 AM – 7:00 PM (EAT)
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div style={{ background: '#ffffff', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid #EAE7E1', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-dark)' }}>
            Send Us a Direct Message
          </h2>

          {submitted ? (
            <div style={{ background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7', padding: '1rem', borderRadius: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} /> Thank you! Your message has been sent. We will respond within 2 hours.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid #D1CDC6', borderRadius: '0.5rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid #D1CDC6', borderRadius: '0.5rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Subject</label>
                <input
                  type="text"
                  placeholder="E.g. Booking inquiry, Payment verification..."
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid #D1CDC6', borderRadius: '0.5rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Message</label>
                <textarea
                  rows="4"
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid #D1CDC6', borderRadius: '0.5rem' }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  padding: '0.75rem 1.5rem'
                }}
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactUsPage;
