import React, { useState, useCallback } from 'react';

/**
 * Lightweight interactive twinkling sparkles helper.
 * Spawns 5-7 tiny elegant stars on click/interaction that
 * twinkle, travel outward with physics easing, and naturally vanish.
 */
export function useSparkleBurst() {
  const [sparkles, setSparkles] = useState([]);

  const triggerSparkles = useCallback((e) => {
    const rect = e?.currentTarget?.getBoundingClientRect();
    const originX = rect ? rect.width / 2 : 20;
    const originY = rect ? rect.height / 2 : 20;

    const newParticles = Array.from({ length: 6 }).map((_, i) => {
      const angle = (i * (360 / 6) + Math.random() * 20) * (Math.PI / 180);
      const distance = 16 + Math.random() * 18;
      return {
        id: Math.random().toString(36).slice(2, 8),
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        size: 9 + Math.random() * 5,
        char: i % 2 === 0 ? '✦' : '★',
        color: i % 3 === 0 ? '#FF4F9E' : i % 3 === 1 ? '#FF8FC4' : '#FFC2DE',
        originX,
        originY,
      };
    });

    setSparkles(newParticles);
    setTimeout(() => {
      setSparkles([]);
    }, 700);
  }, []);

  const SparkleOverlay = () => {
    if (sparkles.length === 0) return null;
    return (
      <span
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'visible',
          zIndex: 40,
        }}
        aria-hidden="true"
      >
        {sparkles.map((p) => (
          <span
            key={p.id}
            className="motion-sparkle-particle"
            style={{
              left: p.originX,
              top: p.originY,
              fontSize: `${p.size}px`,
              color: p.color,
              textShadow: `0 0 8px ${p.color}, 0 0 16px rgba(255, 110, 178, 0.55)`,
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
            }}
          >
            {p.char}
          </span>
        ))}
      </span>
    );
  };

  return { triggerSparkles, SparkleOverlay };
}

