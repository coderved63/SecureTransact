const BASE_URL = import.meta.env.VITE_API_URL || '';

// Called when any API request returns 401 — registered by AuthContext
let _onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { _onUnauthorized = fn; };

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Forces the XSRF-TOKEN cookie to be issued (CSRF protection for cookie auth)
export async function fetchCsrfToken() {
  try {
    await fetch(`${BASE_URL}/api/csrf`, { credentials: 'include' });
  } catch {
    // Best-effort; mutations will fail loudly if the cookie is missing
  }
}

async function apiCall(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = { 'Content-Type': 'application/json' };

  // CSRF token header on all state-changing requests
  if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken) headers['X-XSRF-TOKEN'] = csrfToken;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
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

  logout: () =>
    apiCall('/api/auth/logout', {
      method: 'POST',
    }),
};

// ─── Accounts ─────────────────────────────────────────
export const accounts = {
  create: ({ accountType, initialDeposit }) =>
    apiCall('/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ accountType, initialDeposit }),
    }),

  getAll: () =>
    apiCall('/api/accounts'),

  getById: (id) =>
    apiCall(`/api/accounts/${id}`),

  lookupByAccountNumber: (accountNumber) =>
    apiCall(`/api/accounts/lookup?accountNumber=${encodeURIComponent(accountNumber)}`),

  getStatement: (id, start, end) => {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    return apiCall(`/api/accounts/${id}/statement?${params}`);
  },
};

// ─── Transactions ─────────────────────────────────────
export const transactions = {
  create: ({ type, amount, fromAccountId, toAccountId, description }) =>
    apiCall('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ type, amount, fromAccountId, toAccountId, description }),
    }),

  getById: (id) =>
    apiCall(`/api/transactions/${id}`),

  getHistory: (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    return apiCall(`/api/transactions/history?${params}`);
  },
};

// ─── User Profile ─────────────────────────────────
export const userProfile = {
  get: () =>
    apiCall('/api/user/profile'),

  update: ({ firstName, lastName }) =>
    apiCall('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ firstName, lastName }),
    }),

  changePassword: ({ currentPassword, newPassword }) =>
    apiCall('/api/user/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// ─── Admin ──────────────────────────────────────
export const admin = {
  getDashboard: () =>
    apiCall('/api/admin/dashboard'),

  getFlagged: (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    return apiCall(`/api/admin/fraud/flagged?${params}`);
  },

  reviewTransaction: (id, decision) =>
    apiCall(`/api/admin/fraud/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ decision }),
    }),

  getAllAccounts: (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    return apiCall(`/api/admin/accounts?${params}`);
  },
};
