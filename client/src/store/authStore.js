import { create } from 'zustand';
import axios from 'axios';
import { firebaseGoogleLogin } from '../firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('accessToken') || null,
  loading: false,
  error: null,

  initialize: () => {
    const token = get().accessToken;
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  register: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { user, accessToken } = response.data;
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      set({ user, accessToken, loading: false });
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken } = response.data;
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      set({ user, accessToken, loading: false });
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  googleLogin: async (role) => {
    set({ loading: true, error: null });
    try {
      const result = await firebaseGoogleLogin();
      const idToken = await result.user.getIdToken();

      const response = await api.post('/auth/google', { idToken, role });
      const { user, accessToken } = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);

      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      set({ user, accessToken, loading: false });
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Google sign-in failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    delete api.defaults.headers.common['Authorization'];
    set({ user: null, accessToken: null, error: null });
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/forgot-password', { email });
      set({ loading: false });
      return response.data.message;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset email';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  resetPassword: async (token, newPassword) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      set({ loading: false });
      return response.data.message;
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  refreshAccessToken: async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
        withCredentials: true // send cookies
      });
      const { accessToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      set({ accessToken });
    } catch (err) {
      get().logout();
    }
  }
}));

// Setup Axios Interceptor to dynamically inject active Authorization headers
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Setup Axios Interceptors for Token Refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await useAuthStore.getState().refreshAccessToken();
        const token = useAuthStore.getState().accessToken;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
