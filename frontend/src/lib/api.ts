import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },
  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify', { token });
    return response.data;
  },
};

// Tenants API
export const tenantsApi = {
  getAll: async () => {
    const response = await api.get('/tenants');
    return response.data;
  },
  create: async (data: { name: string; shopDomain: string; accessToken: string }) => {
    const response = await api.post('/tenants', data);
    return response.data;
  },
  delete: async (tenantId: string) => {
    const response = await api.delete(`/tenants/${tenantId}`);
    return response.data;
  },
  syncCustomers: async (tenantId: string) => {
    const response = await api.post(`/tenants/${tenantId}/sync/customers`);
    return response.data;
  },
  syncProducts: async (tenantId: string) => {
    const response = await api.post(`/tenants/${tenantId}/sync/products`);
    return response.data;
  },
  syncOrders: async (tenantId: string) => {
    const response = await api.post(`/tenants/${tenantId}/sync/orders`);
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getSummary: async (tenantId: string) => {
    const response = await api.get(`/analytics/${tenantId}/summary`);
    return response.data;
  },
  getOrdersByDate: async (tenantId: string, start: string, end: string) => {
    const response = await api.get(`/analytics/${tenantId}/orders-by-date`, {
      params: { start, end },
    });
    return response.data;
  },
  getTopCustomers: async (tenantId: string, limit: number = 5) => {
    const response = await api.get(`/analytics/${tenantId}/top-customers`, {
      params: { limit },
    });
    return response.data;
  },
  getRevenueByCategory: async (tenantId: string) => {
    const response = await api.get(`/analytics/${tenantId}/revenue-by-category`);
    return response.data;
  },
};

export default api;
