import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, UserPlus, Trash2, Clock, Check, Copy, AlertCircle, RefreshCw } from 'lucide-react';

const ROLE_LABELS = {
  owner: { label: 'Owner (Wedding Host)', color: 'var(--color-primary-hover)', bg: 'var(--color-primary-light)' },
  partner: { label: 'Partner (Bride / Groom)', color: '#D97706', bg: '#FEF3C7' },
  planner: { label: 'Wedding Planner / Coordinator', color: '#2563EB', bg: '#DBEAFE' },
  family: { label: 'Family Member', color: '#059669', bg: '#D1FAE5' },
  friend: { label: 'Friend / Wedding Party', color: '#7C3AED', bg: '#EDE9FE' },
  vendor: { label: 'Restricted Vendor', color: '#4B5563', bg: '#F3F4F6' },
};

export default function WorkspaceCollaborationCard() {
  const {
    wedding,
    workspaceMembers,
    pendingInvitations,
    inviteMember,
    changeMemberRole,
    removeMember,
    revokeInvitation,
    refreshWorkspace,
    workspaceLoading
  } = useAppContext();

  const permissions = wedding.permissions || {};
  const isOwner = wedding.userRole === 'owner';
  const canInvite = permissions.canInviteMembers;

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('partner');
  const [inviteHours, setInviteHours] = useState(48);
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const handleGenerateInvite = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const invite = await inviteMember({
        email: inviteEmail || undefined,
        role: inviteRole,
        expiresInHours: Number(inviteHours),
      });
      setGeneratedInvite(invite);
      setActionSuccess(`Invitation link generated for ${inviteRole}!`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate invitation');
    }
  };

  const handleCopyLink = () => {
    if (!generatedInvite) return;
    const fullUrl = `${window.location.origin}/invite/${generatedInvite.token}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await changeMemberRole(memberId, newRole);
      setActionSuccess('Member role updated successfully');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update member role');
    }
  };

  const handleRemove = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this wedding workspace?`)) return;
    try {
      await removeMember(memberId);
      setActionSuccess('Member removed successfully');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to remove member');
    }
  };

  const handleRevoke = async (invitationId) => {
    if (!window.confirm('Revoke this invitation link? It will no longer be usable.')) return;
    try {
      await revokeInvitation(invitationId);
      setActionSuccess('Invitation revoked');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to revoke invitation');
    }
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 'var(--radius-xl)',
      padding: 'clamp(1rem, 3.5vw, 1.75rem)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: '2rem',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary-hover)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            <Users size={16} /> Shared Wedding Collaboration Hub
          </div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-text)', fontWeight: 800, margin: 0 }}>
            Wedding Team & Member Access
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            Separate accounts for Bride & Groom sharing one private workspace with role-based permissions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => refreshWorkspace()}
            style={{
              background: 'var(--color-surface-soft)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} className={workspaceLoading ? 'spin' : ''} /> Refresh
          </button>

          {canInvite && (
            <button
              onClick={() => { setShowInviteModal(!showInviteModal); setGeneratedInvite(null); setErrorMsg(''); }}
              style={{
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.55rem 1.15rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <UserPlus size={15} /> Invite Partner / Member
            </button>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div style={{
          background: 'var(--color-success-bg)',
          color: 'var(--color-success)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius)',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Check size={16} /> {actionSuccess}
        </div>
      )}

      {/* Invite Modal / Box */}
      {showInviteModal && (
        <div style={{
          background: 'var(--color-surface-soft)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Generate Secure Expiring Invitation
          </h3>
          <form onSubmit={handleGenerateInvite} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                Collaborator Email (Optional)
              </label>
              <input
                type="email"
                placeholder="partner@example.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                Access Role
              </label>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: '#FFFFFF' }}
              >
                <option value="partner">Partner (Bride / Groom)</option>
                <option value="planner">Wedding Planner / Coordinator</option>
                <option value="family">Family Member</option>
                <option value="friend">Friend / Wedding Party</option>
                <option value="vendor">Restricted Vendor</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                Link Expiration
              </label>
              <select
                value={inviteHours}
                onChange={e => setInviteHours(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: '#FFFFFF' }}
              >
                <option value="24">Expires in 24 hours</option>
                <option value="48">Expires in 48 hours (Default)</option>
                <option value="168">Expires in 7 days</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'var(--color-primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.55rem',
                  borderRadius: 'var(--radius)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Create Invitation Link
              </button>
            </div>
          </form>

          {errorMsg && (
            <div style={{ color: 'var(--color-error)', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}

          {generatedInvite && (
            <div style={{
              marginTop: '1rem',
              padding: '0.85rem',
              background: '#FFFFFF',
              borderRadius: 'var(--radius)',
              border: '1px solid rgba(255, 157, 59, 0.4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary-hover)' }}>
                  ✅ Link Ready for {generatedInvite.role.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> Expires: {new Date(generatedInvite.expiresAt).toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/invite/${generatedInvite.token}`}
                  style={{ flex: 1, padding: '0.45rem 0.65rem', fontSize: '0.8rem', fontFamily: 'monospace', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-surface-soft)' }}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    background: copied ? 'var(--color-success)' : 'var(--color-primary)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Members Table */}
      <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '1.5rem' }}>
        <table style={{ width: '100%', minWidth: '460px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
              <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>Team Member</th>
              <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>Contact</th>
              <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>Workspace Role</th>
              <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>Status</th>
              {isOwner && <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {workspaceMembers.length === 0 ? (
              <tr>
                <td colSpan={isOwner ? 5 : 4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Loading workspace members...
                </td>
              </tr>
            ) : (
              workspaceMembers.map(m => {
                const roleConfig = ROLE_LABELS[m.role] || ROLE_LABELS.friend;
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Joined {new Date(m.joinedAt).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-text-muted)' }}>
                      <div>{m.email}</div>
                      {m.phone && <div style={{ fontSize: '0.75rem' }}>{m.phone}</div>}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        display: 'inline-block',
                        background: roleConfig.bg,
                        color: roleConfig.color,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-pill)',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}>
                        {roleConfig.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-success)' }} /> Active
                      </span>
                    </td>
                    {isOwner && (
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        {!m.isOwner ? (
                          <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                            <select
                              value={m.role}
                              onChange={e => handleRoleChange(m.id, e.target.value)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--color-border)',
                                background: '#FFFFFF'
                              }}
                            >
                              <option value="partner">Partner</option>
                              <option value="planner">Planner</option>
                              <option value="family">Family</option>
                              <option value="friend">Friend</option>
                              <option value="vendor">Vendor</option>
                            </select>
                            <button
                              onClick={() => handleRemove(m.id, m.name)}
                              title="Remove Member"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-error)',
                                padding: '0.25rem',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Primary Host</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pending Invitations List */}
      {canInvite && pendingInvitations.filter(i => i.status === 'pending').length > 0 && (
        <div style={{ marginTop: '1rem', borderTop: '1px dashed var(--color-border)', paddingTop: '1rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            Pending Invitations ({pendingInvitations.filter(i => i.status === 'pending').length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {pendingInvitations.filter(i => i.status === 'pending').map(inv => (
              <div key={inv.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.6rem 0.85rem',
                background: 'var(--color-surface-soft)',
                borderRadius: 'var(--radius)',
                fontSize: '0.8rem'
              }}>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>Role: {inv.role.toUpperCase()}</span>
                  {inv.email && <span style={{ color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>({inv.email})</span>}
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    Expires: {new Date(inv.expiresAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/invite/${inv.token}`);
                      alert('Invitation link copied to clipboard!');
                    }}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid var(--color-border)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => handleRevoke(inv.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: 'var(--color-error)',
                      border: 'none',
                      padding: '0.25rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
