import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const accountApi = {
  create: (data) => api.post('/accounts', data),
  getAll: () => api.get('/accounts'),
  getById: (id) => api.get(`/accounts/${id}`),
  getStatement: (id, start, end) => api.get(`/accounts/${id}/statement`, { params: { start, end } }),
};

export const transactionApi = {
  submit: (data) => api.post('/transactions', data),
  getById: (id) => api.get(`/transactions/${id}`),
  getHistory: (page = 0, size = 20) => api.get('/transactions/history', { params: { page, size } }),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getFlagged: (page = 0, size = 20) => api.get('/admin/fraud/flagged', { params: { page, size } }),
  reviewTransaction: (id, decision) => api.put(`/admin/fraud/${id}/review`, { decision }),
  getAllAccounts: (page = 0, size = 20) => api.get('/admin/accounts', { params: { page, size } }),
};

export default api;
