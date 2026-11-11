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
  const { t, language } = useAppContext();
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
    <div className="ai-chat-dock">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="ai-chat-toggle"
          title={language === 'sw' ? 'MY DAY AI Mpangaji wa Sherehe' : 'MY DAY AI Planner'}
          aria-label={language === 'sw' ? 'MY DAY AI Mpangaji wa Sherehe' : 'MY DAY AI Planner'}
        >
          <MessageSquare size={26} />
          <span className="ai-chat-toggle__status" aria-hidden="true" />
        </button>
      )}

      {isOpen && (
        <div className="ai-chat-panel">
          <div className="ai-chat-panel__header">
            <div className="ai-chat-panel__identity">
              <div className="ai-chat-panel__avatar">
                <Sparkles size={18} />
              </div>
              <div className="ai-chat-panel__meta">
                <div className="ai-chat-panel__title">MY DAY AI</div>
                <div className="ai-chat-panel__subtitle">
                  {language === 'sw' ? 'Msaidizi wa Shughuli Mtandaoni' : 'Online Event Assistant'}
                </div>
              </div>
            </div>

            <div className="ai-chat-panel__actions">
              <button
                type="button"
                onClick={resetPlanner}
                className="ai-icon-btn"
                title={language === 'sw' ? 'Anzisha Mazungumzo Upya' : 'Reset Chat'}
                aria-label={language === 'sw' ? 'Anzisha Mazungumzo Upya' : 'Reset Chat'}
              >
                <RefreshCw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="ai-icon-btn"
                title={language === 'sw' ? 'Funga' : 'Close'}
                aria-label={language === 'sw' ? 'Funga' : 'Close'}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="ai-chat-panel__banner">
            <span>
              {language === 'sw' ? 'Mpango kamili wa sherehe unapatikana' : 'Full planning view available'}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/planner');
              }}
              className="ai-chat-panel__open"
            >
              {language === 'sw' ? 'Fungua /planner' : 'Open /planner'}
            </button>
          </div>

          <div className="ai-chat-stream ai-chat-panel__stream">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`ai-bubble${isUser ? ' ai-bubble--user' : ''}`}
                >
                  <AIChatMessageContent text={m.text} isUser={isUser} />
                </div>
              );
            })}
            {isLoading && (
              <div className="ai-typing">
                {language === 'sw' ? 'Inaandika jibu...' : 'Typing response...'}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="ai-chat-composer">
            <input
              type="text"
              className="ai-chat-input"
              placeholder={t('type_message_placeholder', 'Type budget, location or query...')}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <button type="submit" disabled={isLoading} className="ai-chat-send" aria-label={t('send_btn', 'Send')}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
