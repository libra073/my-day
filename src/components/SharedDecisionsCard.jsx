import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
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
  } = useAppContext();

  const permissions = wedding.permissions || {};
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
      alert('Please provide a decision title and at least 2 options.');
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
      alert(err.message || 'Failed to create decision');
    }
  };

  const handleVote = async (decisionId, optionId) => {
    try {
      await voteDecision(decisionId, optionId);
    } catch (err) {
      alert(err.message || 'Failed to register vote');
    }
  };

  const handleFinalizeDecision = async (decisionId, status) => {
    const notesInput = window.prompt(`Finalize decision as ${status.toUpperCase()}? Add notes/rationale:`, '');
    if (notesInput === null) return;
    try {
      await updateDecision(decisionId, { status, decisionNotes: notesInput });
    } catch (err) {
      alert(err.message || 'Failed to update decision');
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
      alert(err.message || 'Failed to create note');
    }
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 'var(--radius-xl)',
      padding: '1.75rem',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: '2rem'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary-hover)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            <Vote size={16} /> Shared Decisions & Shared Notes
          </div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-text)', fontWeight: 800, margin: 0 }}>
            Collaborative Choices & Knowledge Base
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            Vote on key options together (Bride, Groom, Planner, Family) and keep emergency notes synchronized.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {activeTab === 'decisions' && canManage && (
            <button
              onClick={() => setShowNewDecisionModal(!showNewDecisionModal)}
              style={{
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
            >
              <PlusCircle size={14} /> New Decision
            </button>
          )}

          {activeTab === 'notes' && (
            <button
              onClick={() => setShowNewNoteModal(!showNewNoteModal)}
              style={{
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
            >
              <PlusCircle size={14} /> Add Note
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('decisions')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.4rem 0.8rem',
            fontWeight: activeTab === 'decisions' ? 800 : 600,
            color: activeTab === 'decisions' ? 'var(--color-primary-hover)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'decisions' ? '2px solid var(--color-primary)' : 'none',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          Voting Polls ({decisions.length})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.4rem 0.8rem',
            fontWeight: activeTab === 'notes' ? 800 : 600,
            color: activeTab === 'notes' ? 'var(--color-primary-hover)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'notes' ? '2px solid var(--color-primary)' : 'none',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          Shared Notes & Briefs ({notes.length})
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
            Start a Collaborative Decision Poll
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Decision Title</label>
              <input
                type="text"
                placeholder="E.g. Cake Flavor & Bakery Selection"
                value={decTitle}
                onChange={e => setDecTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Description & Context</label>
              <input
                type="text"
                placeholder="Give details or budget ranges to consider"
                value={decDesc}
                onChange={e => setDecDesc(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Options to Vote On</label>
              {decOptions.map((opt, idx) => (
                <div key={idx} style={{ marginBottom: '0.4rem' }}>
                  <input
                    type="text"
                    placeholder={`Option ${idx + 1}`}
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
                + Add Another Option
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowNewDecisionModal(false)}
              style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ background: 'var(--color-primary)', color: '#FFFFFF', border: 'none', padding: '0.4rem 1.25rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Launch Decision Poll
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
            Add Shared Wedding Note
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Note Title</label>
              <input
                type="text"
                placeholder="E.g. Photography Shot List & Family Groupings"
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Content</label>
              <textarea
                rows={3}
                placeholder="Enter detailed notes, schedules, contacts, or instructions..."
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
                Pin this note to the top of the workspace
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowNewNoteModal(false)}
              style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ background: 'var(--color-primary)', color: '#FFFFFF', border: 'none', padding: '0.4rem 1.25rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Save Note
            </button>
          </div>
        </form>
      )}

      {/* Decisions List View */}
      {activeTab === 'decisions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {decisions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              No decisions polled yet. Start one above!
            </div>
          ) : (
            decisions.map(dec => {
              const isAgreed = dec.status === 'agreed';
              const isRejected = dec.status === 'rejected';

              return (
                <div
                  key={dec.id}
                  style={{
                    background: isAgreed ? '#F0FDF4' : '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    border: isAgreed ? '1px solid #BBF7D0' : '1px solid var(--color-border)',
                    padding: '1.25rem',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>{dec.title}</span>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-pill)',
                          background: isAgreed ? '#DCFCE7' : isRejected ? '#FEE2E2' : '#FEF3C7',
                          color: isAgreed ? '#166534' : isRejected ? '#991B1B' : '#92400E'
                        }}>
                          {dec.status.toUpperCase()}
                        </span>
                      </div>
                      {dec.description && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0.5rem' }}>{dec.description}</p>
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
                          Agree / Finalize
                        </button>
                        <button
                          onClick={() => handleFinalizeDecision(dec.id, 'rejected')}
                          style={{
                            background: '#FEE2E2',
                            color: '#DC2626',
                            border: 'none',
                            padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-pill)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Options Voting Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem', marginTop: '0.75rem' }}>
                    {dec.options.map(opt => {
                      const hasVoted = (opt.votes || []).includes(user.id);
                      const voteCount = (opt.votes || []).length;

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
                              {opt.text}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                              {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                            </div>
                          </div>

                          {canVote && dec.status === 'open' && (
                            <button
                              type="button"
                              style={{
                                background: hasVoted ? 'var(--color-primary)' : '#FFFFFF',
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
                              <ThumbsUp size={12} /> {hasVoted ? 'Voted' : 'Vote'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {dec.decisionNotes && (
                    <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', background: '#FFFFFF', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', fontSize: '0.8rem', color: 'var(--color-text)' }}>
                      <strong>Decision Note ({dec.decidedBy}):</strong> {dec.decisionNotes}
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
              No notes added yet. Add critical contacts or instructions above.
            </div>
          ) : (
            notes.map(n => (
              <div
                key={n.id}
                style={{
                  background: n.pinned ? '#FFFBEB' : '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: n.pinned ? '1px solid #FCD34D' : '1px solid var(--color-border)',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)' }}>
                    {n.title}
                  </div>
                  {n.pinned && (
                    <span title="Pinned Note" style={{ color: '#D97706' }}>
                      <Pin size={15} fill="#D97706" />
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', whiteSpace: 'pre-line', margin: '0.2rem 0 0.75rem' }}>
                  {n.content}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', borderTop: '1px dashed var(--color-border)', paddingTop: '0.4rem' }}>
                  Added by <strong>{n.authorName}</strong> on {new Date(n.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
