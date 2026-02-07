import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('meridiant_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('meridiant_token');
      localStorage.removeItem('meridiant_user');
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  signup: (name, email, password) => api.post('/auth/signup', { name, email, password }),
  signin: (email, password) => api.post('/auth/signin', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// Wallet
export const walletAPI = {
  connect: (wallet_id, wallet_name) => api.post('/wallet/connect', { wallet_id, wallet_name }),
  disconnect: () => api.delete('/wallet/disconnect'),
};

// Transactions
export const transactionAPI = {
  create: (data) => api.post('/transactions', data),
  list: () => api.get('/transactions'),
};

// Exchange Rates
export const ratesAPI = {
  get: () => api.get('/exchange-rates'),
};

export default api;
