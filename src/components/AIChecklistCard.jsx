import React from 'react';
import { useAiPlanner } from '../context/AiPlannerContext';
import { useAppContext } from '../context/AppContext';
import { CheckSquare, Square, Sparkles } from 'lucide-react';

export default function AIChecklistCard() {
  const { checklist, toggleChecklistItem } = useAiPlanner();
  const { language, t } = useAppContext();
  const isSwahili = language === 'sw';

  if (!checklist || checklist.length === 0) {
    return null;
  }

  const completedCount = checklist.filter(c => c.completed).length;
  const totalCount = checklist.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem', minWidth: 0 }}>
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
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
            <span>{t('ai_checklist_badge', 'Live Preparation Checklist')}</span>
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text)', overflowWrap: 'anywhere' }}>
            {t('ai_checklist_title', 'Wedding Milestones & Tasks')}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', overflowWrap: 'anywhere' }}>
            {t('ai_checklist_subtitle', 'Stay organized with essential Tanzanian wedding milestones. Mark items complete as you progress.')}
          </p>
        </div>

        {/* Progress badge */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {completedCount} / {totalCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {progressPct}% {isSwahili ? 'imekamilika' : 'completed'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: 6,
        background: 'var(--color-surface-soft)',
        borderRadius: 'var(--radius-pill)',
        marginBottom: '1.25rem',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        minWidth: 0
      }}>
        <div style={{
          height: '100%',
          width: `${progressPct}%`,
          background: 'linear-gradient(90deg, #F5A623, #5C4331)',
          borderRadius: 'var(--radius-pill)',
          transition: 'width 0.4s ease'
        }} />
      </div>

      {/* Checklist items list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: 0 }}>
        {checklist.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleChecklistItem(item.id)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              background: item.completed ? 'var(--color-surface-soft)' : '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              opacity: item.completed ? 0.75 : 1,
              minWidth: 0
            }}
          >
            <div style={{ color: item.completed ? 'var(--color-success)' : 'var(--color-primary)', display: 'flex', alignItems: 'center', flexShrink: 0, marginTop: '2px' }}>
              {item.completed ? <CheckSquare size={20} /> : <Square size={20} />}
            </div>
            <div style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              textDecoration: item.completed ? 'line-through' : 'none',
              flex: 1,
              minWidth: 0,
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
              lineHeight: 1.45
            }}>
              {item.task}
            </div>
            <span style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
              color: 'var(--color-text-dim)',
              background: 'rgba(0, 0, 0, 0.04)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-pill)',
              flexShrink: 0,
              marginTop: '2px',
              whiteSpace: 'nowrap'
            }}>
              {item.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
