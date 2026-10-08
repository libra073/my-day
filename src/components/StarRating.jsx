import React from 'react';
import { Star } from 'lucide-react';

function StarRating({ rating = 4.8, count = 12, size = 16 }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)' }}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < fullStars || (i === fullStars && hasHalfStar) ? '#FF9D3B' : 'none'}
          stroke="#FF9D3B"
          strokeWidth={1.5}
        />
      ))}
      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginLeft: '0.25rem', fontWeight: 600 }}>
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  );
}

export default StarRating;
