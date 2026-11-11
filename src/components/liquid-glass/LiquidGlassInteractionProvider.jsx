import React, { useEffect } from 'react';

/**
 * LiquidGlassInteractionProvider
 * Coordinates hardware-accelerated pointer dynamics across the application:
 * 1. Tracks cursor coordinates (--pointer-x, --pointer-y, --pointer-angle)
 * 2. Adds dynamic light hotspot coordinates (--mouse-x, --mouse-y) to hovered cards
 * 3. Provides smooth 60fps/120fps requestAnimationFrame throttling
 */
export default function LiquidGlassInteractionProvider({ children }) {
  useEffect(() => {
    const finePointerQuery =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotionQuery =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)');

    if ((finePointerQuery && !finePointerQuery.matches) || reducedMotionQuery?.matches) {
      return undefined;
    }

    let rafId = null;
    let pendingX = 50;
    let pendingY = 30;

    const updateCSSVars = () => {
      const root = document.documentElement;
      root.style.setProperty('--pointer-x', `${pendingX.toFixed(2)}%`);
      root.style.setProperty('--pointer-y', `${pendingY.toFixed(2)}%`);

      // Calculate angle from center for directional specular reflections
      const rad = Math.atan2(pendingY - 50, pendingX - 50);
      const deg = (rad * (180 / Math.PI) + 90 + 360) % 360;
      root.style.setProperty('--pointer-angle', `${deg.toFixed(1)}deg`);

      rafId = null;
    };

    const handlePointerMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      pendingX = x;
      pendingY = y;

      if (!rafId) {
        rafId = requestAnimationFrame(updateCSSVars);
      }

      // If hovering an interactive glass element, update its local hotspot
      const target = e.target.closest?.(
        '.interactive-glass, .glass-slab, .glass-lens, .vd-card, .provider-card, .hero-search, .mkt-filter-card, .wprof-card, .wprof-breakdown-card, .utask-greeting-card, .utask-stat-pill-card, .utask-wave-card, .utask-bars-card, .utask-meetings-card, .utask-profile-card, .ai-chat-card, .clay-phone-card, .modal-card, .dash-hero, .glass-frosted-optical, .cl-category-card, .dash-vendor-card, .celebration-budget-card, .ai-glass-showcase, .trust-panel'
      );
      if (target) {
        const rect = target.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;
        target.style.setProperty('--card-mouse-x', `${localX.toFixed(1)}px`);
        target.style.setProperty('--card-mouse-y', `${localY.toFixed(1)}px`);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return <>{children}</>;
}

