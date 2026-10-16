import React from 'react';
import { Star } from 'lucide-react';

function StarRating({ rating = 4.8, count = null, size = 16, showText = false }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#F5A623' }}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < fullStars || (i === fullStars && hasHalfStar) ? '#F5A623' : 'none'}
          stroke="#F5A623"
          strokeWidth={1.75}
        />
      ))}
      {showText && (
        <span style={{ fontSize: '0.85rem', color: '#3D2C1F', marginLeft: '0.3rem', fontWeight: 700 }}>
          {Number(rating).toFixed(1)} {count !== null && <span style={{ color: 'var(--color-text-dim)', fontWeight: 500 }}>({count})</span>}
        </span>
      )}
    </div>
  );
}

export default StarRating;
