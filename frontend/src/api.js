// frontend/src/api.js
import axios from "axios";

// production fallback — use your real backend URL here
const PROD_FALLBACK = "https://crm-backend-6ujz.onrender.com";

const baseURL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? PROD_FALLBACK : "http://localhost:4000");

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
