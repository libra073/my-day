import React from 'react';

/**
 * Racing Spark Outline Component
 * A bright spark that races around the perimeter of an element,
 * leaving a short-lived luminous trail using SVG stroke animation.
 */
export default function RacingSpark({ radius = 22, color = '#0071E3', active = true }) {
  if (!active) return null;

  return (
    <svg
      className="racing-spark-svg"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 10,
        borderRadius: `${radius}px`,
      }}
    >
      <defs>
        <linearGradient id={`sparkGrad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="35%" stopColor={color} stopOpacity="1" />
          <stop offset="70%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id="sparkGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={color} floodOpacity="0.8" />
        </filter>
      </defs>
      <rect
        x="1.5"
        y="1.5"
        width="calc(100% - 3px)"
        height="calc(100% - 3px)"
        rx={radius}
        ry={radius}
        fill="none"
        stroke={`url(#sparkGrad-${color.replace('#', '')})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        className="racing-spark-path"
      />
    </svg>
  );
}

