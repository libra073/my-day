import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import initialData from '../data/initialData';
import { translations } from '../i18n/translations';
import api from '../services/api';

const AppContext = createContext();

const PRESET_ACCOUNTS = {
  groom: {
    id: 'usr-groom',
    name: 'John Msuya (Groom)',
    email: 'john@myday.co.tz',
    phone: '+255 777 123 456',
    role: 'customer',
    token: 'token-groom-session'
  },
  bride: {
    id: 'usr-bride',
    name: 'Sarah Kimaro (Bride)',
    email: 'sarah@myday.co.tz',
    phone: '+255 777 654 321',
    role: 'customer',
    token: 'token-bride-session'
  },
  planner: {
    id: 'usr-planner',
    name: 'Neema Wedding Planners',
    email: 'neema@planning.co.tz',
    phone: '+255 714 888 777',
    role: 'customer',
    token: 'token-planner-session'
  },
  provider: {
    id: 'prov-1',
    name: 'Grand Imperial Hall',
    email: 'info@grandimperial.co.tz',
    phone: '+255 777 999 888',
    role: 'provider',
    token: 'token-provider-session'
  },
  admin: {
    id: 'admin-1',
    name: 'MY DAY Superadmin',
    email: 'admin@myday.co.tz',
    phone: '+255 766 466 187',
    role: 'admin',
    token: 'token-admin-session'
  }
};

