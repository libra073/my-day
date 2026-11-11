import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, UserPlus, Trash2, Clock, Check, Copy, AlertCircle, RefreshCw } from 'lucide-react';
import GlassSelect from './ui/GlassSelect';

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
    workspaceLoading,
    language = 'en'
  } = useAppContext();

  const ROLE_LABELS = {
    owner: { label: language === 'sw' ? 'Mwenye Harusi (Mwenyeji)' : 'Owner (Wedding Host)', color: 'var(--color-primary, #0071E3)', bg: 'rgba(0, 102, 238, 0.12)' },
    partner: { label: language === 'sw' ? 'Mwenzi (Bibi / Bwana Harusi)' : 'Partner (Bride / Groom)', color: 'var(--clay-warning-text, #D97706)', bg: 'var(--clay-warning-bg, #FEF3C7)' },
    planner: { label: language === 'sw' ? 'Mratibu wa Harusi' : 'Wedding Planner / Coordinator', color: 'var(--color-primary, #0071E3)', bg: 'rgba(0, 102, 238, 0.14)' },
    family: { label: language === 'sw' ? 'Mwanafamilia' : 'Family Member', color: '#10B981', bg: 'rgba(16, 185, 129, 0.14)' },
    friend: { label: language === 'sw' ? 'Rafiki / Kamati ya Harusi' : 'Friend / Wedding Party', color: '#0056B3', bg: 'rgba(93, 58, 36, 0.14)' },
    vendor: { label: language === 'sw' ? 'Mtoa Huduma Aliyedhibitiwa' : 'Restricted Vendor', color: 'var(--app-text-secondary, #475569)', bg: 'var(--app-surface-elevated, #F1F5F9)' },
  };

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('partner');
  const [inviteHours, setInviteHours] = useState('48');
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  if (!wedding || !wedding.id) {
    return null;
  }

  const permissions = wedding?.permissions || {};
  const isOwner = wedding?.userRole === 'owner';
  const canInvite = permissions.canInviteMembers;

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
      setActionSuccess(language === 'sw' ? `Kiungo cha mwaliko kimetengenezwa kwa ajili ya ${inviteRole}!` : `Invitation link generated for ${inviteRole}!`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || (language === 'sw' ? 'Imeshindwa kutengeneza mwaliko' : 'Failed to generate invitation'));
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
      setActionSuccess(language === 'sw' ? 'Wadhifa wa mwanachama umesasishwa' : 'Member role updated successfully');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert(err.message || (language === 'sw' ? 'Imeshindwa kubadilisha wadhifa' : 'Failed to update member role'));
    }
  };

  const handleRemove = async (memberId, memberName) => {
    if (!window.confirm(language === 'sw' ? `Je, una uhakika unataka kumwondoa ${memberName} kwenye nafasi hii ya harusi?` : `Are you sure you want to remove ${memberName} from this wedding workspace?`)) return;
    try {
      await removeMember(memberId);
      setActionSuccess(language === 'sw' ? 'Mwanachama ameondolewa' : 'Member removed successfully');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert(err.message || (language === 'sw' ? 'Imeshindwa kumwondoa mwanachama' : 'Failed to remove member'));
    }
  };

  const handleRevoke = async (invitationId) => {
    if (!window.confirm(language === 'sw' ? 'Futa kiungo hiki cha mwaliko? Hakitaweza kutumika tena.' : 'Revoke this invitation link? It will no longer be usable.')) return;
    try {
      await revokeInvitation(invitationId);
      setActionSuccess(language === 'sw' ? 'Mwaliko umefutwa' : 'Invitation revoked');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert(err.message || (language === 'sw' ? 'Imeshindwa kufuta mwaliko' : 'Failed to revoke invitation'));
    }
  };

  return (
    <div style={{
      background: 'var(--app-card-bg, rgba(255, 255, 255, 0.72))',
      borderRadius: 'var(--radius-xl)',
      padding: 'clamp(1.25rem, 3.5vw, 2rem)',
      border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
      boxShadow: 'var(--clay-shadow)',
      marginBottom: '2rem',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary, #0071E3)', fontWeight: 800, fontSize: '0.82rem', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Users size={16} /> {language === 'sw' ? 'Kituo cha Ushirikiano wa Harusi' : 'Shared Wedding Collaboration Hub'}
          </div>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--app-text-primary, #0F172A)', fontWeight: 850, margin: 0, letterSpacing: '-0.02em' }}>
            {language === 'sw' ? 'Timu ya Harusi & Ufikiaji wa Wanachama' : 'Wedding Team & Member Access'}
          </h2>
          <p style={{ color: 'var(--app-text-muted, #64748B)', fontSize: '0.88rem', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
            {language === 'sw'
              ? 'Akaunti tofauti za Bibi na Bwana Harusi zinazoshiriki nafasi moja ya siri.'
              : 'Separate accounts for Bride & Groom sharing one private workspace with role-based permissions.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => refreshWorkspace()}
            className="btn-liquid-white"
            style={{
              padding: '0.55rem 1rem',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <RefreshCw size={13} className={workspaceLoading ? 'spin' : ''} /> {language === 'sw' ? 'Onyesha Upya' : 'Refresh'}
          </button>

          {canInvite && (
            <button
              onClick={() => { setShowInviteModal(!showInviteModal); setGeneratedInvite(null); setErrorMsg(''); }}
              className="btn-primary"
              style={{
                padding: '0.55rem 1.15rem',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <UserPlus size={15} /> {language === 'sw' ? 'Alika Mpenzi / Timu' : 'Invite Partner / Team'}
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
            {language === 'sw' ? 'Tengeneza Kiungo Salama cha Mwaliko' : 'Generate Secure Expiring Invitation'}
          </h3>
          <form onSubmit={handleGenerateInvite} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                {language === 'sw' ? 'Barua Pepe ya Mshirika (Hiari)' : 'Collaborator Email (Optional)'}
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
                {language === 'sw' ? 'Wadhifa wa Ufikiaji' : 'Access Role'}
              </label>
              <GlassSelect
                value={inviteRole}
                onChange={setInviteRole}
                ariaLabel={language === 'sw' ? 'Wadhifa wa Ufikiaji' : 'Access Role'}
                options={[
                  { value: 'partner', label: language === 'sw' ? 'Mwenzi (Bibi / Bwana Harusi)' : 'Partner (Bride / Groom)' },
                  { value: 'planner', label: language === 'sw' ? 'Mratibu wa Harusi' : 'Wedding Planner / Coordinator' },
                  { value: 'family', label: language === 'sw' ? 'Mwanafamilia' : 'Family Member' },
                  { value: 'friend', label: language === 'sw' ? 'Rafiki / Kamati ya Harusi' : 'Friend / Wedding Party' },
                  { value: 'vendor', label: language === 'sw' ? 'Mtoa Huduma Aliyedhibitiwa' : 'Restricted Vendor' },
                ]}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                {language === 'sw' ? 'Muda wa Kiungo' : 'Link Expiration'}
              </label>
              <GlassSelect
                value={inviteHours}
                onChange={setInviteHours}
                ariaLabel={language === 'sw' ? 'Muda wa Kiungo' : 'Link Expiration'}
                options={[
                  { value: '24', label: language === 'sw' ? 'Inaisha baada ya saa 24' : 'Expires in 24 hours' },
                  { value: '48', label: language === 'sw' ? 'Inaisha baada ya saa 48 (Kawaida)' : 'Expires in 48 hours (Default)' },
                  { value: '168', label: language === 'sw' ? 'Inaisha baada ya siku 7' : 'Expires in 7 days' },
                ]}
              />
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
                {language === 'sw' ? 'Tengeneza Kiungo cha Mwaliko' : 'Create Invitation Link'}
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
              padding: '1rem',
              background: 'var(--app-surface-secondary, rgba(255, 255, 255, 0.72))',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid rgba(245, 166, 35, 0.45)',
              boxShadow: 'var(--clay-shadow-tile)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary-hover)' }}>
                  ✅ {language === 'sw' ? 'Kiungo Kiko Tayari kwa' : 'Link Ready for'} {generatedInvite.role.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> {language === 'sw' ? 'Inaisha:' : 'Expires:'} {new Date(generatedInvite.expiresAt).toLocaleString()}
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
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? (language === 'sw' ? 'Kimenakiliwa!' : 'Copied!') : (language === 'sw' ? 'Nakili' : 'Copy')}
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
              <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{language === 'sw' ? 'Mwanachama' : 'Team Member'}</th>
              <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{language === 'sw' ? 'Mawasiliano' : 'Contact'}</th>
              <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{language === 'sw' ? 'Wadhifa' : 'Workspace Role'}</th>
              <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{language === 'sw' ? 'Hali' : 'Status'}</th>
              {isOwner && <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textAlign: 'right' }}>{language === 'sw' ? 'Vitendo' : 'Actions'}</th>}
            </tr>
          </thead>
          <tbody>
            {workspaceMembers.length === 0 ? (
              <tr>
                <td colSpan={isOwner ? 5 : 4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  {language === 'sw' ? 'Inapakia wanachama...' : 'Loading workspace members...'}
                </td>
              </tr>
            ) : (
              workspaceMembers.map(m => {
                const roleConfig = ROLE_LABELS[m.role] || ROLE_LABELS.friend;
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {language === 'sw' ? 'Alijiunga' : 'Joined'} {new Date(m.joinedAt).toLocaleDateString()}
                      </div>
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
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-success)' }} /> {language === 'sw' ? 'Amilifu' : 'Active'}
                      </span>
                    </td>
                    {isOwner && (
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        {!m.isOwner ? (
                          <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                            <GlassSelect
                              size="sm"
                              value={m.role}
                              onChange={(role) => handleRoleChange(m.id, role)}
                              ariaLabel={language === 'sw' ? 'Wadhifa wa mwanachama' : 'Member role'}
                              options={[
                                { value: 'partner', label: language === 'sw' ? 'Mwenzi' : 'Partner' },
                                { value: 'planner', label: language === 'sw' ? 'Mratibu' : 'Planner' },
                                { value: 'family', label: language === 'sw' ? 'Familia' : 'Family' },
                                { value: 'friend', label: language === 'sw' ? 'Rafiki' : 'Friend' },
                                { value: 'vendor', label: language === 'sw' ? 'Mtoa Huduma' : 'Vendor' },
                              ]}
                            />
                            <button
                              onClick={() => handleRemove(m.id, m.name)}
                              title={language === 'sw' ? 'Mtoe Mwanachama' : 'Remove Member'}
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
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                            {language === 'sw' ? 'Mwenyeji Mkuu' : 'Primary Host'}
                          </span>
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
            {language === 'sw'
              ? `Mialiko Inayosubiri (${pendingInvitations.filter(i => i.status === 'pending').length})`
              : `Pending Invitations (${pendingInvitations.filter(i => i.status === 'pending').length})`}
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
                  <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                    {language === 'sw' ? 'Wadhifa:' : 'Role:'} {inv.role.toUpperCase()}
                  </span>
                  {inv.email && <span style={{ color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>({inv.email})</span>}
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    {language === 'sw' ? 'Inaisha:' : 'Expires:'} {new Date(inv.expiresAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/invite/${inv.token}`);
                      alert(language === 'sw' ? 'Kiungo cha mwaliko kimenakiliwa!' : 'Invitation link copied to clipboard!');
                    }}
                    style={{
                      background: 'var(--app-surface-elevated, rgba(255, 255, 255, 0.85))',
                      border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-pill)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--app-text-primary, #0f172a)',
                      cursor: 'pointer'
                    }}
                  >
                    {language === 'sw' ? 'Nakili Kiungo' : 'Copy Link'}
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
                    {language === 'sw' ? 'Futa' : 'Revoke'}
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
