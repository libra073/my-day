import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { demoText } from '../i18n/demoContent';
import { getTodayDarEsSalaam } from '../services/businessSchedule';
import {
  CheckSquare, PlusCircle, CheckCircle2, Clock, AlertTriangle, XCircle,
  MessageSquare, History, User, Calendar, Trash2, Send, ChevronDown, ChevronUp
} from 'lucide-react';
import GlassDatePicker from './ui/GlassDatePicker';
import GlassSelect from './ui/GlassSelect';

const PRIORITY_STYLES = {
  high: { label: 'High Priority', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.14)' },
  medium: { label: 'Medium Priority', color: 'var(--clay-warning-text, #D97706)', bg: 'var(--clay-warning-bg, rgba(245, 158, 11, 0.14))' },
  low: { label: 'Low Priority', color: 'var(--color-primary, #0071E3)', bg: 'rgba(0, 102, 238, 0.14)' },
};

const STATUS_ICONS = {
  pending: <Clock size={15} color="#D97706" />,
  completed: <CheckCircle2 size={15} color="#059669" />,
  overdue: <AlertTriangle size={15} color="#DC2626" />,
  missed: <XCircle size={15} color="#6B7280" />,
};

export default function SharedChecklistCard() {
  const {
    tasks,
    workspaceMembers,
    user,
    wedding,
    createTask,
    updateTask,
    deleteTask,
    addTaskComment,
    language = 'en',
  } = useAppContext();

  const permissions = wedding?.permissions || {};
  const canManage = permissions.canManageTasks;

  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'overdue' | 'completed' | 'missed'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTaskDetailId, setActiveTaskDetailId] = useState(null);
  const [activeTabSection, setActiveTabSection] = useState('comments'); // 'comments' | 'history'
  const [newCommentText, setNewCommentText] = useState('');

  // Create form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(user?.id || '');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-11-01');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTask(task.id, { status: newStatus });
    } catch (err) {
      alert(err.message || (language === 'sw' ? 'Imeshindwa kubadilisha hali ya jukumu' : 'Failed to update task status'));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setIsSubmitting(true);
      await createTask({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        assigneeId: newTaskAssignee || null,
        dueDate: newTaskDueDate || null,
        priority: newTaskPriority,
      });
      setNewTaskTitle('');
      setNewTaskDesc('');
      setShowCreateModal(false);
    } catch (err) {
      alert(err.message || (language === 'sw' ? 'Imeshindwa kuongeza jukumu' : 'Failed to create task'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm(language === 'sw' ? 'Je, una uhakika unataka kufuta jukumu hili?' : 'Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
    } catch (err) {
      alert(err.message || (language === 'sw' ? 'Imeshindwa kufuta jukumu' : 'Failed to delete task'));
    }
  };

  const handleAddComment = async (taskId) => {
    if (!newCommentText.trim()) return;
    try {
      await addTaskComment(taskId, newCommentText.trim());
      setNewCommentText('');
    } catch (err) {
      alert(err.message || (language === 'sw' ? 'Imeshindwa kutuma maoni' : 'Failed to post comment'));
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary, #0071E3)', fontWeight: 800, fontSize: '0.82rem', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <CheckSquare size={16} /> {language === 'sw' ? 'Orodha ya Pamoja ya Harusi' : 'Synchronized Wedding Checklist'}
          </div>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--app-text-primary, #0F172A)', fontWeight: 850, margin: 0, letterSpacing: '-0.02em' }}>
            {language === 'sw' ? 'Majukumu & Mambo ya Kufanya kwa Ushirikiano' : 'Collaborative Tasks & Action Items'}
          </h2>
          <p style={{ color: 'var(--app-text-muted, #64748B)', fontSize: '0.88rem', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
            {language === 'sw'
              ? 'Wahusika, tarehe za mwisho, maoni, na ufuatiliaji wa kuchelewa kwenye vifaa vyote.'
              : 'Assignees, due dates, comment threads, and automatic overdue tracking across all team devices.'}
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowCreateModal(!showCreateModal)}
            className="btn-primary"
            style={{
              padding: '0.6rem 1.25rem',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <PlusCircle size={15} /> {language === 'sw' ? 'Weka Jukumu' : 'Add Task'}
          </button>
        )}
      </div>

      {/* Filter Tabs - VisionOS Frosted Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.35rem' }}>
        {[
          { id: 'all', label: language === 'sw' ? `Majukumu Yote (${tasks.length})` : `All Tasks (${tasks.length})` },
          { id: 'pending', label: language === 'sw' ? `Yanasubiri (${tasks.filter(t => t.status === 'pending').length})` : `Pending (${tasks.filter(t => t.status === 'pending').length})` },
          { id: 'overdue', label: language === 'sw' ? `Yaliyochelewa (${tasks.filter(t => t.status === 'overdue').length})` : `Overdue (${tasks.filter(t => t.status === 'overdue').length})` },
          { id: 'completed', label: language === 'sw' ? `Yaliyokamilika (${tasks.filter(t => t.status === 'completed').length})` : `Completed (${tasks.filter(t => t.status === 'completed').length})` },
          { id: 'missed', label: language === 'sw' ? `Yaliyokosekana (${tasks.filter(t => t.status === 'missed').length})` : `Missed (${tasks.filter(t => t.status === 'missed').length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: '0.4rem 0.95rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.8rem',
              fontWeight: 750,
              background: filter === tab.id ? 'var(--p3d-grad-primary, linear-gradient(135deg, #0A84FF 0%, #0071E3 55%, #004085 100%))' : 'var(--app-surface-elevated, rgba(255, 252, 247, 0.85))',
              color: filter === tab.id ? '#FFFFFF' : 'var(--app-text-secondary, #475569)',
              border: filter === tab.id ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid var(--app-border, rgba(168, 101, 62, 0.2))',
              boxShadow: filter === tab.id ? '0 4px 14px rgba(0, 102, 238, 0.35)' : '0 2px 6px rgba(84, 50, 29, 0.04)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task Creation Form Modal/Card */}
      {showCreateModal && (
        <form onSubmit={handleCreateTask} style={{
          background: 'var(--color-surface-soft)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
            {language === 'sw' ? 'Tengeneza Jukumu Jipya' : 'Create New Action Item'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {language === 'sw' ? 'Jina la Jukumu' : 'Task Title'}
              </label>
              <input
                type="text"
                placeholder={language === 'sw' ? 'Mf. Kamilisha mkataba wa MC na mfumo wa sauti' : 'E.g. Finalize MC and Sound Equipment contract'}
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {language === 'sw' ? 'Maelezo & Taarifa Muhimu' : 'Description & Key Notes'}
              </label>
              <input
                type="text"
                placeholder={language === 'sw' ? 'Maagizo maalum, mahitaji, au namba ya mtoa huduma' : 'Specific instructions, requirements, or vendor contact info'}
                value={newTaskDesc}
                onChange={e => setNewTaskDesc(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {language === 'sw' ? 'Mhusika' : 'Assignee'}
              </label>
              <GlassSelect
                value={newTaskAssignee}
                onChange={setNewTaskAssignee}
                ariaLabel={language === 'sw' ? 'Mhusika' : 'Assignee'}
                options={workspaceMembers.map((m) => ({ value: m.userId, label: `${m.name} (${m.role})` }))}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {language === 'sw' ? 'Tarehe ya Mwisho' : 'Due Date'}
              </label>
              <GlassDatePicker
                value={newTaskDueDate}
                min={getTodayDarEsSalaam()}
                onChange={setNewTaskDueDate}
                ariaLabel={language === 'sw' ? 'Tarehe ya Mwisho' : 'Due Date'}
                placeholder={language === 'sw' ? 'Chagua tarehe' : 'Pick a date'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                {language === 'sw' ? 'Kipaumbele' : 'Priority'}
              </label>
              <GlassSelect
                value={newTaskPriority}
                onChange={setNewTaskPriority}
                ariaLabel={language === 'sw' ? 'Kipaumbele' : 'Priority'}
                options={[
                  { value: 'high', label: language === 'sw' ? 'Kipaumbele cha Juu' : 'High Priority' },
                  { value: 'medium', label: language === 'sw' ? 'Kipaumbele cha Wastani' : 'Medium Priority' },
                  { value: 'low', label: language === 'sw' ? 'Kipaumbele cha Chini' : 'Low Priority' },
                ]}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '0.45rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              {language === 'sw' ? 'Ghairi' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ background: 'var(--color-primary)', color: '#FFFFFF', border: 'none', padding: '0.45rem 1.25rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {isSubmitting
                ? (language === 'sw' ? 'Inahifadhi...' : 'Saving...')
                : (language === 'sw' ? 'Hifadhi Jukumu' : 'Create Task')}
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            {language === 'sw' ? `Hakuna majukumu kwenye kichujio cha "${filter}".` : `No tasks found in "${filter}" filter.`}
          </div>
        ) : (
          filteredTasks.map(task => {
            const priorityConfig = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
            const isCompleted = task.status === 'completed';
            const isExpanded = activeTaskDetailId === task.id;

            return (
              <div
                key={task.id}
                style={{
                  background: isCompleted ? 'var(--app-surface-secondary, #F9FAFB)' : 'var(--app-surface-elevated, #FFFFFF)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  padding: '1rem 1.25rem',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {/* Left: Checkbox + Title + Description */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => handleToggleComplete(task)}
                      style={{
                        marginTop: '0.2rem',
                        width: 18,
                        height: 18,
                        accentColor: 'var(--color-primary)',
                        cursor: 'pointer'
                      }}
                    />
                    <div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)',
                        textDecoration: isCompleted ? 'line-through' : 'none'
                      }}>
                        {demoText(task.title, language === 'sw')}
                      </div>
                      {task.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                          {demoText(task.description, language === 'sw')}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <User size={12} /> {task.assigneeName || (language === 'sw' ? 'Haijagawiwa' : 'Unassigned')}
                        </span>
                        {task.dueDate && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} /> {language === 'sw' ? 'Mwisho:' : 'Due:'} {task.dueDate}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {STATUS_ICONS[task.status]}{' '}
                          {task.status === 'completed'
                            ? (language === 'sw' ? 'IMEKAMILIKA' : 'COMPLETED')
                            : task.status === 'overdue'
                            ? (language === 'sw' ? 'IMECHELEWA' : 'OVERDUE')
                            : task.status === 'missed'
                            ? (language === 'sw' ? 'IMEKOSEKANA' : 'MISSED')
                            : (language === 'sw' ? 'INASUBIRI' : 'PENDING')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Badges & Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      background: priorityConfig.bg,
                      color: priorityConfig.color,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.7rem',
                      fontWeight: 800
                    }}>
                      {task.priority === 'high'
                        ? (language === 'sw' ? 'Kipaumbele cha Juu' : 'High Priority')
                        : task.priority === 'low'
                        ? (language === 'sw' ? 'Kipaumbele cha Chini' : 'Low Priority')
                        : (language === 'sw' ? 'Kipaumbele cha Wastani' : 'Medium Priority')}
                    </span>

                    <button
                      onClick={() => setActiveTaskDetailId(isExpanded ? null : task.id)}
                      style={{
                        background: 'var(--color-surface-soft)',
                        border: '1px solid var(--color-border)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer'
                      }}
                    >
                      <MessageSquare size={13} /> {(task.comments || []).length}
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    {canManage && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-text-dim)',
                          padding: '0.3rem',
                          cursor: 'pointer'
                        }}
                        title={language === 'sw' ? 'Futa Jukumu' : 'Delete Task'}
                        aria-label={language === 'sw' ? 'Futa Jukumu' : 'Delete Task'}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details: Comments & Activity History */}
                {isExpanded && (
                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--color-border)',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem' }}>
                      <button
                        onClick={() => setActiveTabSection('comments')}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontWeight: activeTabSection === 'comments' ? 800 : 500,
                          color: activeTabSection === 'comments' ? 'var(--color-primary-hover)' : 'var(--color-text-muted)',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        {language === 'sw' ? `Maoni (${task.comments?.length || 0})` : `Comments (${task.comments?.length || 0})`}
                      </button>
                      <button
                        onClick={() => setActiveTabSection('history')}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontWeight: activeTabSection === 'history' ? 800 : 500,
                          color: activeTabSection === 'history' ? 'var(--color-primary-hover)' : 'var(--color-text-muted)',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        {language === 'sw' ? `Historia ya Shughuli (${task.activityHistory?.length || 0})` : `Activity History (${task.activityHistory?.length || 0})`}
                      </button>
                    </div>

                    {activeTabSection === 'comments' ? (
                      <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
                          {(task.comments || []).length === 0 ? (
                            <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                              {language === 'sw' ? 'Hakuna maoni bado.' : 'No comments yet.'}
                            </div>
                          ) : (
                            task.comments.map(c => (
                              <div key={c.id} style={{ background: 'var(--color-surface-soft)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                  <strong style={{ color: 'var(--color-text)' }}>{c.userName}</strong>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>
                                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div style={{ color: 'var(--color-text)' }}>{demoText(c.text, language === 'sw')}</div>
                              </div>
                            ))
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder={language === 'sw' ? 'Andika maoni au taarifa mpya kwa timu...' : 'Add a comment or update for the team...'}
                            value={newCommentText}
                            onChange={e => setNewCommentText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddComment(task.id); }}
                            style={{ flex: 1, padding: '0.4rem 0.7rem', fontSize: '0.8rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(task.id)}
                            style={{ background: 'var(--color-primary)', color: '#FFFFFF', border: 'none', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Send size={13} /> {language === 'sw' ? 'Tuma' : 'Post'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                        {(task.activityHistory || []).map(act => (
                          <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            <History size={12} color="var(--color-primary)" />
                            <span><strong>{act.userName}</strong>: {act.details} ({new Date(act.timestamp).toLocaleDateString()})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
