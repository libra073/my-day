import React from 'react';
import { useAiPlanner } from '../context/AiPlannerContext';
import { useAppContext } from '../context/AppContext';
import { DollarSign, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, ShieldAlert, ShieldCheck } from 'lucide-react';

const CATEGORY_NAMES = {
  venue: { en: 'Venue (Kumbi)', sw: 'Ukumbi (Kumbi)' },
  catering: { en: 'Catering (Food & Drinks)', sw: 'Chakula & Vinywaji' },
  decor: { en: 'Decoration (Wapambaji)', sw: 'Mapambo (Wapambaji)' },
  entertainment: { en: 'MC & Entertainment', sw: 'MC & Burudani' },
  photography: { en: 'Photo & Video', sw: 'Picha & Video' },
  transport: { en: 'Bridal Transport', sw: 'Usafiri wa Maharusi' },
  misc: { en: 'Emergency Reserve', sw: 'Akiba ya Dharura' },
};

export default function AIBudgetPlanCard() {
  const { budget, budgetPlan, planType, setPlanType, guestCount, location } = useAiPlanner();
  const { language, t } = useAppContext();
  const isSwahili = language === 'sw';

  if (!budgetPlan) {
    return null;
  }

  const meta = budgetPlan._meta || {};

  // Extract clean number allocations
  const numericEntries = Object.entries(budgetPlan).filter(([key, val]) => key !== '_meta' && typeof val === 'number');
  const totalAllocated = numericEntries.reduce((sum, [, val]) => sum + val, 0);
  const remainingBudget = (budget || totalAllocated) - totalAllocated;

  // Feasibility from meta or calculated
  const feasibility = meta.feasibility || (budget && budget < 500000 ? 'unrealistic' : 'balanced');
  const shortfall = meta.shortfall || (budget && meta.estimatedMinimum && meta.estimatedMinimum > budget ? meta.estimatedMinimum - budget : 0);
  const estimatedMinimum = meta.estimatedMinimum || null;
  const costPerGuest = meta.costPerGuest || (budget && guestCount ? Math.round(budget / guestCount) : 0);
  const cateringPerGuest = meta.cateringPerGuest || (budgetPlan.catering && guestCount ? Math.round(budgetPlan.catering / guestCount) : 0);

  // Feasibility UI messages
  const feasibilityMessage = meta.feasibilityReason || (
    feasibility === 'unrealistic'
      ? (isSwahili ? 'Tahadhari: Bajeti hii iko chini ya kiwango cha msingi cha kiuhalisia kwa idadi ya wageni uliyochagua.' : 'Caution: This budget is below the practical minimum estimated cost for the requested guests and services.')
      : feasibility === 'tight'
        ? (isSwahili ? 'Mpango huu unabana bajeti kwa ukaribu sana. Inashauriwa kuchagua menyu ya msingi.' : 'Budget is tight. Keep menus and extras streamlined.')
        : (isSwahili ? 'Mpango huu una uwiano mzuri na unatosha huduma zote za msingi.' : 'Balanced allocation with adequate coverage for key services.')
  );

  return (
    <div className="card" style={{
      padding: 'clamp(0.9rem, 3vw, 1.5rem)',
      marginTop: '1.25rem',
      background: '#FFFFFF',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
      minWidth: 0,
      width: '100%'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', minWidth: 0 }}>
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'var(--color-primary-light)',
            color: 'var(--color-accent)',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '0.35rem'
          }}>
            <Sparkles size={14} color="#F5A623" />
            <span>{t('ai_budget_plan_badge', 'Calculated AI Budget Plan')}</span>
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text)', overflowWrap: 'anywhere' }}>
            {t('ai_budget_breakdown_title', 'Recommended Budget Breakdown')}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', overflowWrap: 'anywhere' }}>
            {t('ai_total_budget_label', 'Total Event Budget')}: <strong style={{ color: 'var(--color-text)', fontSize: '1rem' }}>TSh {(budget || totalAllocated).toLocaleString()}</strong>
            {guestCount ? ` • ${guestCount} ${t('ai_guests_label', 'guests')}` : ''}
            {location ? ` • ${location}` : ''}
          </p>
        </div>

        {/* Plan Type Selector Toggle */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--color-surface-soft)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--color-border)',
          flexWrap: 'wrap',
          gap: '0.2rem'
        }}>
          {['budget', 'balanced', 'premium'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPlanType(type)}
              style={{
                background: planType === type ? 'var(--color-accent)' : 'transparent',
                color: planType === type ? '#FFFFFF' : 'var(--color-text-muted)',
                boxShadow: planType === type ? 'var(--shadow-xs)' : 'none',
                padding: '0.35rem clamp(0.55rem, 1.5vw, 0.85rem)',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-pill)',
                textTransform: 'capitalize',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                whiteSpace: 'nowrap'
              }}
            >
              {type === 'budget' ? (isSwahili ? 'Nafuu' : 'Budget') : type === 'balanced' ? (isSwahili ? 'Wastani' : 'Balanced') : (isSwahili ? 'Kifahari' : 'Premium')}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Bar: Cost Per Guest & Estimated Minimum */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(150px, 100%), 1fr))',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        minWidth: 0
      }}>
        {costPerGuest > 0 && (
          <div style={{
            background: 'var(--color-surface-soft)',
            padding: '0.65rem 0.95rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            minWidth: 0
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
              {isSwahili ? 'Gharama / Mgeni' : 'Total / Guest'}
            </span>
            <div style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', fontWeight: 900, color: 'var(--color-text)', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
              TSh {costPerGuest.toLocaleString()}
            </div>
          </div>
        )}

        {cateringPerGuest > 0 && (
          <div style={{
            background: 'var(--color-surface-soft)',
            padding: '0.65rem 0.95rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            minWidth: 0
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
              {isSwahili ? 'Chakula / Mgeni' : 'Food / Guest'}
            </span>
            <div style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', fontWeight: 900, color: 'var(--color-accent)', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
              TSh {cateringPerGuest.toLocaleString()}
            </div>
          </div>
        )}

        {estimatedMinimum > 0 && (
          <div style={{
            background: 'var(--color-surface-soft)',
            padding: '0.65rem 0.95rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            minWidth: 0
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
              {isSwahili ? 'Kima cha Chini' : 'Practical Minimum'}
            </span>
            <div style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', fontWeight: 900, color: 'var(--color-text)', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
              TSh {estimatedMinimum.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Feasibility Alert Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.65rem',
        padding: '0.85rem 1rem',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '1.25rem',
        background: (feasibility === 'unrealistic' || feasibility === 'difficult') ? '#FFEBEE' : feasibility === 'tight' ? '#FFF8E1' : '#E8F5E9',
        border: `1px solid ${(feasibility === 'unrealistic' || feasibility === 'difficult') ? '#EF5350' : feasibility === 'tight' ? '#FFB300' : '#4CAF50'}`,
        color: (feasibility === 'unrealistic' || feasibility === 'difficult') ? '#C62828' : feasibility === 'tight' ? '#B78103' : '#2E7D32',
        fontSize: '0.85rem',
        fontWeight: 600,
        lineHeight: 1.5,
        minWidth: 0,
        overflowWrap: 'anywhere'
      }}>
        {(feasibility === 'unrealistic' || feasibility === 'difficult') ? (
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
        ) : feasibility === 'tight' ? (
          <TrendingUp size={18} style={{ flexShrink: 0, marginTop: 2 }} />
        ) : (
          <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 2 }} />
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ overflowWrap: 'anywhere' }}>{feasibilityMessage}</div>
          {shortfall > 0 && (
            <div style={{ marginTop: '0.35rem', fontWeight: 700, fontSize: '0.82rem', overflowWrap: 'anywhere' }}>
              ⚠️ {isSwahili ? `Upungufu wa makadirio: TSh ${shortfall.toLocaleString()}` : `Estimated Budget Shortfall: TSh ${shortfall.toLocaleString()}`}
            </div>
          )}
        </div>
      </div>

      {/* Deficit Tradeoff Options when budget is unrealistic/difficult */}
      {meta.tradeoffOptions && meta.tradeoffOptions.length > 0 && (
        <div style={{
          background: '#FFF3E0',
          border: '1px solid #FFE0B2',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem',
          minWidth: 0
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#E65100', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldAlert size={15} style={{ flexShrink: 0 }} />
            <span>{isSwahili ? 'Chaguzi za Kubana Matumizi (Tradeoff Options)' : 'Actionable Tradeoff Recommendations'}</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#5D4037', lineHeight: 1.5, minWidth: 0 }}>
            {meta.tradeoffOptions.map((opt, idx) => (
              <li key={idx} style={{ overflowWrap: 'anywhere' }}>{opt}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Categories Allocations Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(210px, 100%), 1fr))',
        gap: '0.85rem',
        marginBottom: '1.25rem',
        minWidth: 0
      }}>
        {numericEntries.map(([category, amount]) => {
          const pct = budget ? Math.round((amount / budget) * 100) : 0;
          const catLabel = CATEGORY_NAMES[category] ? (isSwahili ? CATEGORY_NAMES[category].sw : CATEGORY_NAMES[category].en) : category;

          return (
            <div
              key={category}
              style={{
                background: amount === 0 ? '#FAFAFA' : 'var(--color-surface-soft)',
                border: `1px solid ${amount === 0 ? '#E0E0E0' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.45rem',
                opacity: amount === 0 ? 0.6 : 1,
                minWidth: 0
              }}
            >
              <div style={{ flex: '1 1 120px', minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)', textTransform: 'capitalize', overflowWrap: 'anywhere' }}>
                  {catLabel}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.1rem', overflowWrap: 'anywhere' }}>
                  {amount > 0 ? (pct > 0 ? `${pct}% ${isSwahili ? 'ya bajeti' : 'of budget'}` : 'Allocation') : (isSwahili ? 'Imeondolewa / Hiari' : 'Removed / Optional')}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: amount > 0 ? 'var(--color-accent)' : 'var(--color-text-muted)', overflowWrap: 'anywhere' }}>
                  TSh {amount.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '0.85rem',
        borderTop: '1px dashed var(--color-border)',
        fontSize: '0.85rem',
        color: 'var(--color-text-muted)',
        flexWrap: 'wrap',
        gap: '0.65rem',
        minWidth: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
          <DollarSign size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
          <span style={{ overflowWrap: 'anywhere' }}>{t('ai_total_allocated', 'Total Allocated')}: <strong>TSh {totalAllocated.toLocaleString()}</strong></span>
        </div>
        {meta.reserve > 0 && (
          <div style={{ color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', minWidth: 0 }}>
            <ShieldCheck size={14} style={{ flexShrink: 0 }} />
            <span style={{ overflowWrap: 'anywhere' }}>{isSwahili ? 'Akiba ya Dharura' : 'Contingency Reserve'}: TSh {meta.reserve.toLocaleString()}</span>
          </div>
        )}
        {remainingBudget !== 0 && (
          <div style={{ color: remainingBudget >= 0 ? 'var(--color-success)' : '#C62828', fontWeight: 700, overflowWrap: 'anywhere' }}>
            {remainingBudget >= 0 ? (isSwahili ? 'Pesa Iliyobaki' : 'Remaining Balance') : (isSwahili ? 'Iliyozidi' : 'Over Allocation')}: TSh {Math.abs(remainingBudget).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
