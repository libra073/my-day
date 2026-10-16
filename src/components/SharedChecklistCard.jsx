import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  CheckSquare, PlusCircle, CheckCircle2, Clock, AlertTriangle, XCircle,
  MessageSquare, History, User, Calendar, Trash2, Send, ChevronDown, ChevronUp
} from 'lucide-react';

const PRIORITY_STYLES = {
  high: { label: 'High Priority', color: '#DC2626', bg: '#FEE2E2' },
  medium: { label: 'Medium Priority', color: '#D97706', bg: '#FEF3C7' },
  low: { label: 'Low Priority', color: '#2563EB', bg: '#DBEAFE' },
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
  } = useAppContext();

  const permissions = wedding.permissions || {};
  const canManage = permissions.canManageTasks;

  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'overdue' | 'completed' | 'missed'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTaskDetailId, setActiveTaskDetailId] = useState(null);
  const [activeTabSection, setActiveTabSection] = useState('comments'); // 'comments' | 'history'
  const [newCommentText, setNewCommentText] = useState('');

  // Create form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(user.id);
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
      alert(err.message || 'Failed to update task status');
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
      alert(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
    } catch (err) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const handleAddComment = async (taskId) => {
    if (!newCommentText.trim()) return;
    try {
      await addTaskComment(taskId, newCommentText.trim());
      setNewCommentText('');
    } catch (err) {
      alert(err.message || 'Failed to post comment');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary-hover)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            <CheckSquare size={16} /> Synchronized Wedding Checklist
          </div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-text)', fontWeight: 800, margin: 0 }}>
            Collaborative Tasks & Action Items
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            Assignees, due dates, comment threads, and automatic overdue tracking across all team devices.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowCreateModal(!showCreateModal)}
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
            <PlusCircle size={15} /> Add Task
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {[
          { id: 'all', label: `All Tasks (${tasks.length})` },
          { id: 'pending', label: `Pending (${tasks.filter(t => t.status === 'pending').length})` },
          { id: 'overdue', label: `Overdue (${tasks.filter(t => t.status === 'overdue').length})` },
          { id: 'completed', label: `Completed (${tasks.filter(t => t.status === 'completed').length})` },
          { id: 'missed', label: `Missed (${tasks.filter(t => t.status === 'missed').length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.8rem',
              fontWeight: filter === tab.id ? 800 : 600,
              background: filter === tab.id ? 'var(--color-text)' : 'var(--color-surface-soft)',
              color: filter === tab.id ? '#FFFFFF' : 'var(--color-text)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer'
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
            Create New Action Item
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Task Title</label>
              <input
                type="text"
                placeholder="E.g. Finalize MC and Sound Equipment contract"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Description & Key Notes</label>
              <input
                type="text"
                placeholder="Specific instructions, requirements, or vendor contact info"
                value={newTaskDesc}
                onChange={e => setNewTaskDesc(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Assignee</label>
              <select
                value={newTaskAssignee}
                onChange={e => setNewTaskAssignee(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: '#FFFFFF' }}
              >
                {workspaceMembers.map(m => (
                  <option key={m.userId} value={m.userId}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Due Date</label>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={e => setNewTaskDueDate(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: '#FFFFFF' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Priority</label>
              <select
                value={newTaskPriority}
                onChange={e => setNewTaskPriority(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: '#FFFFFF' }}
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '0.45rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ background: 'var(--color-primary)', color: '#FFFFFF', border: 'none', padding: '0.45rem 1.25rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {isSubmitting ? 'Saving...' : 'Create Task'}
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            No tasks found in "{filter}" filter.
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
                  background: isCompleted ? '#F9FAFB' : '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: isCompleted ? '1px solid #E5E7EB' : '1px solid var(--color-border)',
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
                        {task.title}
                      </div>
                      {task.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                          {task.description}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <User size={12} /> {task.assigneeName || 'Unassigned'}
                        </span>
                        {task.dueDate && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} /> Due: {task.dueDate}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {STATUS_ICONS[task.status]} {task.status.toUpperCase()}
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
                      {priorityConfig.label}
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
                        title="Delete Task"
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
                        Comments ({task.comments?.length || 0})
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
                        Activity History ({task.activityHistory?.length || 0})
                      </button>
                    </div>

                    {activeTabSection === 'comments' ? (
                      <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
                          {(task.comments || []).length === 0 ? (
                            <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No comments yet.</div>
                          ) : (
                            task.comments.map(c => (
                              <div key={c.id} style={{ background: 'var(--color-surface-soft)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                  <strong style={{ color: 'var(--color-text)' }}>{c.userName}</strong>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>
                                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div style={{ color: 'var(--color-text)' }}>{c.text}</div>
                              </div>
                            ))
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="Add a comment or update for the team..."
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
                            <Send size={13} /> Post
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
