import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function AIFloatingButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useAppContext();

  // Do not show floating button if already on the planner chat page
  if (location.pathname === '/planner') {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => navigate('/planner')}
      style={{
        position: 'fixed',
        bottom: 'max(1.25rem, env(safe-area-inset-bottom))',
        right: 'max(1rem, env(safe-area-inset-right))',
        zIndex: 920,
        background: '#3D2D21', // Deep Mocha
        border: '2px solid #F5A623', // Amber Gold
        borderRadius: 'var(--radius-pill)',
        padding: '0.65rem clamp(0.9rem, 2vw, 1.35rem)',
        color: '#FFFFFF',
        boxShadow: '0 10px 30px rgba(61, 45, 33, 0.45)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        fontWeight: 800,
        fontSize: 'clamp(0.82rem, 2vw, 0.92rem)',
        maxWidth: 'calc(100vw - 2rem)',
        whiteSpace: 'nowrap',
      }}
      className="pulse-glow"
      title="MY DAY AI Planner"
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#F5A623',
        flexShrink: 0
      }}>
        <MessageSquare size={18} color="#F5A623" fill="rgba(245, 166, 35, 0.2)" />
      </div>
      <span style={{ letterSpacing: '0.02em', color: '#FFFFFF', overflowWrap: 'anywhere' }}>
        ✨ {t('ask_myday_ai', 'Ask MY DAY AI')}
      </span>
    </button>
  );
}
