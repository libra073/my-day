import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Mail, Phone, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { getCurrentOfficeStatus } from '../services/businessSchedule';

function ContactUsPage() {
  const { t } = useAppContext();
  const officeStatus = getCurrentOfficeStatus();
  const [submitted, setSubmitted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setLeaving(false);
    // Fade out at 2.2s, then restore the form once the fade finishes (2.7s)
    setTimeout(() => setLeaving(true), 2200);
    setTimeout(() => {
      setSubmitted(false);
      setLeaving(false);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 2700);
  };

  const glassCard = { background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', color: 'var(--color-text)', marginBottom: '0.5rem', fontWeight: 800 }}>
          {t('contact_header_title')}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
          {t('contact_header_desc')}
        </p>
      </div>

      <div className="contact-grid">
        {/* Contact Info Card */}
        <div style={{
          background: 'linear-gradient(135deg, #785C45 0%, #5E4532 100%)',
          color: '#FFFFFF', padding: '2rem', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
        }}>
          <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '1.25rem', fontWeight: 800 }}>
            {t('contact_hq_title')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
            {[
              {
                icon: <MapPin size={20} color="var(--color-primary)" />,
                content: (
                  <>
                    <strong>{t('contact_office_label')}</strong><br />
                    Mbezi beach, makonde.<br />
                    Bagamoyo Road,<br />
                    Dar es Salaam, Tanzania.
                  </>
                )
              },
              {
                icon: <Phone size={20} color="var(--color-primary)" />,
                content: (
                  <>
                    <strong>{t('contact_hotline_label')}</strong><br />
                    <a href="tel:+255766466187" style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 600 }}>+255 766 466 187</a> / <a href="tel:+255619180779" style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 600 }}>+255 619 180 779</a>
                  </>
                )
              },
              {
                icon: <Mail size={20} color="var(--color-primary)" />,
                content: (
                  <>
                    <strong>{t('contact_email_label_title')}</strong><br />
                    support@myday.co.tz / info@myday.co.tz
                  </>
                )
              },
              {
                icon: <Clock size={20} color="var(--color-primary)" />,
                content: (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <strong>{t('contact_hours_label')}</strong>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: officeStatus.isOpen ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.15)',
                        color: officeStatus.isOpen ? '#4ADE80' : '#E8DCCF',
                        border: `1px solid ${officeStatus.isOpen ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: officeStatus.isOpen ? '#4ADE80' : '#E8DCCF'
                        }} />
                        {officeStatus.isOpen ? t('office_open_now') : t('office_closed_now')}
                      </span>
                    </div>
                    <div style={{ lineHeight: 1.5, fontSize: '0.85rem' }}>
                      {t('contact_hours_val')}
                    </div>
                    <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
                      {t('business_timezone_note')}
                    </div>
                  </>
                )
              },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'rgba(255,255,255,0.9)' }}>
                <span style={{ flexShrink: 0, marginTop: '0.2rem' }}>{item.icon}</span>
                <div>{item.content}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Form */}
        <div style={{ ...glassCard, padding: '2.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-text)', fontWeight: 800 }}>
            {t('contact_form_title')}
          </h2>
          {submitted ? (
            <div role="status" aria-live="polite" className={`contact-success ${leaving ? 'contact-success-out' : 'contact-success-in'}`}>
              <CheckCircle2 size={20} /> {t('contact_success_msg')}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <div className="contact-field">
                  <label className="contact-label" htmlFor="contact-name">{t('contact_name_label')}</label>
                  <input id="contact-name" type="text" placeholder={t('contact_name_placeholder')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="contact-field">
                  <label className="contact-label" htmlFor="contact-email">{t('contact_email_field')}</label>
                  <input id="contact-email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>

              <div className="contact-field">
                <label className="contact-label" htmlFor="contact-subject">{t('contact_subject_label')}</label>
                <input id="contact-subject" type="text" placeholder={t('contact_subject_placeholder')} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
              </div>

              <div className="contact-field" style={{ marginBottom: '1.5rem' }}>
                <label className="contact-label" htmlFor="contact-message">{t('contact_message_label')}</label>
                <textarea id="contact-message" rows="5" placeholder={t('contact_message_placeholder')} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              </div>

              <button type="submit" className="contact-button">
                {t('contact_send_btn')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactUsPage;
