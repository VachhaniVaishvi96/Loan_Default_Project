// Centralized API configuration
// In local dev, leave API_BASE_URL as "" (Vite proxy forwards /api to http://127.0.0.1:8000).
// In production on Vercel/Netlify, set environment variable VITE_API_BASE_URL (e.g., "https://loan-default-backend.onrender.com")
// or hardcode the backend URL below.
const rawUrl = import.meta.env.VITE_API_BASE_URL || "";
export const API_BASE_URL = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;


