import React, { useState, useRef, useEffect } from 'react';
import { useAiPlanner } from '../context/AiPlannerContext';
import { useAppContext } from '../context/AppContext';
import AIBudgetPlanCard from '../components/AIBudgetPlanCard';
import AIVendorMatchesCard from '../components/AIVendorMatchesCard';
import AIChecklistCard from '../components/AIChecklistCard';
import AITimelineCard from '../components/AITimelineCard';
import AIChatMessageContent from '../components/AIChatMessageContent';
import { 
  Sparkles, Send, RefreshCw, Bot, User, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AIChatPage() {
  const {
    messages,
    sendMessage,
    isLoading,
    error,
    resetPlanner,
    budgetPlan,
    planType,
    setPlanType
  } = useAiPlanner();

  const { language, t } = useAppContext();
  const isSwahili = language === 'sw';

  const [inputVal, setInputVal] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'breakdown' | 'vendors' | 'checklist' | 'timeline'
  const chatScrollRef = useRef(null);
  const isUserScrollingRef = useRef(false);

  // Auto-scrolling logic:
  // Automatically scroll to the latest message, but NOT aggressively if the user scrolled up to read older messages
  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;

    if (!isUserScrollingRef.current) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleScroll = () => {
    const container = chatScrollRef.current;
    if (!container) return;
    // Check if user is scrolled up away from bottom
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    isUserScrollingRef.current = !isNearBottom;
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    // When sending new message, user intent is to see newest interaction
    isUserScrollingRef.current = false;
    sendMessage(inputVal);
    setInputVal('');
  };

  return (
    <div style={{ background: 'transparent', minHeight: 'calc(100vh - 72px)', padding: '1.5rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {/* Navigation Breadcrumb & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
              <ArrowLeft size={16} /> {t('nav_home', 'Home')}
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: 'var(--shadow-amber)'
              }}>
                <Sparkles size={20} />
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                MY DAY AI Planner
              </h1>
            </div>
          </div>

          {/* Reset Planner Action */}
          <button
            type="button"
            onClick={resetPlanner}
            className="ai-reset-btn"
          >
            <RefreshCw size={14} /> {t('reset_planner', 'Reset Planner')}
          </button>
        </div>

        {/* Responsive Two-Column Layout */}
        <div className="ai-planner-layout">
          
          {/* Left Column: Conversational Chat Interface (VisionOS Frosted Acrylic Glass) */}
          <div className="glass-card ai-chat-card" style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'clamp(540px, 78vh, 750px)',
            minHeight: '480px',
            minWidth: 0,
            width: '100%',
            overflow: 'hidden'
          }}>
            {/* Chat Top Banner */}
            <div className="ai-chat-banner">
              <div className="ai-banner-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', fontWeight: 800, minWidth: 0 }}>
                <Bot size={18} style={{ flexShrink: 0 }} />
                <span style={{ overflowWrap: 'anywhere' }}>{isSwahili ? 'Msaidizi Halisi wa Sherehe Tanzania' : 'Tanzanian Event Planning Specialist'}</span>
              </div>

              {/* Status Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 800, flexShrink: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
                <span>{isSwahili ? 'Mtandaoni' : 'Live & Ready'}</span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div
              ref={chatScrollRef}
              onScroll={handleScroll}
              className="ai-chat-stream"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'clamp(0.9rem, 2.5vw, 1.35rem)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                minWidth: 0
              }}
            >
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      gap: '0.65rem',
                      alignItems: 'flex-start',
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      maxWidth: 'min(92%, 100%)',
                      minWidth: 0
                    }}
                  >
                    {!isUser && (
                      <div className="ai-avatar ai-avatar--bot" style={{ marginTop: 2 }}>
                        <Bot size={18} />
                      </div>
                    )}

                    <div className={`ai-bubble${isUser ? ' ai-bubble--user' : ''} ai-bubble-animated`} style={{
                      padding: '0.9rem clamp(0.9rem, 2vw, 1.25rem)',
                      fontSize: '0.92rem',
                      lineHeight: 1.6,
                      minWidth: 0,
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word'
                    }}>
                      <AIChatMessageContent text={m.text} isUser={isUser} />

                      {/* Interactive Action Buttons if returned by AI */}
                      {m.actions && m.actions.length > 0 && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.4rem',
                          marginTop: '0.75rem',
                          paddingTop: '0.65rem',
                          borderTop: isUser ? '1px solid rgba(255,255,255,0.2)' : '1px dashed var(--color-border)'
                        }}>
                          {m.actions.map((act, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (act.type === 'CHANGE_PLAN') {
                                  setPlanType(act.value);
                                }
                              }}
                              className={`ai-chip${planType === act.value ? ' is-active' : ''}`}
                              style={{
                                whiteSpace: 'normal',
                                lineHeight: 1.3,
                                textAlign: 'center'
                              }}
                            >
                              {act.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="ai-avatar ai-avatar--user" style={{ marginTop: 2 }}>
                        <User size={18} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing loader */}
              {isLoading && (
                <div className="ai-bubble-animated" style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', minWidth: 0 }}>
                  <div className="ai-avatar ai-avatar--bot">
                    <Bot size={18} />
                  </div>
                  <div className="ai-typing" style={{ minWidth: 0, overflowWrap: 'anywhere', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="ai-typing-dots">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                    <span>{isSwahili ? 'MY DAY AI inachambua mpango wako...' : 'MY DAY AI is computing realistic allocations...'}</span>
                  </div>
                </div>
              )}

              {error && (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--color-error-bg, rgba(239, 68, 68, 0.14))',
                  color: 'var(--color-error, #EF4444)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  minWidth: 0,
                  overflowWrap: 'anywhere'
                }}>
                  {error}
                </div>
              )}
            </div>

            {/* Input Form (VisionOS Frosted Capsule) */}
            <form
              onSubmit={handleSend}
              className="ai-chat-composer"
              style={{
                padding: 'clamp(0.85rem, 2vw, 1rem) clamp(0.85rem, 2.5vw, 1.25rem)',
                paddingBottom: 'max(clamp(0.85rem, 2vw, 1rem), env(safe-area-inset-bottom))',
                gap: '0.5rem'
              }}
            >
              <input
                type="text"
                className="ai-chat-input"
                placeholder={t('type_message_placeholder', 'E.g. I have a wedding in Dar, budget 300k, 50 guests...')}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '0.75rem clamp(0.85rem, 2vw, 1.25rem)',
                  fontSize: '0.92rem',
                  fontWeight: 600
                }}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{
                  padding: '0.75rem clamp(1.15rem, 2vw, 1.5rem)',
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}
              >
                <span>{t('send_btn', 'Send')}</span>
                <Send size={16} />
              </button>
            </form>
          </div>

          {/* Right Column: Dynamic Planner Response Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0, width: '100%' }}>
            {/* Quick Status Bar */}
            <div className="glass-card glass-frosted-optical ai-status-card" style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                  {t('ai_planner_status', 'Planner Status')}
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-text)' }}>
                  {budgetPlan ? (isSwahili ? 'Mpango Umekamilika' : 'Plan Active') : (isSwahili ? 'Inasubiri Bajeti' : 'Awaiting Budget')}
                </div>
              </div>

              {budgetPlan && (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('breakdown')}
                    style={{
                      background: activeTab === 'breakdown' ? 'var(--color-accent)' : 'var(--color-surface-soft)',
                      color: activeTab === 'breakdown' ? '#FFFFFF' : 'var(--color-text)',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-pill)',
                      boxShadow: 'none'
                    }}
                  >
                    {t('ai_tab_breakdown', 'Budget')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('vendors')}
                    style={{
                      background: activeTab === 'vendors' ? 'var(--color-accent)' : 'var(--color-surface-soft)',
                      color: activeTab === 'vendors' ? '#FFFFFF' : 'var(--color-text)',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-pill)',
                      boxShadow: 'none'
                    }}
                  >
                    {t('ai_tab_vendors', 'Vendors')}
                  </button>
                </div>
              )}
            </div>

            {/* 1. Budget Plan Card */}
            <AIBudgetPlanCard />

            {/* 2. Vendor Matches Card */}
            <AIVendorMatchesCard />

            {/* 3. Milestone Checklist Card */}
            <AIChecklistCard />

            {/* 4. Preparation Timeline Card */}
            <AITimelineCard />
          </div>

        </div>
      </div>
    </div>
  );
}
