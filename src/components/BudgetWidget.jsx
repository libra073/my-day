import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';

function BudgetWidget() {
  const { role, wedding, bookings, t } = useAppContext();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Show only for couples on non-dashboard and non-planner pages
  if (role !== 'customer' || location.pathname === '/dashboard' || location.pathname === '/planner') return null;

  const totalBookedAmount = bookings.reduce((sum, b) => sum + b.price, 0);
  const usagePct = Math.min(100, Math.round((totalBookedAmount / (wedding.budget || 1)) * 100));

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 800,
      background: '#FFFFFF',
      color: 'var(--color-text)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-lg)',
      width: collapsed ? 'auto' : '300px',
      overflow: 'hidden',
      transition: 'var(--transition)'
    }}>
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: '0.75rem 1rem',
          background: 'var(--color-surface-soft)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          borderBottom: collapsed ? 'none' : '1px solid var(--color-border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>
          <Heart size={16} color="var(--color-primary)" fill="var(--color-primary)" />
          <span>{t('widget_title')}</span>
        </div>
        <button style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', padding: 0, boxShadow: 'none' }}>
          {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {!collapsed && (
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
            <span>{t('widget_target')}</span>
            <strong style={{ color: 'var(--color-text)' }}>TSh {wedding.budget.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            <span>{t('widget_committed')}</span>
            <strong style={{ color: 'var(--color-primary-hover)' }}>TSh {totalBookedAmount.toLocaleString()}</strong>
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
              color: '#FFFFFF',
              padding: '0.55rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.82rem',
              fontWeight: 700,
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
