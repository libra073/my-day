import React, { useState, useRef, useEffect } from 'react';
import { useAiPlanner } from '../context/AiPlannerContext';
import { useAppContext } from '../context/AppContext';
import AIChatMessageContent from './AIChatMessageContent';
import { MessageSquare, X, Send, Sparkles, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AIChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const { messages, sendMessage, isLoading, resetPlanner } = useAiPlanner();
  const { t } = useAppContext();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    sendMessage(inputVal);
    setInputVal('');
  };

  return (
    <div style={{ position: 'fixed', bottom: 'max(1.25rem, env(safe-area-inset-bottom))', right: 'max(1rem, env(safe-area-inset-right))', zIndex: 950 }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'var(--color-mocha-dark, #3D2D21)',
            border: '2px solid #F5A623',
            color: '#F5A623',
            boxShadow: '0 8px 25px rgba(61, 45, 33, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            position: 'relative'
          }}
          title="MY DAY AI Planner"
        >
          <MessageSquare size={26} color="#F5A623" />
          <span style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 14,
            height: 14,
            background: '#F5A623',
            borderRadius: '50%',
            border: '2px solid #3D2D21'
          }} />
        </button>
      )}

      {/* Expanded Minimized Chat Box */}
      {isOpen && (
        <div style={{
          width: 'min(380px, calc(100vw - 1.5rem))',
          height: 'clamp(460px, 72vh, 560px)',
          maxHeight: 'calc(100vh - 2.5rem)',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #3D2D21 0%, #5C4331 100%)',
            color: '#FFFFFF',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minWidth: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(245, 166, 35, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Sparkles size={18} color="#F5A623" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>MY DAY AI</div>
                <div style={{ fontSize: '0.7rem', color: '#F5A623', opacity: 0.9 }}>Online Event Assistant</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
              <button
                type="button"
                onClick={resetPlanner}
                title="Reset Chat"
                style={{ background: 'transparent', border: 'none', color: '#FFFFFF', padding: '0.25rem', boxShadow: 'none' }}
              >
                <RefreshCw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#FFFFFF', padding: '0.25rem', boxShadow: 'none' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Navigate Full Screen banner */}
          <div style={{
            background: 'var(--color-primary-light)',
            padding: '0.4rem 0.85rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'var(--color-accent)',
            minWidth: 0,
            gap: '0.5rem'
          }}>
            <span style={{ overflowWrap: 'anywhere', minWidth: 0 }}>Full planning view available</span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/planner');
              }}
              style={{
                background: 'var(--color-accent)',
                color: '#FFFFFF',
                padding: '0.2rem 0.55rem',
                fontSize: '0.7rem',
                borderRadius: 'var(--radius-pill)',
                boxShadow: 'none',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              Open /planner
            </button>
          </div>

          {/* Messages list */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            background: 'var(--color-bg-base)',
            minWidth: 0
          }}>
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    minWidth: 0,
                    background: isUser ? 'var(--color-accent)' : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : 'var(--color-text)',
                    borderRadius: '16px',
                    borderBottomRightRadius: isUser ? '4px' : '16px',
                    borderBottomLeftRadius: isUser ? '16px' : '4px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.85rem',
                    lineHeight: 1.45,
                    boxShadow: 'var(--shadow-xs)',
                    border: isUser ? 'none' : '1px solid var(--color-border)',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word'
                  }}
                >
                  <AIChatMessageContent text={m.text} isUser={isUser} />
                </div>
              );
            })}
            {isLoading && (
              <div style={{
                alignSelf: 'flex-start',
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                boxShadow: 'var(--shadow-xs)',
                minWidth: 0
              }}>
                Typing response...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: '0.75rem',
              paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
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
              placeholder={t('type_message_placeholder', 'Type budget, location or query...')}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{
                flex: 1,
                minWidth: 0,
                width: '100%',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-pill)',
                padding: '0.5rem 0.85rem',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: 38,
                height: 38,
                padding: 0,
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                boxShadow: 'none',
                flexShrink: 0
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
