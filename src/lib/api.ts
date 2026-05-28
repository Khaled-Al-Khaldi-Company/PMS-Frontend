import axios from 'axios';

/**
 * Central API configuration for PMS ERP
 * Uses NEXT_PUBLIC_API_URL in production (Vercel) or falls back to localhost for dev
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://pms-backend-64zn.onrender.com';

/**
 * Pre-configured axios instance with auth headers and automatic 401 handling
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
