import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2, Clock } from 'lucide-react';

function ContactUsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }, 2500);
  };

  const glassCard = { background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', color: 'var(--color-text)', marginBottom: '0.5rem', fontWeight: 800 }}>We're Here to Help Your Wedding Day</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>Have questions about vendor bookings, payments, or setting up your vendor listing? Get in touch with the MY DAY team.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        {/* Contact Info Card */}
        <div style={{
          background: 'linear-gradient(135deg, #785C45 0%, #5E4532 100%)',
          color: '#FFFFFF', padding: '2rem', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
        }}>
          <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '1.25rem', fontWeight: 800 }}>MY DAY Headquarters</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
            {[
              { icon: <MapPin size={20} color="var(--color-primary)" />, content: <><strong>Physical Office:</strong><br />Victoria Noble Tower, 6th Floor,<br />Ali Hassan Mwinyi Road,<br />Dar es Salaam, Tanzania.</> },
              { icon: <Phone size={20} color="var(--color-primary)" />, content: <><strong>Support Hotline:</strong><br />+255 22 210 0900 / +255 777 MY-DAY</> },
              { icon: <Mail size={20} color="var(--color-primary)" />, content: <><strong>Email Us:</strong><br />support@myday.co.tz / info@myday.co.tz</> },
              { icon: <Clock size={20} color="var(--color-primary)" />, content: <><strong>Working Hours:</strong><br />Monday – Saturday: 8:00 AM – 7:00 PM (EAT)</> },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'rgba(255,255,255,0.9)' }}>
                <span style={{ flexShrink: 0, marginTop: '0.2rem' }}>{item.icon}</span>
                <div>{item.content}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Form */}
        <div style={{ ...glassCard, padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-text)', fontWeight: 800 }}>Send Us a Direct Message</h2>
          {submitted ? (
            <div style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid rgba(56, 161, 105, 0.3)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} /> Thank you! Your message has been sent. We will respond within 2 hours.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>Full Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>Subject</label>
                <input type="text" placeholder="E.g. Booking inquiry, Payment verification..." value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text)' }}>Message</label>
                <textarea rows="4" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              </div>

              <button type="submit" style={{
                background: 'var(--color-primary)',
                color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', padding: '0.75rem 1.75rem',
                borderRadius: 'var(--radius-pill)',
                boxShadow: 'var(--shadow-glow)',
              }}>
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
