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

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--color-text)', marginBottom: '0.5rem', fontWeight: 900, letterSpacing: '-0.025em' }}>
          {t('contact_header_title')}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', fontWeight: 500 }}>
          {t('contact_header_desc')}
        </p>
      </div>

      <div className="contact-grid">
        {/* Contact Info Card */}
        <div className="contact-info-card">
          <h2 style={{ fontSize: '1.5rem', color: 'var(--app-text-primary, #0F172A)', marginBottom: '1.35rem', fontWeight: 850 }}>
            {t('contact_hq_title')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem', fontSize: '0.92rem' }}>
            {[
              {
                icon: <MapPin size={20} color="var(--color-primary, #0071E3)" />,
                content: (
                  <>
                    <strong style={{ color: 'var(--app-text-primary, #0F172A)' }}>{t('contact_office_label')}</strong><br />
                    Mbezi beach, makonde.<br />
                    Bagamoyo Road,<br />
                    Dar es Salaam, Tanzania.
                  </>
                )
              },
              {
                icon: <Phone size={20} color="var(--color-primary, #0071E3)" />,
                content: (
                  <>
                    <strong style={{ color: 'var(--app-text-primary, #0F172A)' }}>{t('contact_hotline_label')}</strong><br />
                    <a href="tel:+255766466187" style={{ color: 'var(--color-primary, #0071E3)', textDecoration: 'none', fontWeight: 750 }}>+255 766 466 187</a> / <a href="tel:+255619180779" style={{ color: 'var(--color-primary, #0071E3)', textDecoration: 'none', fontWeight: 750 }}>+255 619 180 779</a>
                  </>
                )
              },
              {
                icon: <Mail size={20} color="var(--color-primary, #0071E3)" />,
                content: (
                  <>
                    <strong style={{ color: 'var(--app-text-primary, #0F172A)' }}>{t('contact_email_label_title')}</strong><br />
                    <a href="mailto:support@myday.co.tz" style={{ color: 'var(--color-primary, #0071E3)', textDecoration: 'none', fontWeight: 750 }}>support@myday.co.tz</a> / <a href="mailto:info@myday.co.tz" style={{ color: 'var(--color-primary, #0071E3)', textDecoration: 'none', fontWeight: 750 }}>info@myday.co.tz</a>
                  </>
                )
              },
              {
                icon: <Clock size={20} color="var(--color-primary, #0071E3)" />,
                content: (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <strong style={{ color: 'var(--app-text-primary, #0F172A)' }}>{t('contact_hours_label')}</strong>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        background: officeStatus.isOpen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 102, 238, 0.12)',
                        color: officeStatus.isOpen ? '#10b981' : 'var(--color-primary, #0071E3)',
                        border: `1px solid ${officeStatus.isOpen ? 'rgba(16, 185, 129, 0.35)' : 'rgba(100, 116, 139, 0.22)'}`
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: officeStatus.isOpen ? '#10b981' : '#64748B'
                        }} />
                        {officeStatus.isOpen ? t('office_open_now') : t('office_closed_now')}
                      </span>
                    </div>
                    <div style={{ lineHeight: 1.5, fontSize: '0.85rem', color: 'var(--app-text-secondary, #334155)' }}>
                      {t('contact_hours_val')}
                    </div>
                    <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--app-text-muted, #64748b)', fontStyle: 'italic' }}>
                      {t('business_timezone_note')}
                    </div>
                  </>
                )
              },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--app-text-secondary, #334155)' }}>
                <span style={{ flexShrink: 0, marginTop: '0.2rem' }}>{item.icon}</span>
                <div>{item.content}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Form */}
        <div className="contact-form-card">
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

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 800 }}>
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
