import React from 'react';

export const pick = (pair, language) => (pair && (pair[language] || pair.en)) || '';

export const fmtTzs = (n) => `TSh ${Number(n || 0).toLocaleString()}`;

export const MK_STATUS = {
  submitted: { en: 'Submitted', sw: 'Imewasilishwa', tone: '#7c6cf8' },
  under_review: { en: 'Under Review', sw: 'Inapitiwa', tone: '#0071E3' },
  awaiting_info: { en: 'Awaiting Vendor Information', sw: 'Inasubiri Taarifa za Muuzaji', tone: '#d97706' },
  approved: { en: 'Approved', sw: 'Imeidhinishwa', tone: '#059669' },
  awaiting_payment: { en: 'Awaiting Payment', sw: 'Inasubiri Malipo', tone: '#d97706' },
  scheduled: { en: 'Scheduled', sw: 'Imepangwa', tone: '#0071E3' },
  in_progress: { en: 'In Progress', sw: 'Inaendelea', tone: '#7c6cf8' },
  completed: { en: 'Completed', sw: 'Imekamilika', tone: '#059669' },
  rejected: { en: 'Rejected', sw: 'Imekataliwa', tone: '#dc2626' },
  cancelled: { en: 'Cancelled', sw: 'Imefutwa', tone: '#64748B' },
};

export const MK_PAYMENT = {
  not_required: { en: 'No payment required', sw: 'Hakuna malipo yanayohitajika' },
  awaiting_quote: { en: 'Awaiting quotation', sw: 'Inasubiri nukuu ya bei' },
  awaiting_payment: { en: 'Awaiting payment', sw: 'Inasubiri malipo' },
  paid: { en: 'Paid', sw: 'Imelipwa' },
  refunded: { en: 'Refunded', sw: 'Imerejeshwa' },
};

export function StatusBadge({ status, language }) {
  const meta = MK_STATUS[status] || { en: status, sw: status, tone: '#64748B' };
  return (
    <span className="mktg-badge" style={{ color: meta.tone, borderColor: `${meta.tone}55`, background: `${meta.tone}14` }}>
      {pick(meta, language)}
    </span>
  );
}

export const glassCard = {
  background: 'var(--slab-bg)',
  borderRadius: '26px',
  border: 'var(--slab-border, 1px solid rgba(255, 255, 255, 0.35))',
  boxShadow: 'var(--slab-shadow)',
  backdropFilter: 'blur(24px) saturate(190%)',
  WebkitBackdropFilter: 'blur(28px) saturate(195%)',
};

export function ServiceCard({ service, language, actionLabel, onAction }) {
  const price = service.priceType === 'fixed' && service.priceTzs > 0
    ? fmtTzs(service.priceTzs)
    : (language === 'sw' ? 'Bei kwa ombi (nukuu)' : 'Price on request (quotation)');
  return (
    <article className="mktg-card glass-slab glass-frosted-optical" style={{ ...glassCard, padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 850, color: 'var(--app-text-primary, #0F172A)', letterSpacing: '-0.01em' }}>
        {pick(service.name, language)}
      </h3>
      <p style={{ fontSize: '0.86rem', color: 'var(--app-text-muted, #64748B)', lineHeight: 1.55 }}>
        {pick(service.summary, language)}
      </p>
      <ul className="mktg-deliverables">
        {(service.deliverables || []).slice(0, 5).map((d, i) => (
          <li key={i}>{pick(d, language)}</li>
        ))}
      </ul>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary, #0071E3)' }}>{price}</span>
        {onAction && (
          <button type="button" className="mktg-btn" onClick={() => onAction(service)}>
            {actionLabel}
          </button>
        )}
      </div>
    </article>
  );
}

export function ErrorNote({ error, language, onRetry }) {
  if (!error) return null;
  return (
    <div className="mktg-error" role="alert">
      <span>{error}</span>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          {language === 'sw' ? 'Jaribu tena' : 'Retry'}
        </button>
      )}
    </div>
  );
}

export function LoadingNote({ language }) {
  return (
    <div className="mktg-loading" aria-busy="true">
      {language === 'sw' ? 'Inapakia…' : 'Loading…'}
    </div>
  );
}