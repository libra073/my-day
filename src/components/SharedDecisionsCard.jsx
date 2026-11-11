import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { demoText } from '../i18n/demoContent';
import {
  Vote, PlusCircle, Pin, ThumbsUp
} from 'lucide-react';

export default function SharedDecisionsCard() {
  const {
    decisions,
    notes,
    user,
    wedding,
    createDecision,
    voteDecision,
    updateDecision,
    createNote,
    language,
  } = useAppContext();

  const isSwahili = language === 'sw';

  const permissions = wedding?.permissions || {};
  const canManage = permissions.canManageDecisions;
  const canVote = permissions.canVoteDecisions;

  const [activeTab, setActiveTab] = useState('decisions'); // 'decisions' | 'notes'
  const [showNewDecisionModal, setShowNewDecisionModal] = useState(false);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);

  // New Decision state
  const [decTitle, setDecTitle] = useState('');
  const [decDesc, setDecDesc] = useState('');
  const [decCat, setDecCat] = useState('general');
  const [decOptions, setDecOptions] = useState(['', '']);

  // New Note state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('general');
  const [notePinned, setNotePinned] = useState(false);

  const handleAddOptionField = () => {
    setDecOptions(prev => [...prev, '']);
  };

  const handleOptionChange = (idx, val) => {
    setDecOptions(prev => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const handleCreateDecisionSubmit = async (e) => {
    e.preventDefault();
    const cleanOptions = decOptions.filter(o => o.trim().length > 0);
    if (!decTitle.trim() || cleanOptions.length < 2) {
      alert(isSw ? 'Tafadhali weka kichwa cha uamuzi na chaguo angalau 2.' : 'Please provide a decision title and at least 2 options.');
      return;
    }

    try {
      await createDecision({
        title: decTitle.trim(),
        description: decDesc.trim(),
        category: decCat,
        options: cleanOptions,
      });
      setDecTitle('');
      setDecDesc('');
      setDecOptions(['', '']);
      setShowNewDecisionModal(false);
    } catch (err) {
      alert(err.message || (isSwahili ? 'Imeshindikana kuunda uamuzi' : 'Failed to create decision'));
    }
  };

  const handleVote = async (decisionId, optionId) => {
    try {
      await voteDecision(decisionId, optionId);
    } catch (err) {
      alert(err.message || (isSwahili ? 'Imeshindikana kusajili kura' : 'Failed to register vote'));
    }
  };

  const handleFinalizeDecision = async (decisionId, status) => {
    const notesInput = window.prompt(isSwahili ? `Thibitisha uamuzi kama ${status.toUpperCase()}? Ongeza maelezo au sababu:` : `Finalize decision as ${status.toUpperCase()}? Add notes/rationale:`, '');
    if (notesInput === null) return;
    try {
      await updateDecision(decisionId, { status, decisionNotes: notesInput });
    } catch (err) {
      alert(err.message || (isSwahili ? 'Imeshindikana kusasisha uamuzi' : 'Failed to update decision'));
    }
  };

  const handleCreateNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    try {
      await createNote({
        title: noteTitle.trim(),
        content: noteContent.trim(),
        category: noteCategory,
        pinned: notePinned,
      });
      setNoteTitle('');
      setNoteContent('');
      setNotePinned(false);
      setShowNewNoteModal(false);
    } catch (err) {
      alert(err.message || (isSwahili ? 'Imeshindikana kuunda dokezo' : 'Failed to create note'));
    }
  };

  return (
    <div style={{
      background: 'var(--app-card-bg, rgba(255, 255, 255, 0.72))',
      borderRadius: 'var(--radius-xl)',
      padding: '1.75rem 2rem',
      border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
      boxShadow: 'var(--clay-shadow)',
      marginBottom: '2rem'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.35rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary, #0071E3)', fontWeight: 800, fontSize: '0.82rem', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Vote size={16} /> {isSwahili ? 'Maamuzi ya Pamoja & Madokezo' : 'Shared Decisions & Shared Notes'}
          </div>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--app-text-primary, #0F172A)', fontWeight: 850, margin: 0, letterSpacing: '-0.02em' }}>
            {isSwahili ? 'Chaguzi za Ushirikiano & Taarifa Muhimu' : 'Collaborative Choices & Knowledge Base'}
          </h2>
          <p style={{ color: 'var(--app-text-muted, #64748B)', fontSize: '0.88rem', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
            {isSwahili
              ? 'Piga kura kwenye chaguzi muhimu pamoja (Bibi Harusi, Bwana Harusi, Mpangaji, Familia) na weka kumbukumbu zikisasishwa.'
              : 'Vote on key options together (Bride, Groom, Planner, Family) and keep emergency notes synchronized.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {activeTab === 'decisions' && canManage && (
            <button
              onClick={() => setShowNewDecisionModal(!showNewDecisionModal)}
              className="btn-primary"
              style={{
                padding: '0.55rem 1.15rem',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <PlusCircle size={14} /> {isSwahili ? 'Uamuzi Mpya' : 'New Decision'}
            </button>
          )}

          {activeTab === 'notes' && (
            <button
              onClick={() => setShowNewNoteModal(!showNewNoteModal)}
              className="btn-primary"
              style={{
                padding: '0.55rem 1.15rem',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <PlusCircle size={14} /> {isSwahili ? 'Ongeza Dokezo' : 'Add Note'}
            </button>
          )}
        </div>
      </div>

      {/* VisionOS Capsule Segmented Tabs */}
      <div style={{
        display: 'inline-flex',
        background: 'var(--app-surface-secondary, rgba(255, 255, 255, 0.65))',
        border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
        padding: '0.3rem',
        borderRadius: 'var(--radius-pill)',
        gap: '0.35rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
      }}>
        <button
          onClick={() => setActiveTab('decisions')}
          style={{
            background: activeTab === 'decisions' ? 'var(--p3d-grad-primary)' : 'transparent',
            color: activeTab === 'decisions' ? '#FFFFFF' : 'var(--color-text-muted)',
            border: activeTab === 'decisions' ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid transparent',
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.84rem',
            boxShadow: activeTab === 'decisions' ? '0 4px 14px rgba(110, 56, 28, 0.40)' : 'none',
            transition: 'var(--transition-fast)'
          }}
        >
          {isSwahili ? 'Kura za Maamuzi' : 'Voting Polls'} ({decisions.length})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          style={{
            background: activeTab === 'notes' ? 'var(--p3d-grad-primary)' : 'transparent',
            color: activeTab === 'notes' ? '#FFFFFF' : 'var(--color-text-muted)',
            border: activeTab === 'notes' ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid transparent',
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.84rem',
            boxShadow: activeTab === 'notes' ? '0 4px 14px rgba(110, 56, 28, 0.40)' : 'none',
            transition: 'var(--transition-fast)'
          }}
        >
          {isSwahili ? 'Madokezo ya Pamoja' : 'Shared Notes & Briefs'} ({notes.length})
        </button>
      </div>

      {/* New Decision Form Modal */}
      {showNewDecisionModal && (
        <form onSubmit={handleCreateDecisionSubmit} style={{
          background: 'var(--color-surface-soft)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
            {isSwahili ? 'Anzisha Kura ya Uamuzi wa Pamoja' : 'Start a Collaborative Decision Poll'}
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {isSwahili ? 'Kichwa cha Uamuzi' : 'Decision Title'}
              </label>
              <input
                type="text"
                placeholder={isSwahili ? 'Mfano: Ladha ya Keki & Chaguo la Bakery' : 'E.g. Cake Flavor & Bakery Selection'}
                value={decTitle}
                onChange={e => setDecTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {isSwahili ? 'Maelezo & Muktadha' : 'Description & Context'}
              </label>
              <input
                type="text"
                placeholder={isSwahili ? 'Weka maelezo au makadirio ya bajeti ya kuzingatia' : 'Give details or budget ranges to consider'}
                value={decDesc}
                onChange={e => setDecDesc(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {isSwahili ? 'Chaguzi za Kupigiwa Kura' : 'Options to Vote On'}
              </label>
              {decOptions.map((opt, idx) => (
                <div key={idx} style={{ marginBottom: '0.4rem' }}>
                  <input
                    type="text"
                    placeholder={isSwahili ? `Chaguo ${idx + 1}` : `Option ${idx + 1}`}
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    style={{ width: '100%', padding: '0.4rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddOptionField}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary-hover)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                + {isSwahili ? 'Ongeza Chaguo Lingine' : 'Add Another Option'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowNewDecisionModal(false)}
              style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              {isSwahili ? 'Ghairi' : 'Cancel'}
            </button>
            <button
              type="submit"
              style={{ background: 'var(--color-primary)', color: '#FFFFFF', border: 'none', padding: '0.4rem 1.25rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {isSwahili ? 'Zindua Kura ya Uamuzi' : 'Launch Decision Poll'}
            </button>
          </div>
        </form>
      )}

      {/* New Note Form Modal */}
      {showNewNoteModal && (
        <form onSubmit={handleCreateNoteSubmit} style={{
          background: 'var(--color-surface-soft)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
            {isSwahili ? 'Ongeza Dokezo la Harusi la Pamoja' : 'Add Shared Wedding Note'}
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {isSwahili ? 'Kichwa cha Dokezo' : 'Note Title'}
              </label>
              <input
                type="text"
                placeholder={isSwahili ? 'Mfano: Orodha ya Picha za Kupiga na Vikundi vya Familia' : 'E.g. Photography Shot List & Family Groupings'}
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {isSwahili ? 'Yaliyomo' : 'Content'}
              </label>
              <textarea
                rows={3}
                placeholder={isSwahili ? 'Andika madokezo ya kina, ratiba, mawasiliano, au maagizo...' : 'Enter detailed notes, schedules, contacts, or instructions...'}
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                required
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="pinnedNoteCheck"
                checked={notePinned}
                onChange={e => setNotePinned(e.target.checked)}
              />
              <label htmlFor="pinnedNoteCheck" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer' }}>
                {isSwahili ? 'Bandika dokezo hili juu ya nafasi ya kazi' : 'Pin this note to the top of the workspace'}
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowNewNoteModal(false)}
              style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              {isSwahili ? 'Ghairi' : 'Cancel'}
            </button>
            <button
              type="submit"
              style={{ background: 'var(--color-primary)', color: '#FFFFFF', border: 'none', padding: '0.4rem 1.25rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {isSwahili ? 'Hifadhi Dokezo' : 'Save Note'}
            </button>
          </div>
        </form>
      )}

      {/* Decisions List View */}
      {activeTab === 'decisions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {decisions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              {isSwahili ? 'Hakuna maamuzi yaliyopigiwa kura bado. Anzisha hapo juu!' : 'No decisions polled yet. Start one above!'}
            </div>
          ) : (
            decisions.map(dec => {
              const isAgreed = dec.status === 'agreed';
              const isRejected = dec.status === 'rejected';

              const statusBadgeLabel = isAgreed
                ? (isSwahili ? 'IMEKUBALIWA' : 'AGREED')
                : isRejected
                  ? (isSwahili ? 'IMEKATALIWA' : 'REJECTED')
                  : (isSwahili ? 'INAENDELEA' : 'OPEN');

              return (
                <div
                  key={dec.id}
                  style={{
                    background: isAgreed ? 'var(--color-success-bg, rgba(16, 185, 129, 0.1))' : 'var(--app-surface-elevated, #FFFFFF)',
                    borderRadius: 'var(--radius-lg)',
                    border: isAgreed ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--color-border)',
                    padding: '1.25rem',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>{demoText(dec.title, isSwahili)}</span>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-pill)',
                          background: isAgreed ? 'var(--color-success-bg, #DCFCE7)' : isRejected ? 'var(--color-error-bg, #FEE2E2)' : 'var(--color-warning-bg, #FEF3C7)',
                          color: isAgreed ? 'var(--color-success, #166534)' : isRejected ? 'var(--color-error, #991B1B)' : 'var(--color-warning, #92400E)'
                        }}>
                          {statusBadgeLabel}
                        </span>
                      </div>
                      {dec.description && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0.5rem' }}>{demoText(dec.description, isSwahili)}</p>
                      )}
                    </div>

                    {canManage && dec.status === 'open' && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleFinalizeDecision(dec.id, 'agreed')}
                          style={{
                            background: 'var(--color-success-bg)',
                            color: 'var(--color-success)',
                            border: '1px solid rgba(56, 161, 105, 0.3)',
                            padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-pill)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {isSwahili ? 'Kubaliana / Kamilisha' : 'Agree / Finalize'}
                        </button>
                        <button
                          onClick={() => handleFinalizeDecision(dec.id, 'rejected')}
                          style={{
                            background: 'var(--color-error-bg, rgba(239, 68, 68, 0.14))',
                            color: 'var(--color-error, #DC2626)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-pill)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {isSwahili ? 'Kataa' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Options Voting Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem', marginTop: '0.75rem' }}>
                    {dec.options.map(opt => {
                      const hasVoted = (opt.votes || []).includes(user.id);
                      const voteCount = (opt.votes || []).length;
                      const voteLabel = isSwahili
                        ? `${voteCount} ${voteCount === 1 ? 'kura' : 'kura'}`
                        : `${voteCount} ${voteCount === 1 ? 'vote' : 'votes'}`;

                      return (
                        <div
                          key={opt.id}
                          style={{
                            background: hasVoted ? 'rgba(255, 157, 59, 0.12)' : 'var(--color-surface-soft)',
                            border: hasVoted ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                            padding: '0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: canVote && dec.status === 'open' ? 'pointer' : 'default'
                          }}
                          onClick={() => {
                            if (canVote && dec.status === 'open') {
                              handleVote(dec.id, opt.id);
                            }
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)' }}>
                              {demoText(opt.text || opt.label, isSwahili)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                              {voteLabel}
                            </div>
                          </div>

                          {canVote && dec.status === 'open' && (
                            <button
                              type="button"
                              style={{
                                background: hasVoted ? 'var(--color-primary)' : 'var(--app-card-bg, #FFFFFF)',
                                color: hasVoted ? '#FFFFFF' : 'var(--color-text)',
                                border: '1px solid var(--color-border)',
                                padding: '0.3rem 0.6rem',
                                borderRadius: 'var(--radius-pill)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                cursor: 'pointer'
                              }}
                            >
                              <ThumbsUp size={12} /> {hasVoted ? (isSwahili ? 'Umepiga' : 'Voted') : (isSwahili ? 'Piga Kura' : 'Vote')}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {dec.decisionNotes && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.65rem 0.95rem',
                      background: 'var(--app-surface-secondary, rgba(255, 255, 255, 0.75))',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--app-border, rgba(255, 255, 255, 0.95))',
                      boxShadow: 'var(--clay-shadow-tile)',
                      fontSize: '0.8rem',
                      color: 'var(--app-text-primary, #1e293b)'
                    }}>
                      <strong style={{ color: 'var(--color-primary, #0071E3)' }}>{isSwahili ? `Dokezo la Uamuzi (${dec.decidedBy})` : `Decision Note (${dec.decidedBy})`}:</strong> {dec.decisionNotes}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Notes List View */}
      {activeTab === 'notes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {notes.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              {isSwahili ? 'Hakuna madokezo yaliyoongezwa bado. Ongeza mawasiliano au maagizo hapo juu.' : 'No notes added yet. Add critical contacts or instructions above.'}
            </div>
          ) : (
            notes.map(n => (
              <div
                key={n.id}
                style={{
                  background: n.pinned ? 'var(--color-warning-bg, #FFFBEB)' : 'var(--app-surface-elevated, #FFFFFF)',
                  borderRadius: 'var(--radius-lg)',
                  border: n.pinned ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid var(--color-border)',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)' }}>
                    {n.title}
                  </div>
                  {n.pinned && (
                    <span title={isSwahili ? 'Dokezo Lililobandikwa' : 'Pinned Note'} style={{ color: '#D97706' }}>
                      <Pin size={15} fill="#D97706" />
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', whiteSpace: 'pre-line', margin: '0.2rem 0 0.75rem' }}>
                  {n.content}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', borderTop: '1px dashed var(--color-border)', paddingTop: '0.4rem' }}>
                  {isSwahili ? 'Imeongezwa na ' : 'Added by '}<strong>{n.authorName}</strong> {isSwahili ? 'mnamo ' : 'on '}{new Date(n.createdAt).toLocaleDateString(isSwahili ? 'sw-TZ' : 'en-TZ')}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
