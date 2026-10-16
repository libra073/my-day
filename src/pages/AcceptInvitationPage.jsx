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
        background: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        maxWidth: '520px',
        width: '100%',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--color-border)',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary-hover)',
          marginBottom: '1.25rem'
        }}>
          <Heart size={32} fill="var(--color-primary-hover)" />
        </div>

        {loading ? (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>Verifying invitation link...</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Connecting to MY DAY secure workspace server...</p>
          </div>
        ) : errorMsg && !accepted ? (
          <div>
            <div style={{ display: 'inline-flex', color: 'var(--color-error)', marginBottom: '0.5rem' }}>
              <AlertTriangle size={36} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
              Invalid or Expired Invitation
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {errorMsg}
            </p>
            <Link
              to="/"
              style={{
                display: 'inline-block',
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                padding: '0.65rem 1.5rem',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}
            >
              Return to Home
            </Link>
          </div>
        ) : accepted ? (
          <div>
            <div style={{ display: 'inline-flex', color: 'var(--color-success)', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={40} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
              Welcome to the Wedding Workspace!
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Invitation accepted successfully. Redirecting you to the wedding dashboard...
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              display: 'inline-block',
              background: 'var(--color-surface-soft)',
              padding: '0.3rem 0.85rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--color-primary-hover)',
              marginBottom: '0.75rem'
            }}>
              Official Wedding Invitation
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
              {inviteData?.weddingTitle}
            </h1>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              <strong>{inviteData?.inviterName}</strong> has invited you to collaborate on their wedding planning workspace as a{' '}
              <strong style={{ color: 'var(--color-primary-hover)' }}>{inviteData?.role?.toUpperCase()}</strong>.
            </p>

            <div style={{
              background: 'var(--color-surface-soft)',
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.5rem',
              textAlign: 'left',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Assigned Role:</span>
                <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{inviteData?.role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Logged in as:</span>
                <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{user?.name} ({user?.email})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Link Expiry:</span>
                <span style={{ color: 'var(--color-text-muted)' }}>{new Date(inviteData?.expiresAt).toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={handleAccept}
              disabled={accepting}
              style={{
                width: '100%',
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.85rem',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 800,
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: accepting ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-glow)'
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
