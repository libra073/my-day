import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, MapPin, Users, Sparkles } from 'lucide-react';
import { useBodyScrollLock } from '../../lib/overlayLock';

/**
 * Shared lightbox for portfolio imagery. Rendered inline (fixed overlay) so it
 * inherits the app's glass tokens and needs no portal setup.
 */
export default function Lightbox({ items, index, onClose, onIndexChange, eyebrow }) {
  const { language } = useAppContext();
  const isSw = language === 'sw';
  const eyebrowText = eyebrow || (isSw ? 'Harusi halisi' : 'Real wedding');
  const closeRef = useRef(null);
  const item = items?.[index];

  useBodyScrollLock(Boolean(item), onClose);

  useEffect(() => {
    if (!item) return undefined;

    const onKey = (e) => {
      if (e.key === 'ArrowRight') onIndexChange((index + 1) % items.length);
      if (e.key === 'ArrowLeft') onIndexChange((index - 1 + items.length) % items.length);
    };

    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [index, item, items.length, onIndexChange]);

  if (!item) return null;

  // Portalled to <body>: animated page wrappers create a containing block that
  // would otherwise trap position:fixed inside the section.
  return createPortal(
    <div className="pf-lightbox" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="pf-lightbox__scrim" onClick={onClose} aria-hidden="true" />

      <div className="pf-lightbox__shell">
        <button ref={closeRef} type="button" className="pf-lightbox__close" onClick={onClose} aria-label={isSw ? 'Funga' : 'Close'}>
          <X size={18} />
        </button>

        <div className="pf-lightbox__media">
          <img src={item.image} alt={`${item.couple} - ${item.title}`} />
          {items.length > 1 && (
            <>
              <button
                type="button"
                className="pf-lightbox__nav pf-lightbox__nav--prev"
                onClick={() => onIndexChange((index - 1 + items.length) % items.length)}
                aria-label={isSw ? 'Iliyotangulia' : 'Previous'}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="pf-lightbox__nav pf-lightbox__nav--next"
                onClick={() => onIndexChange((index + 1) % items.length)}
                aria-label={isSw ? 'Ifuatayo' : 'Next'}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        <aside className="pf-lightbox__panel">
          <span className="pf-lightbox__eyebrow">
            <Sparkles size={12} /> {eyebrowText}
          </span>
          <h3>{item.title}</h3>
          {item.couple && item.couple !== item.title ? (
            <p className="pf-lightbox__couple">{item.couple}</p>
          ) : null}

          <div className="pf-lightbox__meta">
            <span>
              <MapPin size={14} /> {item.venue}
            </span>
            {item.guests ? (
              <span>
                <Users size={14} /> {item.guests} guests
              </span>
            ) : null}
          </div>

          {item.blurb && <p className="pf-lightbox__blurb">{item.blurb}</p>}

          {item.quote && <blockquote className="pf-lightbox__quote">"{item.quote}"</blockquote>}

          {item.vendors?.length ? (
            <div className="pf-lightbox__vendors">
              <span className="pf-lightbox__label">On the day</span>
              <ul>
                {item.vendors.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <span className="pf-lightbox__count">
            {index + 1} / {items.length}
          </span>
        </aside>
      </div>
    </div>,
    document.body
  );
}
