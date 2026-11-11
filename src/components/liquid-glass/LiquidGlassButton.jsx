import React from 'react';

/**
 * Reusable Liquid Glass Button Family
 * Matches Apple iOS 26/27 optical liquid glass specs and user reference kit.
 */
export default function LiquidGlassButton({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'bubble' | 'pill'
  onClick,
  icon,
  className = '',
  style = {},
  title,
  ariaLabel,
  disabled = false,
  type = 'button'
}) {
  if (variant === 'bubble') {
    return (
      <button
        type={type}
        onClick={onClick}
        className={`lg-btn-bubble-droplet ${className}`}
        style={style}
        title={title}
        aria-label={ariaLabel || title}
        disabled={disabled}
      >
        {icon || children}
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type={type}
        onClick={onClick}
        className={`lg-pill-insert ${className}`}
        style={{ cursor: 'pointer', border: 'none', ...style }}
        title={title}
        aria-label={ariaLabel || title}
        disabled={disabled}
      >
        {icon}
        <span>{children}</span>
      </button>
    );
  }

  const btnClass = variant === 'secondary' ? 'lg-btn-secondary-glass' : 'lg-btn-primary-glass';

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${btnClass} ${className}`}
      style={style}
      title={title}
      aria-label={ariaLabel || title}
      disabled={disabled}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
