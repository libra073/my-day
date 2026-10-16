// src/services/api.js
// Client API for MY DAY Auth, Workspaces, Members, and Invitations

const TOKEN_KEY = 'myday_auth_token';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY) || 'token-groom-session';
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  getToken() {
    return this.token;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(data.error || `HTTP error ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  // --- Auth Endpoints ---
  async login(email, password) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async register(userData) {
    const res = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // --- Workspace Endpoints ---
  async getWorkspaces() {
    return this.request('/api/workspaces');
  }

  async getWorkspace(id) {
    return this.request(`/api/workspaces/${id}`);
  }

  async createWorkspace(data) {
    return this.request('/api/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkspace(id, data) {
    return this.request(`/api/workspaces/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // --- Member Management ---
  async getMembers(workspaceId) {
    return this.request(`/api/workspaces/${workspaceId}/members`);
  }

  async updateMemberRole(workspaceId, memberId, newRole) {
    return this.request(`/api/workspaces/${workspaceId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify({ newRole }),
    });
  }

  async removeMember(workspaceId, memberId) {
    return this.request(`/api/workspaces/${workspaceId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  // --- Invitations ---
  async createInvitation(workspaceId, { email, role, expiresInHours = 48 }) {
    return this.request(`/api/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ email, role, expiresInHours }),
    });
  }

  async getInvitations(workspaceId) {
    return this.request(`/api/workspaces/${workspaceId}/invitations`);
  }

  async revokeInvitation(workspaceId, invitationId) {
    return this.request(`/api/workspaces/${workspaceId}/invitations/${invitationId}`, {
      method: 'DELETE',
    });
  }

  async getInvitationByToken(token) {
    return this.request(`/api/invitations/${token}`);
  }

  async acceptInvitation(token) {
    return this.request(`/api/invitations/${token}/accept`, {
      method: 'POST',
    });
  }

  // --- Phase 2: Tasks / Shared Checklist ---
  async getTasks(workspaceId) {
    return this.request(`/api/workspaces/${workspaceId}/tasks`);
  }

  async createTask(workspaceId, taskData) {
    return this.request(`/api/workspaces/${workspaceId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(workspaceId, taskId, updates) {
    return this.request(`/api/workspaces/${workspaceId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(workspaceId, taskId) {
    return this.request(`/api/workspaces/${workspaceId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async addTaskComment(workspaceId, taskId, text) {
    return this.request(`/api/workspaces/${workspaceId}/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // --- Phase 2: Decisions & Notes ---
  async getDecisions(workspaceId) {
    return this.request(`/api/workspaces/${workspaceId}/decisions`);
  }

  async createDecision(workspaceId, decisionData) {
    return this.request(`/api/workspaces/${workspaceId}/decisions`, {
      method: 'POST',
      body: JSON.stringify(decisionData),
    });
  }

  async voteDecision(workspaceId, decisionId, optionId) {
    return this.request(`/api/workspaces/${workspaceId}/decisions/${decisionId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionId }),
    });
  }

  async updateDecision(workspaceId, decisionId, updates) {
    return this.request(`/api/workspaces/${workspaceId}/decisions/${decisionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getNotes(workspaceId) {
    return this.request(`/api/workspaces/${workspaceId}/notes`);
  }

  async createNote(workspaceId, noteData) {
    return this.request(`/api/workspaces/${workspaceId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  // --- Phase 2: Budget Categories & Expenses ---
  async getBudget(workspaceId) {
    return this.request(`/api/workspaces/${workspaceId}/budget`);
  }

  async createBudgetCategory(workspaceId, categoryData) {
    return this.request(`/api/workspaces/${workspaceId}/budget/categories`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async createExpense(workspaceId, expenseData) {
    return this.request(`/api/workspaces/${workspaceId}/budget/expenses`, {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  async updateExpense(workspaceId, expenseId, updates) {
    return this.request(`/api/workspaces/${workspaceId}/budget/expenses/${expenseId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteExpense(workspaceId, expenseId) {
    return this.request(`/api/workspaces/${workspaceId}/budget/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  }

  // --- Phase 2: Notifications ---
  async getNotifications(workspaceId) {
    return this.request(`/api/workspaces/${workspaceId}/notifications`);
  }

  async markNotificationRead(workspaceId, notifId) {
    return this.request(`/api/workspaces/${workspaceId}/notifications/${notifId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsRead(workspaceId) {
    return this.request(`/api/workspaces/${workspaceId}/notifications/mark-all-read`, {
      method: 'POST',
    });
  }

  async createNotification(workspaceId, notifData) {
    return this.request(`/api/workspaces/${workspaceId}/notifications`, {
      method: 'POST',
      body: JSON.stringify(notifData),
    });
  }

  // --- Business Operating Schedule & Timezone (Africa/Dar_es_Salaam) ---
  async getBusinessSchedule() {
    return this.request('/api/business-schedule');
  }

  async getSystemTime() {
    return this.request('/api/system/time');
  }

  async getVendorSchedule(vendorId) {
    return this.request(`/api/vendors/${vendorId}/schedule`);
  }

  async updateVendorSchedule(vendorId, scheduleData) {
    return this.request(`/api/vendors/${vendorId}/schedule`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    });
  }

  // --- Appointments & Meetings ---
  async getAppointments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.vendorId) params.append('vendorId', filters.vendorId);
    if (filters.workspaceId) params.append('workspaceId', filters.workspaceId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/appointments${query}`);
  }

  async createAppointment(appointmentData) {
    return this.request('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(id, updates) {
    return this.request(`/api/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async cancelAppointment(id) {
    return this.request(`/api/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Bookings & Escrow ---
  async getBookings() {
    return this.request('/api/bookings');
  }

  async getBooking(id) {
    return this.request(`/api/bookings/${id}`);
  }

  async createBooking(bookingData) {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(id, updates) {
    return this.request(`/api/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // --- Payments ---
  async getPayments(bookingId = null) {
    const query = bookingId ? `?bookingId=${bookingId}` : '';
    return this.request(`/api/payments${query}`);
  }

  async createPayment(paymentData) {
    return this.request('/api/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // --- Password Recovery ---
  async forgotPassword(email) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }
}


export const api = new ApiClient();
export default api;
