import React from 'react';
import { Star } from 'lucide-react';

function StarRating({ rating = 4.8, count = 12, size = 16 }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1 text-amber-500" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#D4AF37' }}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < fullStars || (i === fullStars && hasHalfStar) ? '#D4AF37' : 'none'}
          stroke="#D4AF37"
          strokeWidth={1.5}
        />
      ))}
      <span style={{ fontSize: '0.85rem', color: '#666', marginLeft: '0.25rem' }}>
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  );
}

export default StarRating;
