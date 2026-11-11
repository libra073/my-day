import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bell, Check, CheckCheck, Clock, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react';

const NOTIF_ICONS = {
  task_assigned: <Clock size={14} color="var(--color-primary, #0071E3)" />,
  task_completed: <CheckCircle2 size={14} color="#059669" />,
  deadline_approaching: <AlertTriangle size={14} color="#D97706" />,
  budget_alert: <DollarSign size={14} color="#DC2626" />,
  member_joined: <Check size={14} color="var(--color-primary, #0071E3)" />,
};

export default function NotificationBell() {
  const {
    notifications,
    unreadNotifCount,
    markNotificationRead,
    markAllNotificationsRead,
    language = 'en',
  } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = (e, notifId) => {
    e.stopPropagation();
    markNotificationRead(notifId);
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markAllNotificationsRead();
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="nav-bell"
        style={{ position: 'relative' }}
        title={language === 'sw' ? 'Taarifa za Harusi' : 'Wedding Notifications'}
        aria-label={language === 'sw' ? 'Taarifa za Harusi' : 'Wedding Notifications'}
      >
        <Bell size={18} />
        {unreadNotifCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -3,
            right: -3,
            background: 'var(--p3d-grad-primary, linear-gradient(135deg, #0A84FF 0%, #0071E3 55%, #004085 100%))',
            color: '#FFFFFF',
            fontSize: '0.65rem',
            fontWeight: 800,
            width: 17,
            height: 17,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--color-header-bg)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="cl-notif-panel" style={{
          position: 'absolute',
          top: '120%',
          right: 0,
          width: 'min(330px, calc(100vw - 1.5rem))',
          maxWidth: 'calc(100vw - 1.5rem)',
          background: 'var(--app-card-bg, #ffffff)',
          borderRadius: '24px',
          boxShadow: 'var(--clay-shadow-soft)',
          border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '0.85rem 1.15rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--app-border, rgba(255, 255, 255, 0.6))',
            background: 'var(--app-surface-secondary, rgba(255, 255, 255, 0.45))'
          }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--app-text-primary, #0F172A)' }}>
              {language === 'sw' ? `Taarifa za Timu (${unreadNotifCount})` : `Team Notifications (${unreadNotifCount})`}
            </strong>
            {unreadNotifCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary, #0071E3)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}
              >
                <CheckCheck size={13} /> {language === 'sw' ? 'Weka zote zimesomwa' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--app-text-muted, #64748b)', fontSize: '0.8rem' }}>
                {language === 'sw' ? 'Hakuna taarifa bado.' : 'No notifications yet.'}
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--app-border, rgba(255, 255, 255, 0.4))',
                    background: n.read ? 'transparent' : 'rgba(255, 45, 149, 0.12)',
                    display: 'flex',
                    gap: '0.6rem',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ marginTop: '0.15rem' }}>
                    {NOTIF_ICONS[n.type] || <Bell size={14} color="#6B7280" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: n.read ? 600 : 800, color: 'var(--color-text)' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-dim)', marginTop: '0.25rem' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {!n.read && (
                    <button
                      onClick={(e) => handleMarkRead(e, n.id)}
                      title={language === 'sw' ? 'Weka imesomwa' : 'Mark as read'}
                      aria-label={language === 'sw' ? 'Weka imesomwa' : 'Mark as read'}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary-hover)',
                        cursor: 'pointer',
                        padding: '0.2rem'
                      }}
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
