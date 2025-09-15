export const PROD_FALLBACK = "https://crm-backend-6ujz.onrender.com";

export const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PROD_FALLBACK : "http://localhost:4000");
