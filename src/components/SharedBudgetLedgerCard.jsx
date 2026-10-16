import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { DollarSign, PlusCircle, Trash2 } from 'lucide-react';

export default function SharedBudgetLedgerCard() {
  const {
    budgetData,
    wedding,
    createBudgetCategory,
    createExpense,
    deleteExpense,
  } = useAppContext();

  const permissions = wedding.permissions || {};
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
        background: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        border: '1px solid var(--color-border)',
        marginBottom: '2rem',
        textAlign: 'center',
        color: 'var(--color-text-muted)'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔒</div>
        <strong>Restricted Access</strong>: Budget financial details are restricted for your role.
      </div>
    );
  }

  const summary = budgetData?.summary || {
    totalBudget: wedding.budget || 15000000,
    totalAllocated: 0,
    totalEstimated: 0,
    totalActual: 0,
    totalPaid: 0,
    remainingBudget: wedding.budget || 15000000,
    unallocatedBudget: wedding.budget || 15000000,
    allocatedPct: 0,
    usedPct: 0,
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
      background: '#FFFFFF',
      borderRadius: 'var(--radius-xl)',
      padding: 'clamp(1rem, 3.5vw, 1.75rem)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: '2rem',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary-hover)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            <DollarSign size={16} /> Real-Time Shared Financial Ledger
          </div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-text)', fontWeight: 800, margin: 0 }}>
            Budget Categories & Live Expense Tracker
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            Monitor category allocations, actual commitments, payments made, and budget variance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {canManageBudget && (
            <button
              onClick={() => setShowAddCatModal(!showAddCatModal)}
              style={{
                background: 'var(--color-surface-soft)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              + Category
            </button>
          )}

          {canRecordExpense && (
            <button
              onClick={() => setShowAddExpModal(!showAddExpModal)}
              style={{
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.5rem 1.15rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <PlusCircle size={14} /> Record Expense
            </button>
          )}
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Target Overall Budget', val: summary.totalBudget, color: 'var(--color-text)', sub: 'Set by Wedding Host' },
          { label: 'Total Allocated', val: summary.totalAllocated, color: 'var(--color-primary-hover)', sub: `${summary.allocatedPct || 0}% allocated to categories` },
          { label: 'Committed / Actual', val: summary.totalActual, color: summary.remainingBudget >= 0 ? '#2563EB' : '#DC2626', sub: `${summary.usedPct || 0}% of budget spent` },
          { label: 'Total Paid to Date', val: summary.totalPaid, color: 'var(--color-success)', sub: 'Deposits & full settlements' },
          { label: 'Available Balance', val: summary.remainingBudget, color: summary.remainingBudget >= 0 ? 'var(--color-success)' : 'var(--color-error)', sub: summary.remainingBudget >= 0 ? 'Surplus uncommitted' : 'Budget deficit alert' },
        ].map((card, i) => (
          <div key={i} style={{
            background: 'var(--color-surface-soft)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>{card.label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: card.color }}>TSh {card.val.toLocaleString()}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginTop: '0.2rem' }}>{card.sub}</div>
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
            Add Target Budget Category
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Category Name</label>
              <input
                type="text"
                placeholder="E.g. Photography & Video"
                value={catName}
                onChange={e => setCatName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Icon Emoji</label>
              <input
                type="text"
                placeholder="📸"
                value={catIcon}
                onChange={e => setCatIcon(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Target Allocation (TSh)</label>
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
            <button type="button" onClick={() => setShowAddCatModal(false)} style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: 'var(--color-primary)', color: '#FFFFFF', border: 'none', padding: '0.4rem 1.25rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Save Category</button>
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
            Record an Actual Expense or Payment
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Expense Title</label>
              <input
                type="text"
                placeholder="E.g. Cake Maker Deposit"
                value={expTitle}
                onChange={e => setExpTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Category</label>
              <select
                value={expCategory}
                onChange={e => setExpCategory(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: '#FFFFFF' }}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Actual Committed (TSh)</label>
              <input
                type="number"
                step="10000"
                value={expActual}
                onChange={e => setExpActual(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Paid So Far (TSh)</label>
              <input
                type="number"
                step="10000"
                value={expPaid}
                onChange={e => setExpPaid(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Payment Status</label>
              <select
                value={expStatus}
                onChange={e => setExpStatus(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: '#FFFFFF' }}
              >
                <option value="planned">Planned (Unpaid)</option>
                <option value="deposit_paid">Deposit Paid</option>
                <option value="paid_in_full">Paid in Full</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" onClick={() => setShowAddExpModal(false)} style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: 'var(--color-primary)', color: '#FFFFFF', border: 'none', padding: '0.4rem 1.25rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Save Expense</button>
          </div>
        </form>
      )}

      {/* Category Breakdown Progress Bars */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
          Category Allocations vs Actuals
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
          {categories.map(cat => {
            const pct = Math.min(100, Math.round(((cat.actual || 0) / (cat.allocatedAmount || 1)) * 100));
            const isOver = cat.isOverBudget;

            return (
              <div key={cat.id} style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: isOver ? '1px solid #FCA5A5' : '1px solid var(--color-border)',
                padding: '0.85rem',
                boxShadow: 'var(--shadow-xs)'
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
                    background: isOver ? '#FEE2E2' : '#DCFCE7',
                    color: isOver ? '#DC2626' : '#166534'
                  }}>
                    {isOver ? 'OVER BUDGET' : 'ON TRACK'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                  <span>Spent: <strong>TSh {(cat.actual || 0).toLocaleString()}</strong></span>
                  <span>Target: TSh {(cat.allocatedAmount || 0).toLocaleString()}</span>
                </div>

                <div style={{ width: '100%', height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
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
          Recorded Expense Ledger ({expenses.length})
        </h3>
        <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '480px', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700 }}>Item / Expense</th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700 }}>Committed</th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700 }}>Paid Amount</th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700 }}>Logged By</th>
                {canRecordExpense && <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No expenses recorded yet. Use the button above to log costs.
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
                        background: exp.status === 'paid_in_full' ? '#DCFCE7' : exp.status === 'deposit_paid' ? '#FEF3C7' : '#F3F4F6',
                        color: exp.status === 'paid_in_full' ? '#166534' : exp.status === 'deposit_paid' ? '#92400E' : '#4B5563'
                      }}>
                        {exp.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                      {exp.addedBy || 'Host'}
                    </td>
                    {canRecordExpense && (
                      <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '0.2rem' }}
                          title="Delete Expense"
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
