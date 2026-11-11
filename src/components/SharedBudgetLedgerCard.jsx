import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { DollarSign, PlusCircle, Trash2 } from 'lucide-react';
import GlassSelect from './ui/GlassSelect';

export default function SharedBudgetLedgerCard() {
  const {
    budgetData,
    wedding,
    createBudgetCategory,
    createExpense,
    deleteExpense,
    language = 'en',
  } = useAppContext();

  const permissions = wedding?.permissions || {};
  const canManageBudget = permissions.canManageBudget;
  const canRecordExpense = permissions.canRecordExpenses;
  const canViewFinancials = permissions.canViewFinancials;

  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showAddExpModal, setShowAddExpModal] = useState(false);

  // New Category State
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('💰');
  const [catAllocated, setCatAllocated] = useState(1000000);

  // New Expense State
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState('');
  const [expEstimated, setExpEstimated] = useState(500000);
  const [expActual, setExpActual] = useState(500000);
  const [expPaid, setExpPaid] = useState(150000);
  const [expStatus, setExpStatus] = useState('deposit_paid');

  if (!canViewFinancials) {
    return (
      <div style={{
        background: 'var(--app-card-bg, rgba(255, 255, 255, 0.72))',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem 1.5rem',
        border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
        boxShadow: 'var(--clay-shadow)',
        marginBottom: '2rem',
        textAlign: 'center',
        color: 'var(--app-text-muted, #64748b)'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔒</div>
        <strong style={{ color: 'var(--app-text-primary, #0f172a)' }}>{language === 'sw' ? 'Ufikiaji Umezuiwa' : 'Restricted Access'}</strong>: {language === 'sw' ? 'Taarifa za fedha na bajeti zimezuiwa kwa nafasi yako ya sasa.' : 'Budget financial details are restricted for your role.'}
      </div>
    );
  }

  const rawSummary = budgetData?.summary || {};
  const defaultTotal = wedding?.budget || 15000000;
  const summary = {
    totalBudget: rawSummary.totalBudget ?? defaultTotal,
    totalAllocated: rawSummary.totalAllocated ?? rawSummary.totalCommitted ?? 0,
    totalEstimated: rawSummary.totalEstimated ?? 0,
    totalActual: rawSummary.totalActual ?? rawSummary.totalCommitted ?? 0,
    totalPaid: rawSummary.totalPaid ?? 0,
    remainingBudget: rawSummary.remainingBudget ?? defaultTotal,
    unallocatedBudget: rawSummary.unallocatedBudget ?? defaultTotal,
    allocatedPct: rawSummary.allocatedPct ?? 0,
    usedPct: rawSummary.usedPct ?? 0,
  };

  const categories = budgetData?.categories || [];
  const expenses = budgetData?.expenses || [];

  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      await createBudgetCategory({
        name: catName.trim(),
        icon: catIcon || '💰',
        allocatedAmount: parseInt(catAllocated) || 0
      });
      setCatName('');
      setShowAddCatModal(false);
    } catch (err) {
      alert(err.message || 'Failed to add budget category');
    }
  };

  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expTitle.trim()) return;
    try {
      await createExpense({
        title: expTitle.trim(),
        categoryId: expCategory || (categories[0]?.id || 'bcat-other'),
        estimatedAmount: parseInt(expEstimated) || 0,
        actualAmount: parseInt(expActual) || 0,
        paidAmount: parseInt(expPaid) || 0,
        status: expStatus
      });
      setExpTitle('');
      setShowAddExpModal(false);
    } catch (err) {
      alert(err.message || 'Failed to record expense');
    }
  };

  const handleDeleteExpense = async (expId) => {
    if (!window.confirm('Delete this expense entry?')) return;
    try {
      await deleteExpense(expId);
    } catch (err) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  return (
    <div style={{
      background: 'var(--app-card-bg, rgba(255, 255, 255, 0.72))',
      borderRadius: 'var(--radius-xl)',
      padding: 'clamp(1.25rem, 3.5vw, 2rem)',
      border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
      boxShadow: 'var(--clay-shadow)',
      marginBottom: '2rem',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary, #0071E3)', fontWeight: 800, fontSize: '0.82rem', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <DollarSign size={16} /> {language === 'sw' ? 'Daftari la Pamoja la Fedha' : 'Real-Time Shared Financial Ledger'}
          </div>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--app-text-primary, #0F172A)', fontWeight: 850, margin: 0, letterSpacing: '-0.02em' }}>
            {language === 'sw' ? 'Kategoria za Bajeti & Ufuatiliaji wa Gharama' : 'Budget Categories & Live Expense Tracker'}
          </h2>
          <p style={{ color: 'var(--app-text-muted, #64748B)', fontSize: '0.88rem', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
            {language === 'sw'
              ? 'Fuatilia migawanyo ya kategoria, ahadi halisi, malipo yaliyofanyika, na baki ya bajeti.'
              : 'Monitor category allocations, actual commitments, payments made, and budget variance.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {canManageBudget && (
            <button
              onClick={() => setShowAddCatModal(!showAddCatModal)}
              className="btn-liquid-white"
              style={{
                padding: '0.55rem 1rem',
                fontSize: '0.82rem',
              }}
            >
              {language === 'sw' ? '+ Kategoria' : '+ Category'}
            </button>
          )}

          {canRecordExpense && (
            <button
              onClick={() => setShowAddExpModal(!showAddExpModal)}
              className="btn-primary"
              style={{
                padding: '0.55rem 1.15rem',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <PlusCircle size={14} /> {language === 'sw' ? 'Weka Gharama' : 'Record Expense'}
            </button>
          )}
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          {
            label: language === 'sw' ? 'Lengo Kuu la Bajeti' : 'Target Overall Budget',
            val: summary.totalBudget,
            color: 'var(--app-text-primary, #0f172a)',
            sub: language === 'sw' ? 'Imewekwa na Mwenye Harusi' : 'Set by Wedding Host'
          },
          {
            label: language === 'sw' ? 'Jumla Iliyogawiwa' : 'Total Allocated',
            val: summary.totalAllocated,
            color: 'var(--color-primary, #0071E3)',
            sub: language === 'sw' ? `${summary.allocatedPct || 0}% imegawiwa kwenye kategoria` : `${summary.allocatedPct || 0}% allocated to categories`
          },
          {
            label: language === 'sw' ? 'Ahadi / Halisi' : 'Committed / Actual',
            val: summary.totalActual,
            color: summary.remainingBudget >= 0 ? '#0891b2' : '#dc2626',
            sub: language === 'sw' ? `${summary.usedPct || 0}% ya bajeti imetumika` : `${summary.usedPct || 0}% of budget spent`
          },
          {
            label: language === 'sw' ? 'Jumla Iliyolipwa' : 'Total Paid to Date',
            val: summary.totalPaid,
            color: '#059669',
            sub: language === 'sw' ? 'Dhamana na malipo kamili' : 'Deposits & full settlements'
          },
          {
            label: language === 'sw' ? 'Salio Lililobaki' : 'Available Balance',
            val: summary.remainingBudget,
            color: summary.remainingBudget >= 0 ? '#059669' : '#dc2626',
            sub: summary.remainingBudget >= 0
              ? (language === 'sw' ? 'Baki salama' : 'Surplus uncommitted')
              : (language === 'sw' ? 'Tahadhari: bajeti imezidi' : 'Budget deficit alert')
          },
        ].map((card, i) => (
          <div key={i} style={{
            background: 'var(--app-surface-secondary, rgba(255, 255, 255, 0.72))',
            borderRadius: 'var(--radius-lg)',
            padding: '1.15rem',
            border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
            boxShadow: 'var(--clay-shadow-tile)'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--app-text-muted, #64748b)', marginBottom: '0.25rem' }}>{card.label}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 850, color: card.color, letterSpacing: '-0.02em' }}>TSh {(card.val ?? 0).toLocaleString()}</div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.25rem', fontWeight: 500 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Add Category Form Modal */}
      {showAddCatModal && (
        <form onSubmit={handleAddCategorySubmit} style={{
          background: 'var(--color-surface-soft)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
            {language === 'sw' ? 'Ongeza Kategoria ya Bajeti' : 'Add Target Budget Category'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {language === 'sw' ? 'Jina la Kategoria' : 'Category Name'}
              </label>
              <input
                type="text"
                placeholder={language === 'sw' ? 'Mf. Picha & Video' : 'E.g. Photography & Video'}
                value={catName}
                onChange={e => setCatName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {language === 'sw' ? 'Alama / Emoji' : 'Icon Emoji'}
              </label>
              <input
                type="text"
                placeholder="📸"
                value={catIcon}
                onChange={e => setCatIcon(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {language === 'sw' ? 'Kiwango Kilicholengwa (TSh)' : 'Target Allocation (TSh)'}
              </label>
              <input
                type="number"
                step="50000"
                value={catAllocated}
                onChange={e => setCatAllocated(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" onClick={() => setShowAddCatModal(false)} style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', cursor: 'pointer' }}>
              {language === 'sw' ? 'Ghairi' : 'Cancel'}
            </button>
            <button type="submit" style={{ background: 'var(--color-primary)', color: '#FFFFFF', border: 'none', padding: '0.4rem 1.25rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
              {language === 'sw' ? 'Hifadhi Kategoria' : 'Save Category'}
            </button>
          </div>
        </form>
      )}

      {/* Add Expense Form Modal */}
      {showAddExpModal && (
        <form onSubmit={handleAddExpenseSubmit} style={{
          background: 'var(--color-surface-soft)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
            {language === 'sw' ? 'Weka Gharama Halisi au Malipo' : 'Record an Actual Expense or Payment'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {language === 'sw' ? 'Jina la Gharama' : 'Expense Title'}
              </label>
              <input
                type="text"
                placeholder={language === 'sw' ? 'Mf. Kianzio cha Mpiga Keki' : 'E.g. Cake Maker Deposit'}
                value={expTitle}
                onChange={e => setExpTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {language === 'sw' ? 'Kategoria' : 'Category'}
              </label>
              <GlassSelect
                value={expCategory}
                onChange={setExpCategory}
                ariaLabel={language === 'sw' ? 'Kategoria' : 'Category'}
                options={categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {language === 'sw' ? 'Gharama Halisi (TSh)' : 'Actual Committed (TSh)'}
              </label>
              <input
                type="number"
                step="10000"
                value={expActual}
                onChange={e => setExpActual(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius-pill)', border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))', background: 'var(--app-surface-elevated, rgba(255, 255, 255, 0.85))' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {language === 'sw' ? 'Iliyolipwa Hadi Sasa (TSh)' : 'Paid So Far (TSh)'}
              </label>
              <input
                type="number"
                step="10000"
                value={expPaid}
                onChange={e => setExpPaid(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius-pill)', border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))', background: 'var(--app-surface-elevated, rgba(255, 255, 255, 0.85))' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {language === 'sw' ? 'Hali ya Malipo' : 'Payment Status'}
              </label>
              <GlassSelect
                value={expStatus}
                onChange={setExpStatus}
                ariaLabel={language === 'sw' ? 'Hali ya Malipo' : 'Payment Status'}
                options={[
                  { value: 'planned', label: language === 'sw' ? 'Imepangwa (Haijalipwa)' : 'Planned (Unpaid)' },
                  { value: 'deposit_paid', label: language === 'sw' ? 'Kianzio Kimelipwa' : 'Deposit Paid' },
                  { value: 'paid_in_full', label: language === 'sw' ? 'Imelipwa Kamili' : 'Paid in Full' },
                ]}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" onClick={() => setShowAddExpModal(false)} style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', cursor: 'pointer' }}>
              {language === 'sw' ? 'Ghairi' : 'Cancel'}
            </button>
            <button type="submit" style={{ background: 'var(--color-primary)', color: '#FFFFFF', border: 'none', padding: '0.4rem 1.25rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
              {language === 'sw' ? 'Hifadhi Gharama' : 'Save Expense'}
            </button>
          </div>
        </form>
      )}

      {/* Category Breakdown Progress Bars */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
          {language === 'sw' ? 'Migawanyo ya Kategoria Dhidi ya Halisi' : 'Category Allocations vs Actuals'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
          {categories.map(cat => {
            const pct = Math.min(100, Math.round(((cat.actual || 0) / (cat.allocatedAmount || 1)) * 100));
            const isOver = cat.isOverBudget;

            return (
              <div key={cat.id} style={{
                background: 'var(--app-surface-elevated, rgba(255, 255, 255, 0.68))',
                borderRadius: 'var(--radius-lg)',
                border: isOver ? '1.5px solid rgba(239, 68, 68, 0.45)' : '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
                padding: '0.85rem 1rem',
                boxShadow: 'var(--clay-shadow-tile, 0 4px 12px rgba(15, 23, 42, 0.03))'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)' }}>
                    {cat.icon} {cat.name}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-pill)',
                    background: isOver ? 'var(--color-error-bg, rgba(239, 68, 68, 0.14))' : 'var(--color-success-bg, rgba(16, 185, 129, 0.14))',
                    color: isOver ? 'var(--color-error, #DC2626)' : 'var(--color-success, #166534)'
                  }}>
                    {isOver ? (language === 'sw' ? 'IMEZIDI BAJETI' : 'OVER BUDGET') : (language === 'sw' ? 'IPO SAWA' : 'ON TRACK')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                  <span>{language === 'sw' ? 'Imetumika:' : 'Spent:'} <strong>TSh {(cat.actual || 0).toLocaleString()}</strong></span>
                  <span>{language === 'sw' ? 'Lengo:' : 'Target:'} TSh {(cat.allocatedAmount || 0).toLocaleString()}</span>
                </div>

                <div style={{ width: '100%', height: 6, background: 'var(--app-surface-secondary, #E5E7EB)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: isOver ? '#DC2626' : 'var(--color-primary)',
                    borderRadius: 3
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recorded Expenses Table */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
          {language === 'sw' ? `Daftari la Gharama Zilizorekodiwa (${expenses.length})` : `Recorded Expense Ledger (${expenses.length})`}
        </h3>
        <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '480px', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700 }}>
                  {language === 'sw' ? 'Kipengele / Gharama' : 'Item / Expense'}
                </th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700 }}>
                  {language === 'sw' ? 'Gharama Halisi' : 'Committed'}
                </th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700 }}>
                  {language === 'sw' ? 'Iliyolipwa' : 'Paid Amount'}
                </th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700 }}>
                  {language === 'sw' ? 'Hali' : 'Status'}
                </th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700 }}>
                  {language === 'sw' ? 'Iliyoingizwa Na' : 'Logged By'}
                </th>
                {canRecordExpense && (
                  <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700, textAlign: 'right' }}>
                    {language === 'sw' ? 'Vitendo' : 'Actions'}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    {language === 'sw'
                      ? 'Hakuna gharama zilizorekodiwa bado. Tumia kitufe cha juu kuingiza gharama.'
                      : 'No expenses recorded yet. Use the button above to log costs.'}
                  </td>
                </tr>
              ) : (
                expenses.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.6rem 0.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      {exp.title}
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', fontWeight: 700 }}>
                      TSh {(exp.actualAmount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', color: 'var(--color-success)', fontWeight: 700 }}>
                      TSh {(exp.paidAmount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: exp.status === 'paid_in_full' ? 'var(--color-success-bg, rgba(16, 185, 129, 0.14))' : exp.status === 'deposit_paid' ? 'var(--color-warning-bg, rgba(245, 158, 11, 0.14))' : 'var(--app-surface-secondary, #F3F4F6)',
                        color: exp.status === 'paid_in_full' ? 'var(--color-success, #166534)' : exp.status === 'deposit_paid' ? 'var(--color-warning, #92400E)' : 'var(--color-text-muted, #4B5563)'
                      }}>
                        {exp.status === 'paid_in_full'
                          ? (language === 'sw' ? 'IMELIPWA KAMILI' : 'PAID IN FULL')
                          : exp.status === 'deposit_paid'
                          ? (language === 'sw' ? 'KIANZIO KIMELIPWA' : 'DEPOSIT PAID')
                          : (language === 'sw' ? 'IMEPANGWA' : 'PLANNED')}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                      {exp.addedBy || (language === 'sw' ? 'Mwenyeji' : 'Host')}
                    </td>
                    {canRecordExpense && (
                      <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '0.2rem' }}
                          title={language === 'sw' ? 'Futa Gharama' : 'Delete Expense'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
