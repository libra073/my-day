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

  const DEFAULT_TASK_LABELS = {
    'chk-1': {
      en: 'Choose wedding venue (Kumbi)',
      sw: 'Chagua ukumbi wa harusi (Kumbi)',
    },
    'chk-2': {
      en: 'Confirm estimated guest count',
      sw: 'Thibitisha makadirio ya idadi ya wageni',
    },
    'chk-3': {
      en: 'Select catering service and sample menu',
      sw: 'Chagua huduma ya chakula na uonje menyu',
    },
    'chk-4': {
      en: 'Select decoration & floral theme (Wapambaji)',
      sw: 'Chagua mandhari ya mapambo na maua (Wapambaji)',
    },
    'chk-5': {
      en: 'Hire Master of Ceremonies (MC) & DJ',
      sw: 'Ajiri Msimamizi wa Shughuli (MC) na DJ',
    },
    'chk-6': {
      en: 'Book professional wedding photographer & video',
      sw: 'Weka nafasi ya mpiga picha na video za harusi',
    },
    'chk-7': {
      en: 'Confirm bridal transport & convoy',
      sw: 'Thibitisha msafara wa magari ya maharusi',
    },
    'chk-8': {
      en: 'Confirm advance bookings (30% deposit guarantee)',
      sw: 'Thibitisha uhifadhi wa mapema (dhamana ya kianzio 30%)',
    },
  };

  const CATEGORY_LABELS = {
    venue: isSwahili ? 'Ukumbi' : 'Venue',
    general: isSwahili ? 'Jumla' : 'General',
    catering: isSwahili ? 'Chakula' : 'Catering',
    decoration: isSwahili ? 'Mapambo' : 'Decoration',
    decor: isSwahili ? 'Mapambo' : 'Decor',
    entertainment: isSwahili ? 'Burudani' : 'Entertainment',
    photography: isSwahili ? 'Picha & Video' : 'Photography',
    transport: isSwahili ? 'Usafiri' : 'Transport',
  };

  return (
    <div className="glass-card ai-checklist-card" style={{
      padding: 'clamp(1rem, 3vw, 1.75rem)',
      marginTop: '1.25rem',
      minWidth: 0,
      width: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem', minWidth: 0 }}>
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <div className="ai-checklist-badge-pill" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.85rem',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '0.45rem'
          }}>
            <Sparkles size={14} color="currentColor" />
            <span>{t('ai_checklist_badge', 'Live Preparation Checklist')}</span>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 850, color: 'var(--app-text-primary, #0F172A)', overflowWrap: 'anywhere' }}>
            {t('ai_checklist_title', 'Wedding Milestones & Tasks')}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--app-text-secondary, #475569)', overflowWrap: 'anywhere', fontWeight: 500 }}>
            {t('ai_checklist_subtitle', 'Stay organized with essential Tanzanian wedding milestones. Mark items complete as you progress.')}
          </p>
        </div>

        {/* Progress badge */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary, #0071E3)' }}>
            {completedCount} / {totalCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--app-text-muted, #64748B)', fontWeight: 700 }}>
            {progressPct}% {isSwahili ? 'imekamilika' : 'completed'}
          </div>
        </div>
      </div>

      {/* Progress Bar (Liquid Sapphire Optical Track) */}
      <div style={{
        height: 8,
        background: 'rgba(0, 113, 227, 0.12)',
        borderRadius: 'var(--radius-pill)',
        marginBottom: '1.35rem',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
        minWidth: 0
      }}>
        <div style={{
          height: '100%',
          width: `${progressPct}%`,
          background: 'var(--p3d-grad-primary, linear-gradient(135deg, #0A84FF 0%, #0071E3 55%, #004085 100%))',
          borderRadius: 'var(--radius-pill)',
          transition: 'width 0.4s ease'
        }} />
      </div>

      {/* Checklist items list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: 0 }}>
        {checklist.map((item) => {
          const localizedTask = DEFAULT_TASK_LABELS[item.id]
            ? DEFAULT_TASK_LABELS[item.id][language] || DEFAULT_TASK_LABELS[item.id].en
            : item.task;
          const localizedCategory = CATEGORY_LABELS[item.category] || item.category;

          return (
            <div
              key={item.id}
              onClick={() => toggleChecklistItem(item.id)}
              className={`ai-task${item.completed ? ' ai-task--done' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                <div style={{ color: item.completed ? '#10b981' : 'var(--color-primary, #0071E3)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {item.completed ? <CheckSquare size={19} color="#10b981" /> : <Square size={19} color="var(--color-primary, #0071E3)" />}
                </div>
                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: 650,
                  color: item.completed ? 'var(--app-text-muted, #64748B)' : 'var(--app-text-primary, #0F172A)',
                  textDecoration: item.completed ? 'line-through' : 'none',
                  flex: 1,
                  minWidth: 0,
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  lineHeight: 1.4
                }}>
                  {localizedTask}
                </div>
              </div>
              <span style={{
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 800,
                color: 'var(--color-primary, #0071E3)',
                background: 'rgba(0, 102, 238, 0.1)',
                border: '1px solid rgba(0, 102, 238, 0.18)',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-pill)',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}>
                {localizedCategory}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
