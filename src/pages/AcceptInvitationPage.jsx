import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import { Heart, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function AcceptInvitationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, refreshWorkspace } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    async function fetchInvitation() {
      try {
        setLoading(true);
        setErrorMsg('');
        const res = await api.getInvitationByToken(token);
        if (res.invitation) {
          setInviteData(res.invitation);
          if (res.invitation.status === 'expired') {
            setErrorMsg('This invitation link has expired.');
          } else if (res.invitation.status === 'revoked') {
            setErrorMsg('This invitation link was revoked by the wedding host.');
          } else if (res.invitation.status === 'accepted') {
            setErrorMsg('This invitation has already been accepted.');
          }
        }
      } catch (err) {
        setErrorMsg(err.message || 'Invitation not found or invalid.');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const handleAccept = async () => {
    try {
      setAccepting(true);
      setErrorMsg('');
      const res = await api.acceptInvitation(token);
      if (res.success || res.message) {
        setAccepted(true);
        await refreshWorkspace(res.workspaceId);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to accept invitation.');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        background: 'var(--app-card-bg, #fffdfb)',
        borderRadius: '26px',
        padding: '2.75rem 2.25rem',
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 16px 38px -22px rgba(96, 74, 140, 0.32), 0 2px 6px rgba(96, 74, 140, 0.05)',
        border: '1px solid var(--app-border, #efe8f1)',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 68,
          height: 68,
          borderRadius: '50%',
          background: 'var(--clay-lav-soft)',
          color: 'var(--clay-purple-deep)',
          border: '1px solid var(--app-border, #e3dbf7)',
          marginBottom: '1.25rem'
        }}>
          <Heart size={32} fill="#8b7cf6" color="#8b7cf6" />
        </div>

        {loading ? (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--app-text-primary, #0f172a)' }}>Verifying invitation link...</h2>
            <p style={{ color: 'var(--app-text-muted, #64748b)', fontSize: '0.9rem', marginTop: '0.35rem' }}>Connecting to MY DAY secure workspace server...</p>
          </div>
        ) : errorMsg && !accepted ? (
          <div>
            <div style={{ display: 'inline-flex', color: '#e11d48', marginBottom: '0.5rem' }}>
              <AlertTriangle size={36} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--app-text-primary, #0f172a)', marginBottom: '0.5rem' }}>
              Invalid or Expired Invitation
            </h2>
            <p style={{ color: 'var(--app-text-muted, #64748b)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {errorMsg}
            </p>
            <Link
              to="/"
              className="btn-primary"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.75rem',
                fontSize: '0.9rem'
              }}
            >
              Return to Home
            </Link>
          </div>
        ) : accepted ? (
          <div>
            <div style={{ display: 'inline-flex', color: '#059669', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={40} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--app-text-primary, #0f172a)', marginBottom: '0.5rem' }}>
              Welcome to the Wedding Workspace!
            </h2>
            <p style={{ color: 'var(--app-text-muted, #64748b)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              Invitation accepted successfully. Redirecting you to the wedding dashboard...
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              display: 'inline-block',
              background: 'rgba(0, 102, 238, 0.12)',
              border: '1px solid rgba(0, 102, 238, 0.22)',
              padding: '0.35rem 0.95rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: 'var(--color-primary, #0071E3)',
              marginBottom: '0.75rem'
            }}>
              Official Wedding Invitation
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 850, color: 'var(--app-text-primary, #0F172A)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              {inviteData?.weddingTitle}
            </h1>

            <p style={{ color: 'var(--app-text-secondary, #475569)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--app-text-primary, #0F172A)' }}>{inviteData?.inviterName}</strong> has invited you to collaborate on their wedding planning workspace as a{' '}
              <strong style={{ color: 'var(--color-primary, #0071E3)' }}>{inviteData?.role?.toUpperCase()}</strong>.
            </p>

            <div style={{
              background: 'var(--app-surface-secondary, rgba(255, 255, 255, 0.65))',
              border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
              boxShadow: 'var(--clay-shadow-tile, 0 4px 12px rgba(15, 23, 42, 0.03))',
              padding: '1.15rem',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.5rem',
              textAlign: 'left',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <span style={{ color: 'var(--app-text-muted, #64748b)' }}>Assigned Role:</span>
                <span style={{ fontWeight: 800, color: 'var(--app-text-primary, #0f172a)' }}>{inviteData?.role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <span style={{ color: 'var(--app-text-muted, #64748b)' }}>Logged in as:</span>
                <span style={{ fontWeight: 800, color: 'var(--app-text-primary, #0f172a)' }}>{user?.name} ({user?.email})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--app-text-muted, #64748b)' }}>Link Expiry:</span>
                <span style={{ color: 'var(--app-text-muted, #64748b)' }}>{new Date(inviteData?.expiresAt).toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={handleAccept}
              disabled={accepting}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: accepting ? 'not-allowed' : 'pointer',
              }}
            >
              {accepting ? 'Joining Workspace...' : 'Accept Invitation & Join'} <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
