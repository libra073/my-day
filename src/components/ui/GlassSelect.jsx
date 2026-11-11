import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

/**
 * Glass select — a native <select> replacement so both the closed control and
 * the open list follow the MY DAY material instead of the OS menu.
 *
 * Keyboard: Enter/Space/Arrows open, Up/Down move, Home/End jump, Enter commits,
 * Escape closes and returns focus, Tab closes.
 */
export default function GlassSelect({
  value,
  onChange,
  options,
  label,
  ariaLabel,
  placeholder = 'Choose…',
  className = '',
  disabled = false,
  id,
  size = 'md',
}) {
  const listId = useId();
  const buttonId = id || `${listId}-button`;
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState('down');
  const [maxHeight, setMaxHeight] = useState(268);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, options.findIndex((o) => o.value === value)));
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value)) || null;

  const close = useCallback((focusButton = true) => {
    setOpen(false);
    if (focusButton) buttonRef.current?.focus();
  }, []);

  const openList = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom;
      const above = rect.top;
      const wanted = Math.min(268, Math.max(120, options.length * 44 + 12));
      if (below < wanted && above > below) {
        setPlacement('up');
        setMaxHeight(Math.min(wanted, Math.max(120, above - 24)));
      } else {
        setPlacement('down');
        setMaxHeight(Math.min(wanted, Math.max(120, below - 24)));
      }
    }
    setActiveIndex(Math.max(0, options.findIndex((o) => String(o.value) === String(value))));
    setOpen(true);
  }, [options, value]);

  const commit = useCallback(
    (option) => {
      onChange?.(option.value);
      close();
    },
    [close, onChange]
  );

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const node = listRef.current?.querySelector('[aria-selected="true"]') || listRef.current?.firstElementChild;
    node?.scrollIntoView({ block: 'nearest' });
  }, [open]);

  const move = (delta) => {
    setActiveIndex((index) => {
      const next = Math.min(options.length - 1, Math.max(0, index + delta));
      return next;
    });
  };

  const onButtonKeyDown = (event) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (open) {
        setOpen(false);
        return;
      }
      openList();
      if (event.key === 'ArrowDown') {
        setActiveIndex((i) => Math.min(options.length - 1, i + 1));
      } else if (event.key === 'ArrowUp') {
        setActiveIndex((i) => Math.max(0, i - 1));
      }
    }
  };

  const onListKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      move(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) commit(option);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className={`gsel ${size === 'sm' ? 'gsel--sm' : ''} ${open ? 'is-open' : ''} ${className}`.trim()} ref={rootRef}>
      {label ? (
        <span className="gsel__label" id={`${buttonId}-label`}>
          {label}
        </span>
      ) : null}

      <button
        type="button"
        id={buttonId}
        ref={buttonRef}
        className="gsel__button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel || label || undefined}
        aria-labelledby={label ? `${buttonId}-label` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onButtonKeyDown}
      >
        <span className={`gsel__value ${selected ? '' : 'is-placeholder'}`}>{selected ? selected.label : placeholder}</span>
        <svg className="gsel__chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <ul
          style={{ maxHeight }}
          id={listId}
          ref={listRef}
          className={`gsel__list ${placement === 'up' ? 'gsel__list--up' : ''}`}
          role="listbox"
          aria-labelledby={label ? `${buttonId}-label` : undefined}
          tabIndex={-1}
          onKeyDown={onListKeyDown}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={String(option.value) === String(value)}
              className={`gsel__option ${index === activeIndex ? 'is-active' : ''} ${String(option.value) === String(value) ? 'is-selected' : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => commit(option)}
            >
              <span>{option.label}</span>
              {String(option.value) === String(value) ? (
                <svg className="gsel__tick" viewBox="0 0 24 24" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
