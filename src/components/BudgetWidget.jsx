import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';

function BudgetWidget() {
  const { role, wedding, bookings, isLoggedIn, t } = useAppContext();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);

  // Show only for logged-in couples WITH a saved wedding on non-home, non-dashboard, non-planner and non-vendor-registration pages
  if (
    !isLoggedIn ||
    !wedding ||
    !wedding.budget ||
    role !== 'customer' ||
    location.pathname === '/' ||
    location.pathname === '/dashboard' ||
    location.pathname === '/planner' ||
    location.pathname === '/become-vendor'
  ) {
    return null;
  }

  const totalBookedAmount = (bookings || []).reduce((sum, b) => sum + (b.price || 0), 0);
  const targetBudget = wedding.budget || 1;
  const usagePct = Math.min(100, Math.round((totalBookedAmount / targetBudget) * 100));

  return (
    <div className={`budget-float${collapsed ? ' is-collapsed' : ''}`}>
      <button
        type="button"
        className="budget-float__head"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
      >
        <span className="budget-float__title">
          <Heart size={15} color="var(--color-primary, #0071E3)" fill="var(--color-primary, #0071E3)" />
          <span>{t('widget_title')}</span>
        </span>
        <span style={{ display: 'inline-flex', color: 'var(--lg-muted)' }}>
          {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {!collapsed && (
        <div className="budget-float__body">
          <div className="budget-float__row">
            <span>{t('widget_target')}</span>
            <strong>TSh {wedding.budget.toLocaleString()}</strong>
          </div>
          <div className="budget-float__row">
            <span>{t('widget_committed')}</span>
            <strong>TSh {totalBookedAmount.toLocaleString()}</strong>
          </div>

          <div className="budget-float__bar">
            <div className="budget-float__fill" style={{ width: `${usagePct}%` }} />
          </div>

          <Link to="/dashboard" className="budget-float__cta">
            {t('widget_open')} <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

export default BudgetWidget;
