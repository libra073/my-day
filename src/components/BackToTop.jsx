import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

/**
 * Reusable Apple-inspired True Optical Liquid Glass Back to Top control.
 * Appears smoothly after scrolling past `threshold` pixels and sits cleanly
 * in the bottom-right corner above floating controls and safe-area insets.
 */
export default function BackToTop({ threshold = 400 }) {
  const { t } = useAppContext();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const rafRef = useRef(0);
  const buttonRef = useRef(null);

  const hasAiAssistant = location.pathname !== '/planner';
  const label = t('back_to_top', 'Back to top');

  const updateVisibility = useCallback(() => {
    rafRef.current = 0;
    const scrollTop =
      window.scrollY ??
      window.pageYOffset ??
      document.documentElement.scrollTop ??
      0;
    setVisible(scrollTop >= threshold);
  }, [threshold]);

  useEffect(() => {
    const scheduleUpdate = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [updateVisibility]);

  // Ensure visibility resets immediately when navigating between routes
  useEffect(() => {
    const frame = window.requestAnimationFrame(updateVisibility);
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.search, updateVisibility]);

  // Prevent focused control remaining inside an aria-hidden state on collapse
  useEffect(() => {
    if (!visible && buttonRef.current && document.activeElement === buttonRef.current) {
      buttonRef.current.blur();
    }
  }, [visible]);

  const handleScrollToTop = () => {
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleScrollToTop}
      className={`lg-back-to-top${visible ? ' is-visible' : ''}${hasAiAssistant ? ' has-ai-assistant' : ' is-solo'}`}
      aria-label={label}
      aria-hidden={!visible}
      title={label}
      tabIndex={visible ? 0 : -1}
    >
      <span className="lg-back-to-top__rim" aria-hidden="true" />
      <ArrowUp
        size={19}
        strokeWidth={2.35}
        className="lg-back-to-top__icon"
        aria-hidden="true"
      />
    </button>
  );
}

