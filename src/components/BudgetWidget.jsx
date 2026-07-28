import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';

function BudgetWidget() {
  const { role, wedding, bookings } = useAppContext();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Show only for couples on non-dashboard pages
  if (role !== 'customer' || location.pathname === '/dashboard') return null;

  const totalBookedAmount = bookings.reduce((sum, b) => sum + b.price, 0);
  const remainingBudget = Math.max(0, wedding.budget - totalBookedAmount);
  const usagePct = Math.min(100, Math.round((totalBookedAmount / (wedding.budget || 1)) * 100));

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 800,
      background: 'rgba(11, 37, 28, 0.95)',
      backdropFilter: 'blur(12px)',
      color: '#ffffff',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      boxShadow: 'var(--shadow-lg)',
      width: collapsed ? 'auto' : '300px',
      overflow: 'hidden',
      transition: 'var(--transition)'
    }}>
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: '0.75rem 1rem',
          background: 'rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>
          <Heart size={16} color="var(--color-primary)" />
          <span>{wedding.title || "Wedding Budget Tracker"}</span>
        </div>
        <button style={{ background: 'none', border: 'none', color: '#fff', padding: 0, boxShadow: 'none' }}>
          {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {!collapsed && (
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', marginBottom: '0.35rem' }}>
            <span>Target Budget:</span>
            <strong>TSh {wedding.budget.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', marginBottom: '0.5rem' }}>
            <span>Committed Services:</span>
            <strong style={{ color: 'var(--color-primary)' }}>TSh {totalBookedAmount.toLocaleString()}</strong>
          </div>

          <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden', marginBottom: '0.85rem' }}>
            <div style={{ width: `${usagePct}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37, #C87D85)', borderRadius: 3 }}></div>
          </div>

          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              background: 'var(--color-primary)',
              color: '#ffffff',
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 700,
              textAlign: 'center'
            }}
          >
            Open Event Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

export default BudgetWidget;
