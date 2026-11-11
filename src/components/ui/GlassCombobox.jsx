import React, { useEffect, useId, useMemo, useRef, useState } from 'react';

/**
 * Glass combobox — a text field with suggestions, not a closed list.
 * Any typed value is accepted; the list only helps you move faster.
 */
export default function GlassCombobox({
  value,
  onChange,
  options = [],
  label,
  ariaLabel,
  placeholder = 'Type or choose…',
  id,
  disabled = false,
}) {
  const listId = useId();
  const inputId = id || `${listId}-input`;
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const query = (value || '').trim();
  const filtered = useMemo(() => {
    if (!query) return options.slice(0, 8);
    const q = query.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q)).slice(0, 8);
  }, [options, query]);

  const exact = options.some((o) => o.toLowerCase() === query.toLowerCase());

  const close = () => setOpen(false);

  const commit = (next) => {
    onChange?.(next);
    setOpen(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(-1, i - 1));
    } else if (e.key === 'Enter') {
      if (open && activeIndex >= 0 && filtered[activeIndex]) {
        e.preventDefault();
        commit(filtered[activeIndex]);
      } else {
        close();
      }
    } else if (e.key === 'Escape') {
      close();
    } else if (e.key === 'Tab') {
      close();
    }
  };

  const showFreeEntry = query.length > 1 && !exact;

  return (
    <div className="gsel gcb" ref={rootRef}>
      {label ? (
        <span className="gsel__label" id={`${inputId}-label`}>
          {label}
        </span>
      ) : null}

      <div className={`gcb__control ${open ? 'is-open' : ''}`}>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={ariaLabel || label || undefined}
          aria-labelledby={label ? `${inputId}-label` : undefined}
          className="gcb__input"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => {
            onChange?.(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <svg className="gsel__chevron" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {open && (filtered.length > 0 || showFreeEntry) ? (
        <ul id={listId} className="gsel__list gcb__list" role="listbox">
          {showFreeEntry ? (
            <li
              role="option"
              aria-selected={false}
              className={`gsel__option ${activeIndex === -1 ? 'is-active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(value)}
            >
              <span>
                Use “<b>{query}</b>”
              </span>
            </li>
          ) : null}

          {filtered.map((option, index) => (
            <li
              key={option}
              role="option"
              aria-selected={option.toLowerCase() === query.toLowerCase()}
              className={[
                'gsel__option',
                index === activeIndex ? 'is-active' : '',
                option.toLowerCase() === query.toLowerCase() ? 'is-selected' : '',
              ].join(' ').trim()}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(option)}
            >
              <span>{option}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
