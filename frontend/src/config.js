// Centralized API configuration
// In local dev (import.meta.env.DEV), leave API_BASE_URL as "" (Vite proxy forwards /api to http://127.0.0.1:8000).
// In production, uses import.meta.env.VITE_API_BASE_URL or falls back to "https://loan-default-backend1.onrender.com".
const defaultUrl = import.meta.env.DEV ? "" : "https://loan-default-backend1.onrender.com";
const rawUrl = import.meta.env.VITE_API_BASE_URL || defaultUrl;
export const API_BASE_URL = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;



