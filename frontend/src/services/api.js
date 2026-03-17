const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Called when any API request returns 401 — registered by AuthContext
let _onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { _onUnauthorized = fn; };

async function apiCall(endpoint, options = {}, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  // No-content responses
  if (res.status === 204) return null;

  let body;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  if (!res.ok) {
    const message =
      typeof body === 'object' ? body.message || body.error || JSON.stringify(body) : body;
    const err = new Error(message || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = body;
    if (res.status === 401) _onUnauthorized?.();
    throw err;
  }

  return body;
}

// ─── Auth (public, no token) ───────────────────────────
export const auth = {
  register: ({ firstName, lastName, email, password }) =>
    apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password }),
    }),

  login: ({ email, password }) =>
    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ─── Accounts (requires token) ─────────────────────────
export const accounts = {
  create: ({ accountType, initialDeposit }, token) =>
    apiCall('/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ accountType, initialDeposit }),
    }, token),

  getAll: (token) =>
    apiCall('/api/accounts', {}, token),

  getById: (id, token) =>
    apiCall(`/api/accounts/${id}`, {}, token),

  lookupByAccountNumber: (accountNumber, token) =>
    apiCall(`/api/accounts/lookup?accountNumber=${encodeURIComponent(accountNumber)}`, {}, token),

  getStatement: (id, start, end, token) => {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    return apiCall(`/api/accounts/${id}/statement?${params}`, {}, token);
  },
};

// ─── Transactions (requires token) ─────────────────────
export const transactions = {
  create: ({ type, amount, fromAccountId, toAccountId, description }, token) =>
    apiCall('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ type, amount, fromAccountId, toAccountId, description }),
    }, token),

  getById: (id, token) =>
    apiCall(`/api/transactions/${id}`, {}, token),

  getHistory: (page = 0, size = 20, token) => {
    const params = new URLSearchParams({ page, size });
    return apiCall(`/api/transactions/history?${params}`, {}, token);
  },
};

// ─── User Profile (requires token) ─────────────────
export const userProfile = {
  get: (token) =>
    apiCall('/api/user/profile', {}, token),

  update: ({ firstName, lastName }, token) =>
    apiCall('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ firstName, lastName }),
    }, token),

  changePassword: ({ currentPassword, newPassword }, token) =>
    apiCall('/api/user/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }, token),
};

// ─── Admin (requires ADMIN token) ──────────────────────
export const admin = {
  getDashboard: (token) =>
    apiCall('/api/admin/dashboard', {}, token),

  getFlagged: (page = 0, size = 20, token) => {
    const params = new URLSearchParams({ page, size });
    return apiCall(`/api/admin/fraud/flagged?${params}`, {}, token);
  },

  reviewTransaction: (id, decision, token) =>
    apiCall(`/api/admin/fraud/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ decision }),
    }, token),

  getAllAccounts: (page = 0, size = 20, token) => {
    const params = new URLSearchParams({ page, size });
    return apiCall(`/api/admin/accounts?${params}`, {}, token);
  },
};