export const AppProvider = ({ children }) => {
  // i18n initialization
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('myday_lang') || 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('myday_lang', lang);
  };

  const t = (key, defaultValue) => {
    const langDict = translations[language] || translations['en'];
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    const fallbackDict = translations['en'];
    if (fallbackDict && fallbackDict[key] !== undefined) {
      return fallbackDict[key];
    }
    return defaultValue !== undefined ? defaultValue : key;
  };

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('myday_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem('myday_token'));
  });

  const [role, setRole] = useState(() => {
    try {
      const stored = localStorage.getItem('myday_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.role || parsed.globalRole || 'customer';
      }
    } catch {}
    return 'customer';
  });

  const [activeAccountKey, setActiveAccountKey] = useState(null);

  // Active Wedding Workspace (null by default for logged-out or new users)
  const [wedding, setWedding] = useState(() => {
    if (!localStorage.getItem('myday_token')) {
      return null;
    }
    try {
      const stored = localStorage.getItem('myday_wedding');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Collaboration state
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState(null);

  // Phase 2 state: Checklist tasks, decisions, notes, budget, notifications
  const [tasks, setTasks] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const [providers, setProviders] = useState(initialData.providers);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [commissionRate, setCommissionRate] = useState(0.05);

  const calculateCart = () => {
    const total = (wedding?.cart || []).reduce((sum, item) => sum + item.price, 0);
    const deposit = Math.round(total * 0.3);
    return { total, deposit };
  };

  // Sync workspace and all Phase 2 collections from server
  const refreshWorkspace = useCallback(async (targetWorkspaceId) => {
    const currentToken = user?.token || api.getToken();
    if (!currentToken) {
      setWedding(null);
      setWorkspaceLoading(false);
      return;
    }

    try {
      setWorkspaceLoading(true);
      setWorkspaceError(null);

      let workspaceId = targetWorkspaceId || wedding?.id;

      if (!workspaceId) {
        const listRes = await api.getWorkspaces().catch(() => ({ workspaces: [] }));
        if (listRes.workspaces && listRes.workspaces.length > 0) {
          workspaceId = listRes.workspaces[0].id;
        } else {
          setWedding(null);
          setWorkspaceLoading(false);
          return;
        }
      }

      const res = await api.getWorkspace(workspaceId);
      if (res.workspace) {
        setWedding(prev => ({
          ...(prev || {}),
          ...res.workspace,
          cart: prev?.cart || []
        }));
        try {
          localStorage.setItem('myday_wedding', JSON.stringify(res.workspace));
        } catch {}
      }

      // Fetch members
      const membersRes = await api.getMembers(workspaceId).catch(() => ({}));
      if (membersRes.members) {
        setWorkspaceMembers(membersRes.members);
      }

      // Fetch pending invitations if user has invite permission
      if (res.workspace?.permissions?.canInviteMembers) {
        const invitesRes = await api.getInvitations(workspaceId).catch(() => ({}));
        if (invitesRes.invitations) {
          setPendingInvitations(invitesRes.invitations);
        }
      }

      // Fetch tasks
      const tasksRes = await api.getTasks(workspaceId).catch(() => ({}));
      if (tasksRes.tasks) {
        setTasks(tasksRes.tasks);
      }

      // Fetch decisions
      const decisionsRes = await api.getDecisions(workspaceId).catch(() => ({}));
      if (decisionsRes.decisions) {
        setDecisions(decisionsRes.decisions);
      }

      // Fetch notes
      const notesRes = await api.getNotes(workspaceId).catch(() => ({}));
      if (notesRes.notes) {
        setNotes(notesRes.notes);
      }

      // Fetch budget if user has view financial permission
      if (res.workspace?.permissions?.canViewFinancials) {
        const budgetRes = await api.getBudget(workspaceId).catch(() => ({}));
        if (budgetRes.summary) {
          setBudgetData(budgetRes);
        }
      }

      // Fetch notifications
      const notifsRes = await api.getNotifications(workspaceId).catch(() => ({}));
      if (notifsRes.notifications) {
        setNotifications(notifsRes.notifications);
        setUnreadNotifCount(notifsRes.unreadCount || 0);
      }

      // Fetch bookings from server
      const bookingsRes = await api.getBookings().catch(() => ({}));
      if (bookingsRes.bookings && bookingsRes.bookings.length > 0) {
        setBookings(bookingsRes.bookings);
      }
    } catch (err) {
      console.warn('Could not load workspace from server:', err.message);
      setWorkspaceError(err.message);
    } finally {
      setWorkspaceLoading(false);
    }
  }, [user?.token, wedding?.id]);

  // Initial fetch on mount or user change
  useEffect(() => {
    if (user?.token) {
      api.setToken(user.token);
      refreshWorkspace();
    }
  }, [user?.token, refreshWorkspace]);

  // Switch between preset accounts (Internal testing / fallback helper)
  const switchAccount = (accountKey) => {
    const target = PRESET_ACCOUNTS[accountKey] || PRESET_ACCOUNTS.groom;
    setActiveAccountKey(accountKey);
    setRole(target.role);
    setUser(target);
    setIsLoggedIn(true);
    api.setToken(target.token);
    try {
      localStorage.setItem('myday_token', target.token);
      localStorage.setItem('myday_user', JSON.stringify(target));
    } catch {}
  };

  // Legacy role switch compatibility
  const switchRole = newRole => {
    if (newRole === 'customer') {
      switchAccount('groom');
    } else if (newRole === 'provider') {
      switchAccount('provider');
    } else if (newRole === 'admin') {
      switchAccount('admin');
    }
  };

  const loginUser = async ({ email, role: targetRole, name, password }) => {
    if (password) {
      const res = await api.login(email, password);
      setUser(res.user);
      setRole(res.user.globalRole || targetRole || 'customer');
      setIsLoggedIn(true);
      try {
        localStorage.setItem('myday_token', res.token);
        localStorage.setItem('myday_user', JSON.stringify(res.user));
      } catch {}
      api.setToken(res.token);
      refreshWorkspace();
      return res;
    }

    setRole(targetRole || 'customer');
    const newUser = {
      id: `usr-${Date.now()}`,
      name: name || (targetRole === 'customer' ? 'Wedding Host' : targetRole === 'provider' ? 'Partner Vendor' : 'Platform Admin'),
      email: email || 'user@myday.co.tz',
      role: targetRole || 'customer',
      token: `token-custom-${Date.now()}`
    };
    setUser(newUser);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('myday_token', newUser.token);
      localStorage.setItem('myday_user', JSON.stringify(newUser));
    } catch {}
    api.setToken(newUser.token);
    return { user: newUser };
  };

  const registerUser = async (userObj) => {
    if (userObj.password) {
      const res = await api.register({
        name: userObj.name,
        email: userObj.email,
        password: userObj.password,
        phone: userObj.phone,
        role: userObj.role || 'customer'
      });
      setUser(res.user);
      setRole(res.user.globalRole || 'customer');
      setIsLoggedIn(true);
      try {
        localStorage.setItem('myday_token', res.token);
        localStorage.setItem('myday_user', JSON.stringify(res.user));
      } catch {}
      api.setToken(res.token);
      refreshWorkspace();
      return res;
    }

    setRole(userObj.role || 'customer');
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userObj.name || 'New Member',
      email: userObj.email,
      phone: userObj.phone || '',
      role: userObj.role || 'customer',
      token: `token-custom-${Date.now()}`
    };
    setUser(newUser);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('myday_token', newUser.token);
      localStorage.setItem('myday_user', JSON.stringify(newUser));
    } catch {}
    api.setToken(newUser.token);
    return { user: newUser };
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    setUser(null);
    setRole('customer');
    setWedding(null);
    setBudgetData(null);
    setTasks([]);
    setBookings([]);
    setWorkspaceMembers([]);
    try {
      localStorage.removeItem('myday_token');
      localStorage.removeItem('myday_user');
      localStorage.removeItem('myday_wedding');
    } catch {}
    api.setToken(null);
  };

  // Collaboration actions
  const inviteMember = async ({ email, role: memberRole, expiresInHours = 48 }) => {
    const res = await api.createInvitation(wedding.id, { email, role: memberRole, expiresInHours });
    await refreshWorkspace();
    return res.invitation;
  };

  const changeMemberRole = async (memberId, newRole) => {
    const res = await api.updateMemberRole(wedding.id, memberId, newRole);
    await refreshWorkspace();
    return res;
  };

  const removeMember = async (memberId) => {
    const res = await api.removeMember(wedding.id, memberId);
    await refreshWorkspace();
    return res;
  };

  const revokeInvitation = async (invitationId) => {
    const res = await api.revokeInvitation(wedding.id, invitationId);
    await refreshWorkspace();
    return res;
  };

  const updateWeddingProfile = async (updates) => {
    try {
      if (!wedding?.id) {
        const createRes = await api.createWorkspace(updates).catch(() => null);
        if (createRes?.workspace) {
          setWedding(createRes.workspace);
          try {
            localStorage.setItem('myday_wedding', JSON.stringify(createRes.workspace));
          } catch {}
          await refreshWorkspace(createRes.workspace.id);
          return createRes.workspace;
        }
      } else {
        const res = await api.updateWorkspace(wedding.id, updates);
        if (res.workspace) {
          setWedding(prev => {
            const next = { ...prev, ...res.workspace };
            try { localStorage.setItem('myday_wedding', JSON.stringify(next)); } catch {}
            return next;
          });
          return res.workspace;
        }
      }
    } catch (e) {
      console.warn('Server update failed, saving locally:', e.message);
    }
    setWedding(prev => {
      const next = { ...(prev || {}), ...updates };
      try { localStorage.setItem('myday_wedding', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const createBooking = (category, vendorId, packageId, price, date, deposit) => {
    const bookingId = `bk-${Date.now()}`;
    const newBooking = {
      id: bookingId,
      customerId: user?.id || 'usr-guest',
      providerId: vendorId,
      category,
      packageId,
      weddingId: wedding.id,
      date,
      price,
      deposit,
      paidAmount: deposit,
      commission: Math.round(price * commissionRate),
      status: 'confirmed',
    };
    setBookings(prev => [...prev, newBooking]);
    setProviders(prev =>
      prev.map(p =>
        p.id === vendorId
          ? { ...p, unavailableDates: [...(p.unavailableDates || []), date] }
          : p
      )
    );
    // Background sync to authoritative database
    api.createBooking({ category, providerId: vendorId, packageId, price, date, weddingId: wedding.id }).catch(err => {
      console.warn('Booking offline or sync pending:', err.message);
    });
    return bookingId;
  };

  const recordPayment = (bookingId, amount, full = false) => {
    const paymentId = `pay-${Date.now()}`;
    setPayments(prev => [...prev, { id: paymentId, bookingId, amount, date: new Date().toISOString() }]);
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, status: full ? 'confirmed' : 'partial', paidAmount: (b.paidAmount || 0) + amount }
          : b
      )
    );
    // Background sync to authoritative database
    api.createPayment({ bookingId, amount, isFullPayment: full }).catch(err => {
      console.warn('Payment offline or sync pending:', err.message);
    });
    return paymentId;
  };

  // --- Phase 2 Actions ---
  const createTask = async (taskData) => {
    const res = await api.createTask(wedding.id, taskData);
    await refreshWorkspace();
    return res.task;
  };

  const updateTask = async (taskId, updates) => {
    const res = await api.updateTask(wedding.id, taskId, updates);
    await refreshWorkspace();
    return res.task;
  };

  const deleteTask = async (taskId) => {
    const res = await api.deleteTask(wedding.id, taskId);
    await refreshWorkspace();
    return res;
  };

  const addTaskComment = async (taskId, text) => {
    const res = await api.addTaskComment(wedding.id, taskId, text);
    await refreshWorkspace();
    return res.comment;
  };

  const createDecision = async (decisionData) => {
    const res = await api.createDecision(wedding.id, decisionData);
    await refreshWorkspace();
    return res.decision;
  };

  const voteDecision = async (decisionId, optionId) => {
    const res = await api.voteDecision(wedding.id, decisionId, optionId);
    await refreshWorkspace();
    return res.decision;
  };

  const updateDecision = async (decisionId, updates) => {
    const res = await api.updateDecision(wedding.id, decisionId, updates);
    await refreshWorkspace();
    return res.decision;
  };

  const createNote = async (noteData) => {
    const res = await api.createNote(wedding.id, noteData);
    await refreshWorkspace();
    return res.note;
  };

  const createBudgetCategory = async (categoryData) => {
    const res = await api.createBudgetCategory(wedding.id, categoryData);
    await refreshWorkspace();
    return res.category;
  };

  const createExpense = async (expenseData) => {
    const res = await api.createExpense(wedding.id, expenseData);
    await refreshWorkspace();
    return res.expense;
  };

  const updateExpense = async (expenseId, updates) => {
    const res = await api.updateExpense(wedding.id, expenseId, updates);
    await refreshWorkspace();
    return res.expense;
  };

  const deleteExpense = async (expenseId) => {
    const res = await api.deleteExpense(wedding.id, expenseId);
    await refreshWorkspace();
    return res;
  };

  const markNotificationRead = async (notifId) => {
    const res = await api.markNotificationRead(wedding.id, notifId);
    await refreshWorkspace();
    return res;
  };

  const markAllNotificationsRead = async () => {
    const res = await api.markAllNotificationsRead(wedding.id);
    await refreshWorkspace();
    return res;
  };

  const value = {
    language,
    setLanguage,
    t,
    role,
    user,
    activeAccountKey,
    switchAccount,
    PRESET_ACCOUNTS,
    isLoggedIn,
    wedding,
    setWedding,
    updateWeddingProfile,
    workspaceMembers,
    pendingInvitations,
    workspaceLoading,
    workspaceError,
    refreshWorkspace,
    inviteMember,
    changeMemberRole,
    removeMember,
    revokeInvitation,
    // Phase 2 exports
    tasks,
    createTask,
    updateTask,
    deleteTask,
    addTaskComment,
    decisions,
    createDecision,
    voteDecision,
    updateDecision,
    notes,
    createNote,
    budgetData,
    createBudgetCategory,
    createExpense,
    updateExpense,
    deleteExpense,
    notifications,
    unreadNotifCount,
    markNotificationRead,
    markAllNotificationsRead,
    providers,
    setProviders,
    bookings,
    setBookings,
    payments,
    setPayments,
    commissionRate,
    setCommissionRate,
    calculateCart,
    switchRole,
    loginUser,
    registerUser,
    logoutUser,
    createBooking,
    recordPayment,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
