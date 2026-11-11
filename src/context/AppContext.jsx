import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import initialData from '../data/initialData';
import { translations } from '../i18n/translations';
import api from '../services/api';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import * as sbAuth from '../services/supabaseAuth';
import { validateBookingDate } from '../services/businessSchedule';
import AuthPromptModal from '../components/AuthPromptModal';
import AuthModal from '../components/AuthModal';

const defaultAppContext = {
  wedding: {},
  language: 'en',
  t: (k, fb) => fb || k,
  isLoggedIn: false,
  user: null,
  providers: [],
  bookings: [],
  role: 'customer',
  cart: []
};

const AppContext = createContext(defaultAppContext);

export const AppProvider = ({ children }) => {
  // i18n initialization
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('myday_lang') || 'en';
  });

  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('myday_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('myday_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
  }, []);

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
    return Boolean(localStorage.getItem('myday_token') && localStorage.getItem('myday_user'));
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

  // Active Wedding Workspace (null by default for logged-out or new users)
  const [wedding, setWedding] = useState(() => {
    if (!localStorage.getItem('myday_token') || !localStorage.getItem('myday_user')) {
      return null;
    }
    try {
      const stored = localStorage.getItem('myday_wedding');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Auth reminder prompt modal state
  const [authPromptState, setAuthPromptState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onAuthenticated: null,
  });

  // Auth modal (login/register) state
  const [authModalState, setAuthModalState] = useState({
    isOpen: false,
    initialTab: 'login',
    onSuccess: null,
  });

  const openAuthPrompt = useCallback(({ title, message, onAuthenticated } = {}) => {
    setAuthPromptState({
      isOpen: true,
      title: title || '',
      message: message || '',
      onAuthenticated: onAuthenticated || null,
    });
  }, []);

  const closeAuthPrompt = useCallback(() => {
    setAuthPromptState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const openAuthModal = useCallback(({ initialTab = 'login', onSuccess, contextNote = '', initialEmail = '' } = {}) => {
    setAuthModalState({
      isOpen: true,
      initialTab,
      contextNote,
      initialEmail,
      onSuccess: onSuccess || null,
    });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

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
      setWorkspaceMembers([]);
      setTasks([]);
      setDecisions([]);
      setNotes([]);
      setBudgetData(null);
      setNotifications([]);
      setWorkspaceLoading(false);
      return;
    }

    try {
      setWorkspaceLoading(true);
      setWorkspaceError(null);

      // Always retrieve workspaces authorized for the current user
      const listRes = await api.getWorkspaces().catch((err) => {
        if (err.status === 401) throw err;
        return { workspaces: [] };
      });
      const userWorkspaces = listRes.workspaces || [];

      let workspaceId = targetWorkspaceId;
      if (!workspaceId) {
        if (wedding?.id && userWorkspaces.some(w => w.id === wedding.id)) {
          workspaceId = wedding.id;
        } else if (userWorkspaces.length > 0) {
          workspaceId = userWorkspaces[0].id;
        } else {
          // Logged-in user has NO wedding created yet
          setWedding(null);
          setWorkspaceMembers([]);
          setTasks([]);
          setDecisions([]);
          setNotes([]);
          setBudgetData(null);
          setNotifications([]);
          try { localStorage.removeItem('myday_wedding'); } catch {}
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
      if (err.status === 401) {
        // Expired or invalid token: clean logout
        logoutUser();
      }
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

  // One place that knows how a signed-in identity becomes app state.
  const applySession = (appUser, token) => {
    setUser(appUser);
    setRole(appUser.globalRole || appUser.role || 'customer');
    setIsLoggedIn(true);
    api.setToken(token || null);
    try {
      if (token) localStorage.setItem('myday_token', token);
      else localStorage.removeItem('myday_token');
      localStorage.setItem('myday_user', JSON.stringify(appUser));
      localStorage.removeItem('myday_wedding');
    } catch {}
    setWedding(null);
    setWorkspaceMembers([]);
    setTasks([]);
    setDecisions([]);
    setNotes([]);
    setBudgetData(null);
    setNotifications([]);
  };

  const loginUser = async ({ email, password }) => {
    if (!email || !password) {
      throw new Error(language === 'sw' ? 'Barua pepe na nenosiri vinahitajika.' : 'Email and password are required.');
    }

    if (isSupabaseConfigured) {
      const data = await sbAuth.signIn({ email, password });
      const appUser = sbAuth.toAppUser(data.user);
      applySession(appUser, data.session?.access_token);
      await refreshWorkspace();
      return { user: appUser };
    }

    const res = await api.login(email, password);
    applySession(res.user, res.token);
    await refreshWorkspace();
    return res;
  };

  const registerUser = async (userObj) => {
    if (!userObj.password) {
      throw new Error(language === 'sw' ? 'Nenosiri linahitajika.' : 'A password is required.');
    }

    if (isSupabaseConfigured) {
      const { user: supaUser, needsEmailConfirmation } = await sbAuth.signUp({
        email: userObj.email,
        password: userObj.password,
        name: userObj.name,
        role: userObj.role || 'customer',
        phone: userObj.phone,
        vendorCategory: userObj.vendorCategory,
        vendorLocation: userObj.vendorLocation,
      });
      // Confirmation required: no session yet, the user verifies by email.
      if (needsEmailConfirmation) {
        return { needsEmailConfirmation: true, user: sbAuth.toAppUser(supaUser) };
      }
      const appUser = sbAuth.toAppUser(supaUser);
      const { data } = await sbAuth.getSession();
      applySession(appUser, data?.session?.access_token);
      await refreshWorkspace();
      return { user: appUser, needsEmailConfirmation: false };
    }

    const res = await api.register({
      name: userObj.name,
      email: userObj.email,
      password: userObj.password,
      phone: userObj.phone,
      role: userObj.role || 'customer',
      vendorCategory: userObj.vendorCategory,
      vendorLocation: userObj.vendorLocation,
    });
    applySession(res.user, res.token);
    await refreshWorkspace();
    return res;
  };

  const logoutUser = async () => {
    if (isSupabaseConfigured) await sbAuth.signOut();
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

  const verifyEmail = async (email, code) => {
    if (isSupabaseConfigured) {
      await sbAuth.resendConfirmation(email);
      return { success: true, resent: true };
    }
    const res = await api.verifyEmail(email, code);
    if (res.success) {
      setUser(prev => prev ? { ...prev, emailVerified: true } : prev);
      try {
        const stored = JSON.parse(localStorage.getItem('myday_user') || '{}');
        if (stored && typeof stored === 'object') {
          localStorage.setItem('myday_user', JSON.stringify({ ...stored, emailVerified: true }));
        }
      } catch {}
    }
    return res;
  };

  const sendVerificationEmail = async (email) => {
    if (isSupabaseConfigured) {
      await sbAuth.resendConfirmation(email);
      return { success: true };
    }
    return api.sendVerificationEmail(email);
  };

  const requestPasswordReset = async (email) => {
    if (isSupabaseConfigured) {
      await sbAuth.sendPasswordReset(email);
      return { success: true };
    }
    return api.requestPasswordReset(email);
  };

  const completePasswordReset = async (newPassword) => {
    if (isSupabaseConfigured) {
      await sbAuth.updatePassword(newPassword);
      return { success: true };
    }
    return null;
  };

  // On first load, adopt any Supabase session that survived a refresh.
  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let cancelled = false;
    (async () => {
      const { data } = await sbAuth.getSession();
      if (cancelled || !data?.session) return;
      const appUser = sbAuth.toAppUser(data.session.user);
      applySession(appUser, data.session.access_token);
      await refreshWorkspace();
    })();
    const unsubscribe = sbAuth.onAuthChange((event, session) => {
      if (cancelled) return;
      if (event === 'SIGNED_OUT') logoutUser();
      else if (session?.user) {
        const appUser = sbAuth.toAppUser(session.user);
        applySession(appUser, session.access_token);
      }
    });
    return () => { cancelled = true; unsubscribe?.(); };
  }, []);

  // Collaboration actions
  const inviteMember = async ({ email, role: memberRole, expiresInHours = 48 }) => {
    if (!wedding?.id) throw new Error('No wedding workspace selected');
    const res = await api.createInvitation(wedding.id, { email, role: memberRole, expiresInHours });
    await refreshWorkspace();
    return res.invitation;
  };

  const changeMemberRole = async (memberId, newRole) => {
    if (!wedding?.id) throw new Error('No wedding workspace selected');
    const res = await api.updateMemberRole(wedding.id, memberId, newRole);
    await refreshWorkspace();
    return res;
  };

  const removeMember = async (memberId) => {
    if (!wedding?.id) throw new Error('No wedding workspace selected');
    const res = await api.removeMember(wedding.id, memberId);
    await refreshWorkspace();
    return res;
  };

  const revokeInvitation = async (invitationId) => {
    if (!wedding?.id) throw new Error('No wedding workspace selected');
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
    // Immediate pre-creation date validation
    const validation = validateBookingDate(date, language);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const bookingId = `bk-${Date.now()}`;
    const newBooking = {
      id: bookingId,
      customerId: user?.id || 'usr-guest',
      providerId: vendorId,
      category,
      packageId,
      weddingId: wedding?.id || null,
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
    // Background sync to authoritative database if wedding exists
    if (wedding?.id) {
      api.createBooking({ category, providerId: vendorId, packageId, price, date, weddingId: wedding.id, language }).catch(err => {
        console.warn('Booking offline or sync pending:', err.message);
      });
    }
    return bookingId;
  };

  const recordPayment = (bookingId, amount, full = false) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking?.date) {
      const validation = validateBookingDate(booking.date, language);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }
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
    if (!wedding?.id) return null;
    const res = await api.createTask(wedding.id, taskData);
    await refreshWorkspace();
    return res.task;
  };

  const updateTask = async (taskId, updates) => {
    if (!wedding?.id) return null;
    const res = await api.updateTask(wedding.id, taskId, updates);
    await refreshWorkspace();
    return res.task;
  };

  const deleteTask = async (taskId) => {
    if (!wedding?.id) return null;
    const res = await api.deleteTask(wedding.id, taskId);
    await refreshWorkspace();
    return res;
  };

  const addTaskComment = async (taskId, text) => {
    if (!wedding?.id) return null;
    const res = await api.addTaskComment(wedding.id, taskId, text);
    await refreshWorkspace();
    return res.comment;
  };

  const createDecision = async (decisionData) => {
    if (!wedding?.id) return null;
    const res = await api.createDecision(wedding.id, decisionData);
    await refreshWorkspace();
    return res.decision;
  };

  const voteDecision = async (decisionId, optionId) => {
    if (!wedding?.id) return null;
    const res = await api.voteDecision(wedding.id, decisionId, optionId);
    await refreshWorkspace();
    return res.decision;
  };

  const updateDecision = async (decisionId, updates) => {
    if (!wedding?.id) return null;
    const res = await api.updateDecision(wedding.id, decisionId, updates);
    await refreshWorkspace();
    return res.decision;
  };

  const createNote = async (noteData) => {
    if (!wedding?.id) return null;
    const res = await api.createNote(wedding.id, noteData);
    await refreshWorkspace();
    return res.note;
  };

  const createBudgetCategory = async (categoryData) => {
    if (!wedding?.id) return null;
    const res = await api.createBudgetCategory(wedding.id, categoryData);
    await refreshWorkspace();
    return res.category;
  };

  const createExpense = async (expenseData) => {
    if (!wedding?.id) return null;
    const res = await api.createExpense(wedding.id, expenseData);
    await refreshWorkspace();
    return res.expense;
  };

  const updateExpense = async (expenseId, updates) => {
    if (!wedding?.id) return null;
    const res = await api.updateExpense(wedding.id, expenseId, updates);
    await refreshWorkspace();
    return res.expense;
  };

  const deleteExpense = async (expenseId) => {
    if (!wedding?.id) return null;
    const res = await api.deleteExpense(wedding.id, expenseId);
    await refreshWorkspace();
    return res;
  };

  const markNotificationRead = async (notifId) => {
    if (!wedding?.id) return null;
    const res = await api.markNotificationRead(wedding.id, notifId);
    await refreshWorkspace();
    return res;
  };

  const markAllNotificationsRead = async () => {
    if (!wedding?.id) return null;
    const res = await api.markAllNotificationsRead(wedding.id);
    await refreshWorkspace();
    return res;
  };

  const value = {
    language,
    setLanguage,
    t,
    theme,
    setTheme,
    toggleTheme,
    role,
    user,
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
    // Auth Prompt helpers
    openAuthPrompt,
    closeAuthPrompt,
    openAuthModal,
    closeAuthModal,
    authPromptState,
    authModalState,
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
    loginUser,
    registerUser,
    requestPasswordReset,
    completePasswordReset,
    logoutUser,
    verifyEmail,
    sendVerificationEmail,
    createBooking,
    recordPayment,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <AuthPromptModal
        isOpen={authPromptState.isOpen}
        title={authPromptState.title}
        message={authPromptState.message}
        onClose={closeAuthPrompt}
        onCreateAccount={(noteFromPrompt) => {
          const cb = authPromptState.onAuthenticated;
          const note = noteFromPrompt || authPromptState.title;
          closeAuthPrompt();
          openAuthModal({ initialTab: 'register', onSuccess: cb, contextNote: note });
        }}
        onLogin={(noteFromPrompt) => {
          const cb = authPromptState.onAuthenticated;
          const note = noteFromPrompt || authPromptState.title;
          closeAuthPrompt();
          openAuthModal({ initialTab: 'login', onSuccess: cb, contextNote: note });
        }}
      />
      {authModalState.isOpen && (
        <AuthModal
          initialTab={authModalState.initialTab}
          initialEmail={authModalState.initialEmail || ''}
          contextNote={authModalState.contextNote || ''}
          onClose={closeAuthModal}
          onSuccess={() => {
            const cb = authModalState.onSuccess;
            closeAuthModal();
            if (cb) cb();
          }}
        />
      )}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext) || defaultAppContext;
