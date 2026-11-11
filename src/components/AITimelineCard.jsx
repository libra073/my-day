import React from 'react';
import { useAiPlanner } from '../context/AiPlannerContext';
import { useAppContext } from '../context/AppContext';
import { Calendar, Clock } from 'lucide-react';

export default function AITimelineCard() {
  const { eventDate, eventType } = useAiPlanner();
  const { language, t } = useAppContext();
  const isSwahili = language === 'sw';

  if (!eventDate) {
    return (
      <div className="glass-card" style={{
        padding: '1.75rem',
        marginTop: '1.25rem',
        background: 'var(--app-card-bg, rgba(255, 255, 255, 0.72))',
        borderRadius: 'var(--radius-xl)',
        border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
        textAlign: 'center'
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--p3d-grad-champagne-btn, linear-gradient(135deg, #FDF7F0 0%, #EBDDCB 100%))',
          border: '1.5px solid var(--app-border, rgba(168, 101, 62, 0.2))',
          color: 'var(--color-primary, #0071E3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.75rem',
          boxShadow: 'inset 0 1.5px 2px rgba(255,255,255,0.9), 0 4px 12px rgba(0, 102, 238, 0.15)'
        }}>
          <Calendar size={22} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.35rem' }}>
          {t('ai_timeline_empty_title', 'Event Timeline Pending')}
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--app-text-secondary, #475569)', maxWidth: '480px', margin: '0 auto', fontWeight: 500 }}>
          {isSwahili
            ? 'Tafadhali taja tarehe ya harusi/sherehe yako kwenye mazungumzo (mfano: 2026-12-25) ili nikuandalie ratiba ya maandalizi ya miezi 6 hadi siku ya tukio.'
            : 'Please mention your event date in the chat (e.g. December 25, 2026) so I can build your countdown preparation timeline.'}
        </p>
      </div>
    );
  }

  // Generate realistic milestone dates relative to event date
  const targetDate = new Date(eventDate);
  const isValidDate = !isNaN(targetDate.getTime());

  if (!isValidDate) {
    return null;
  }

  const formatDateOffset = (monthsBefore) => {
    const d = new Date(targetDate);
    d.setMonth(d.getMonth() - monthsBefore);
    return d.toLocaleDateString(isSwahili ? 'sw-TZ' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const milestones = [
    {
      period: isSwahili ? 'Miezi 6 Kabla' : '6 Months Before',
      date: formatDateOffset(6),
      title: isSwahili ? 'Weka Nafasi ya Ukumbi & Mtoa Chakula' : 'Secure Venue (Kumbi) & Catering',
      desc: isSwahili ? 'Lipa amana ya 30% kuhakikisha ukumbi na menyu vimefungwa kwenye kalenda.' : 'Pay initial 30% deposit to lock your high-demand date.',
    },
    {
      period: isSwahili ? 'Miezi 3 Kabla' : '3 Months Before',
      date: formatDateOffset(3),
      title: isSwahili ? 'Thibitisha MC, Wapambaji & Picha' : 'Confirm MC, Decorator & Photo/Video',
      desc: isSwahili ? 'Kutana na MC kwa ratiba na uchague mtindo wa maua na picha.' : 'Align on event script with your MC and finalize decor concept.',
    },
    {
      period: isSwahili ? 'Mwezi 1 Kabla' : '1 Month Before',
      date: formatDateOffset(1),
      title: isSwahili ? 'Kamilisha Idadi ya Wageni & Usafiri' : 'Finalize Guest RSVPs & Bridal Convoy',
      desc: isSwahili ? 'Thibitisha idadi halisi ya sahani za chakula na magari ya maharusi.' : 'Lock catering guest count and test transport routes.',
    },
    {
      period: isSwahili ? 'Wiki 1 Kabla' : '1 Week Before',
      date: formatDateOffset(0.25),
      title: isSwahili ? 'Majaribio ya Saloon & Mavazi' : 'Bridal Beauty & Final Rehearsals',
      desc: isSwahili ? 'Majaribio ya mwisho ya make-up, nywele na ratiba ya siku kuu.' : 'Final fittings, henna sessions, and vendor schedule confirmations.',
    },
    {
      period: isSwahili ? 'Siku ya Harusi' : 'Event Day',
      date: targetDate.toLocaleDateString(isSwahili ? 'sw-TZ' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      title: isSwahili ? 'Siku Yako Kamili ya Sherehe!' : 'Your Perfect Wedding Day!',
      desc: isSwahili ? 'Furahia harusi yako kwa amani wakati watoa huduma wakitekeleza majukumu yao.' : 'Relax and celebrate with your loved ones while MY DAY keeps everything organized.',
    },
  ];

  return (
    <div className="glass-card" style={{
      padding: 'clamp(1rem, 3vw, 1.75rem)',
      marginTop: '1.25rem',
      background: 'var(--app-card-bg, rgba(255, 255, 255, 0.72))',
      borderRadius: 'var(--radius-xl)',
      border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
      boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
      minWidth: 0,
      width: '100%'
    }}>
      <div style={{ marginBottom: '1.25rem', minWidth: 0 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'rgba(0, 102, 238, 0.12)',
          color: 'var(--color-primary, #0071E3)',
          padding: '0.3rem 0.85rem',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.75rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          border: '1px solid rgba(0, 102, 238, 0.22)',
          marginBottom: '0.45rem'
        }}>
          <Clock size={14} color="var(--color-primary, #0071E3)" />
          <span>{t('ai_timeline_badge', 'Preparation Milestones')}</span>
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 850, color: 'var(--app-text-primary, #0F172A)', overflowWrap: 'anywhere' }}>
          {t('ai_timeline_title', 'Countdown Preparation Timeline')}
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--app-text-secondary, #475569)', overflowWrap: 'anywhere', fontWeight: 500 }}>
          {t('ai_target_date_label', 'Event Date')}: <strong style={{ color: 'var(--color-text)' }}>{eventDate}</strong> ({eventType})
        </p>
      </div>

      {/* Timeline Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', minWidth: 0 }}>
        {milestones.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              position: 'relative',
              minWidth: 0
            }}
          >
            {/* Dot Indicator */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 28,
              flexShrink: 0
            }}>
              <div style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: idx === milestones.length - 1 ? 'var(--color-primary)' : 'var(--color-accent)',
                border: '3px solid #FFFFFF',
                boxShadow: '0 0 0 2px var(--color-primary)',
                zIndex: 2,
                flexShrink: 0
              }} />
              {idx < milestones.length - 1 && (
                <div style={{
                  width: 2,
                  height: 48,
                  background: 'var(--color-border)',
                  marginTop: 4
                }} />
              )}
            </div>

            {/* Content Box */}
            <div style={{
              flex: 1,
              background: 'var(--app-surface-elevated, var(--color-surface-soft))',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--app-border, var(--color-border))',
              minWidth: 0,
              overflowWrap: 'anywhere',
              wordBreak: 'break-word'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem', flexWrap: 'wrap', gap: '0.25rem', minWidth: 0 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary-hover)', overflowWrap: 'anywhere' }}>
                  {m.period} • {m.date}
                </span>
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.2rem', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                {m.title}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.45, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                {m.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
