import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { marketingApi } from '../../services/marketingApi';
import { glassCard, pick } from './marketingShared';

// Reads only placements the server considers live right now; expired campaigns
// disappear without any client-side clock. Organic ranking is never touched.
export default function SponsoredStrip({ location, category = '' }) {
  const { language } = useAppContext();
  const [placements, setPlacements] = useState(null);

  useEffect(() => {
    let cancelled = false;
    marketingApi.placements()
      .then(res => { if (!cancelled) setPlacements(res.placements || []); })
      .catch(() => { if (!cancelled) setPlacements([]); });
    return () => { cancelled = true; };
  }, []);

  if (!placements) return null;
  const visible = placements.filter(p =>
    p.location === location && (!category || !p.category || p.category === category));
  if (!visible.length) return null;

  return (
    <section className="mktg-grid" style={{ margin: '0 0 2rem' }} aria-label={language === 'sw' ? 'Wauzaji waliodhaminiwa' : 'Sponsored vendors'}>
      {visible.map(p => (
        <Link
          key={p.id}
          to={`/vendor/${p.vendor?.category || 'kumbi'}/${p.vendorId}`}
          className="mktg-card glass-slab glass-frosted-optical"
          style={{ ...glassCard, padding: '1.1rem 1.3rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', textDecoration: 'none' }}
        >
          <span className="mktg-sponsored-label">{pick(p.label, language) || (language === 'sw' ? 'Imedhaminiwa' : 'Sponsored')}</span>
          <strong style={{ fontSize: '1rem', fontWeight: 850, color: 'var(--app-text-primary, #0F172A)' }}>
            {p.vendor?.name || p.vendorId}
          </strong>
          <span style={{ fontSize: '0.78rem', color: 'var(--app-text-muted, #64748B)' }}>
            {p.vendor?.location || ''}{p.category ? ` • ${p.category}` : ''}
          </span>
        </Link>
      ))}
    </section>
  );
}