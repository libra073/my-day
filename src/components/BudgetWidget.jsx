import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';

function BudgetWidget() {
  const { role, wedding, bookings, t } = useAppContext();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);

  // Show only for couples on non-home, non-dashboard, non-planner and non-vendor-registration pages
  if (role !== 'customer' || location.pathname === '/' || location.pathname === '/dashboard' || location.pathname === '/planner' || location.pathname === '/become-vendor') return null;

  const totalBookedAmount = bookings.reduce((sum, b) => sum + b.price, 0);
  const usagePct = Math.min(100, Math.round((totalBookedAmount / (wedding.budget || 1)) * 100));

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(max(1.25rem, env(safe-area-inset-bottom)) + 3.6rem)',
      right: 'max(1rem, env(safe-area-inset-right))',
      zIndex: 800,
      background: '#FFFFFF',
      color: 'var(--color-text)',
      borderRadius: collapsed ? 'var(--radius-pill)' : 'var(--radius)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-md)',
      width: collapsed ? 'auto' : 'min(270px, calc(100vw - 2rem))',
      overflow: 'hidden',
      transition: 'var(--transition)'
    }}>
      <div
        onClick={() => setCollapsed(!collapsed)}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed(!collapsed); } }}
        style={{
          padding: collapsed ? '0.5rem 0.85rem' : '0.7rem 1rem',
          background: collapsed ? '#FFFFFF' : 'var(--color-surface-soft)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.6rem',
          cursor: 'pointer',
          borderBottom: collapsed ? 'none' : '1px solid var(--color-border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>
          <Heart size={16} color="var(--color-primary)" fill="var(--color-primary)" />
          <span>{t('widget_title')}</span>
        </div>
        <span style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', padding: 0, display: 'inline-flex' }}>
          {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {!collapsed && (
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
            <span>{t('widget_target')}</span>
            <strong style={{ color: 'var(--color-text)' }}>TSh {wedding.budget.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            <span>{t('widget_committed')}</span>
            <strong style={{ color: 'var(--color-amber-text)' }}>TSh {totalBookedAmount.toLocaleString()}</strong>
          </div>

          <div style={{ height: 7, background: '#E6D9CC', borderRadius: 4, overflow: 'hidden', marginBottom: '0.85rem' }}>
            <div style={{ width: `${usagePct}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 4, boxShadow: 'var(--shadow-glow)' }}></div>
          </div>

          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              background: 'var(--color-primary)',
              color: '#2C1F16',
              padding: '0.55rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.85rem',
              fontWeight: 800,
              textAlign: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            {t('widget_open')} <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

export default BudgetWidget;
