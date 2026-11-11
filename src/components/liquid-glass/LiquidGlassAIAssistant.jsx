import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useSparkleBurst } from '../motion/MotionSparkles';

function SparkGlyph() {
  return (
    <svg className="ai-orb__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M11.6 3.2c.28 3.94 1.9 5.56 5.84 5.84.4.03.4.62 0 .65-3.94.28-5.56 1.9-5.84 5.84-.03.4-.62.4-.65 0-.28-3.94-1.9-5.56-5.84-5.84-.4-.03-.4-.62 0-.65 3.94-.28 5.56-1.9 5.84-5.84.03-.4.62-.4.65 0Z"
        fill="currentColor"
      />
      <path
        d="M18.1 14.2c.16 2.2 1.06 3.1 3.26 3.26.22.02.22.35 0 .37-2.2.16-3.1 1.06-3.26 3.26-.02.22-.35.22-.37 0-.16-2.2-1.06-3.1-3.26-3.26-.22-.02-.22-.35 0-.37 2.2-.16 3.1-1.06 3.26-3.26.02-.22.35-.22.37 0Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

export default function LiquidGlassAIAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useAppContext();
  const { triggerSparkles, SparkleOverlay } = useSparkleBurst();

  if (location.pathname === '/planner') {
    return null;
  }

  return (
    <div
      className="lg-floating-ai-assistant ai-pill btn-sweep motion-sparkles-host"
      onClick={(e) => {
        triggerSparkles(e);
        setTimeout(() => navigate('/planner'), 150);
      }}
      role="button"
      tabIndex={0}
      title={language === 'sw' ? 'MY DAY AI Mpangaji wa Sherehe' : 'MY DAY AI Wedding Planner'}
      aria-label="Ask MY DAY AI"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate('/planner');
        }
      }}
    >
      <span className="ai-pill__orb" aria-hidden="true">
        <SparkGlyph />
      </span>

      <span className="ai-pill__text">
        <span className="lg-ai-title ai-pill__title">MY DAY AI</span>
        <span className="lg-ai-subtitle ai-pill__subtitle">
          {language === 'sw' ? 'Mpangaji Mahiri' : 'Smart Planner'}
        </span>
      </span>

      <SparkleOverlay />
    </div>
  );
}
