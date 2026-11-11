import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { PORTFOLIO_FILTERS, PORTFOLIO_ITEMS } from '../data/portfolio';
import Lightbox from './portfolio/Lightbox';

/**
 * "Real Weddings" editorial wall.
 *
 * The grid is deliberately asymmetric: one large frame carries the section,
 * tall frames hold portraits, and wide frames carry receptions. Each caption is
 * a glass shelf over the photo so the material picks up that image's colour.
 */
export default function PortfolioShowcase() {
  const { t } = useAppContext();
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState(null);

  const items = useMemo(
    () => (filter === 'all' ? PORTFOLIO_ITEMS : PORTFOLIO_ITEMS.filter((i) => i.style === filter)),
    [filter]
  );

  return (
    <section className="pf-section" aria-labelledby="pf-title">
      <div className="container">
        <header className="pf-head">
          <div className="pf-head__copy">
            <span className="pf-eyebrow">
              <Sparkles size={13} /> {t('portfolio_eyebrow', 'Real weddings')}
            </span>
            <h2 id="pf-title" className="pf-title">
              {t('portfolio_title', 'Celebrations we helped put together')}
            </h2>
            <p className="pf-sub">
              {t(
                'portfolio_sub',
                'Real couples, real venues, real vendors from across Tanzania. Every one of these days was booked through MY DAY.'
              )}
            </p>
          </div>

          <div className="pf-filters" role="tablist" aria-label={t('portfolio_filters_label', 'Filter portfolio')}>
            {PORTFOLIO_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`pf-filter ${filter === f.id ? 'is-active' : ''}`}
                onClick={() => {
                  setFilter(f.id);
                  setActive(null);
                }}
              >
                {t(`portfolio_filter_${f.id}`, f.label)}
              </button>
            ))}
          </div>
        </header>

        <div className="pf-grid">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`pf-card pf-card--${item.size}`}
              onClick={() => setActive(index)}
              aria-label={`${item.couple} - ${item.title}`}
            >
              <img src={item.image} alt={`${item.couple} - ${item.title}`} loading="lazy" decoding="async" />
              <span className="pf-card__scrim" aria-hidden="true" />
              <span className="pf-card__caption">
                <span className="pf-card__couple">{item.couple}</span>
                <span className="pf-card__venue">{item.venue}</span>
              </span>
              <span className="pf-card__arrow" aria-hidden="true">
                <ArrowUpRight size={16} />
              </span>
            </button>
          ))}
        </div>

        <div className="pf-foot">
          <p>
            {t(
              'portfolio_foot',
              'Every booking shown here was protected by 30% escrow until the day was delivered.'
            )}
          </p>
          <Link to="/marketplace" className="pf-foot__link">
            {t('portfolio_foot_cta', 'Start planning yours')} <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {active !== null && (
        <Lightbox items={items} index={active} onClose={() => setActive(null)} onIndexChange={setActive} />
      )}
    </section>
  );
}
