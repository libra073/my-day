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

const QUICK_SUGGESTIONS = [
  { en: "I'm having a wedding in Dar es Salaam, budget 300k, 50 guests.", sw: "Nina harusi Dar es Salaam, bajeti laki 3, wageni 50." },
  { en: "Budget is 5 million TSh for 250 guests in Arusha. Show best plan.", sw: "Bajeti ni milioni 5 kwa wageni 250 Arusha. Nipe mpango bora." },
  { en: "Show me cheaper budget options for decor and entertainment.", sw: "Nionyeshe machaguo nafuu zaidi ya mapambo na muziki." },
  { en: "We have 15m TSh for a luxury wedding in Zanzibar with 150 guests.", sw: "Tuna milioni 15 kwa ajili ya harusi ya kifahari Zanzibar, wageni 150." },
];

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

  const handleQuickSuggestion = (text) => {
    isUserScrollingRef.current = false;
    sendMessage(text);
  };

  return (
    <div style={{ background: 'var(--color-bg-base)', minHeight: 'calc(100vh - 72px)', padding: '1.5rem 0 4rem' }}>
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
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontSize: '0.82rem',
              fontWeight: 700,
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-pill)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: 'var(--shadow-xs)',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} /> {t('reset_planner', 'Reset Planner')}
          </button>
        </div>

        {/* Responsive Two-Column Layout */}
        <div className="ai-planner-layout">
          
          {/* Left Column: Conversational Chat Interface */}
          <div className="card" style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            height: 'clamp(540px, 78vh, 750px)',
            minHeight: '480px',
            minWidth: 0,
            width: '100%',
            overflow: 'hidden'
          }}>
            {/* Chat Top Banner */}
            <div style={{
              background: 'var(--color-surface-soft)',
              padding: '0.85rem clamp(0.85rem, 2.5vw, 1.25rem)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              minWidth: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-accent)', minWidth: 0 }}>
                <Bot size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                <span style={{ overflowWrap: 'anywhere' }}>{isSwahili ? 'Msaidizi Halisi wa Sherehe Tanzania' : 'Tanzanian Event Planning Specialist'}</span>
              </div>

              {/* Status Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 700, flexShrink: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
                <span>{isSwahili ? 'Mtandaoni' : 'Live & Ready'}</span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div
              ref={chatScrollRef}
              onScroll={handleScroll}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'clamp(0.85rem, 2.5vw, 1.25rem)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                background: '#FAF8F5',
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
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--color-mocha-dark, #3D2D21)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#F5A623',
                        flexShrink: 0,
                        marginTop: 2
                      }}>
                        <Bot size={18} />
                      </div>
                    )}

                    <div style={{
                      background: isUser ? 'var(--color-mocha-dark, #3D2D21)' : '#FFFFFF',
                      color: isUser ? '#FFFFFF' : 'var(--color-text)',
                      padding: '0.85rem clamp(0.85rem, 2vw, 1.15rem)',
                      borderRadius: '18px',
                      borderBottomRightRadius: isUser ? '4px' : '18px',
                      borderBottomLeftRadius: isUser ? '18px' : '4px',
                      border: isUser ? 'none' : '1px solid var(--color-border)',
                      boxShadow: 'var(--shadow-xs)',
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
                              style={{
                                background: planType === act.value ? 'var(--color-primary)' : '#FFFFFF',
                                color: planType === act.value ? '#FFFFFF' : 'var(--color-text)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-pill)',
                                padding: '0.35rem 0.85rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                boxShadow: 'none',
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
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        flexShrink: 0,
                        marginTop: 2
                      }}>
                        <User size={18} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing loader */}
              {isLoading && (
                <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', minWidth: 0 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--color-mocha-dark, #3D2D21)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F5A623',
                    flexShrink: 0
                  }}>
                    <Bot size={18} />
                  </div>
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '0.6rem 1rem',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    minWidth: 0,
                    overflowWrap: 'anywhere'
                  }}>
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, flexShrink: 0 }} />
                    <span>{isSwahili ? 'MY DAY AI inachambua mpango wako...' : 'MY DAY AI is computing realistic allocations...'}</span>
                  </div>
                </div>
              )}

              {error && (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: '#FFEBEE',
                  color: '#C62828',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  border: '1px solid #EF5350',
                  minWidth: 0,
                  overflowWrap: 'anywhere'
                }}>
                  {error}
                </div>
              )}
            </div>

            {/* Quick Suggestions Pills */}
            <div style={{
              background: '#FFFFFF',
              borderTop: '1px solid var(--color-border)',
              padding: '0.65rem clamp(0.75rem, 2vw, 1rem)',
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              minWidth: 0
            }}>
              {QUICK_SUGGESTIONS.map((sug, idx) => {
                const text = isSwahili ? sug.sw : sug.en;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickSuggestion(text)}
                    style={{
                      background: 'var(--color-surface-soft)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-accent)',
                      borderRadius: '16px',
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      boxShadow: 'none',
                      flexShrink: 0,
                      maxWidth: 'min(380px, calc(100vw - 2.5rem))',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      textAlign: 'left',
                      lineHeight: 1.35
                    }}
                  >
                    💡 {text}
                  </button>
                );
              })}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSend}
              style={{
                padding: 'clamp(0.75rem, 2vw, 0.9rem) clamp(0.75rem, 2.5vw, 1.25rem)',
                paddingBottom: 'max(clamp(0.75rem, 2vw, 0.9rem), env(safe-area-inset-bottom))',
                background: '#FFFFFF',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: 0
              }}
            >
              <input
                type="text"
                placeholder={t('type_message_placeholder', 'E.g. I have a wedding in Dar, budget 300k, 50 guests...')}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  width: '100%',
                  background: 'var(--color-surface-soft)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.75rem clamp(0.85rem, 2vw, 1.25rem)',
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: 'var(--color-primary)',
                  color: '#FFFFFF',
                  padding: '0.75rem clamp(1rem, 2vw, 1.4rem)',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: 'var(--shadow-amber)',
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
            <div className="card" style={{
              padding: '1.25rem',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)'
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
