import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Images } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { VENDOR_PORTFOLIO_POOL } from '../data/portfolio';
import Lightbox from './portfolio/Lightbox';

/**
 * Vendor-side portfolio strip. Uses the vendor's own uploaded photos first and
 * tops the row up from the curated pool so a brand-new vendor still presents a
 * complete gallery. Deterministic per vendor id, so it never reshuffles.
 */
export default function VendorPortfolio({ provider }) {
  const { language } = useAppContext();
  const [active, setActive] = useState(null);

  const items = useMemo(() => {
    const own = (provider?.photos || []).filter(Boolean);
    const seed = String(provider?.id || provider?.name || '')
      .split('')
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const used = new Set(own);
    const extras = [];
    for (let i = 0; i < VENDOR_PORTFOLIO_POOL.length && own.length + extras.length < 6; i += 1) {
      const candidate = VENDOR_PORTFOLIO_POOL[(seed + i) % VENDOR_PORTFOLIO_POOL.length];
      if (used.has(candidate)) continue;
      used.add(candidate);
      extras.push(candidate);
    }

    return [...own, ...extras].slice(0, 6).map((image, i) => ({
      id: `${provider?.id || 'vendor'}-${i}`,
      image,
      title: i === 0 ? provider?.name : language === 'sw' ? 'Kazi za hivi karibuni' : 'Recent work',
      couple: provider?.name || '',
      venue: provider?.location || '',
      guests: i === 0 ? provider?.capacity : undefined,
      blurb: i === 0 ? provider?.description : undefined,
      vendors: [],
    }));
  }, [provider, language]);

  if (!provider || items.length === 0) return null;

  return (
    <div className="vp-card">
      <div className="vp-head">
        <h3>
          <Images size={16} /> {language === 'sw' ? 'Kazi Zao' : 'From their portfolio'}
        </h3>
        <span className="vp-count">
          {items.length} {language === 'sw' ? 'picha' : 'frames'}
        </span>
      </div>

      <div className="vp-grid">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className="vp-thumb"
            onClick={() => setActive(index)}
            aria-label={
              language === 'sw' ? `Fungua picha ${index + 1}` : `Open portfolio image ${index + 1}`
            }
          >
            <img
              src={item.image}
              alt={`${provider.name} portfolio ${index + 1}`}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = VENDOR_PORTFOLIO_POOL[index % VENDOR_PORTFOLIO_POOL.length];
              }}
            />
            <span className="vp-thumb__arrow" aria-hidden="true">
              <ArrowUpRight size={14} />
            </span>
          </button>
        ))}
      </div>

      {active !== null && (
        <Lightbox
          items={items}
          index={active}
          eyebrow={language === 'sw' ? 'Kazi' : 'Portfolio'}
          onClose={() => setActive(null)}
          onIndexChange={setActive}
        />
      )}
    </div>
  );
}
