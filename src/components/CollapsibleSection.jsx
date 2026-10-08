import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

function CollapsibleSection({
  title,
  subtitle,
  children,
  id,
  initialOpen = false,
  className = '',
  style = {}
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <section className={`container ${className}`} style={{ padding: '4rem 1rem', ...style }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={id}
          className="collapsible-trigger"
        >
          <h2 style={{ fontSize: '2.25rem', color: 'var(--color-text)', margin: 0, fontWeight: 800 }}>
            {title}
          </h2>
          <ChevronDown
            size={28}
            className="collapsible-chevron"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              color: 'var(--color-primary)'
            }}
          />
        </button>
        {subtitle && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '0.5rem' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div
        id={id}
        aria-hidden={!isOpen}
        className={`collapsible-content ${isOpen ? 'is-open' : ''}`}
      >
        {typeof children === 'function' ? children({ isOpen }) : children}
      </div>
    </section>
  );
}

export default CollapsibleSection;
