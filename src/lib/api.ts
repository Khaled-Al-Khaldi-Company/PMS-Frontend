/**
 * Central API configuration for PMS ERP
 * Uses NEXT_PUBLIC_API_URL in production (Vercel) or falls back to localhost for dev
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://pms-backend-64zn.onrender.com';
