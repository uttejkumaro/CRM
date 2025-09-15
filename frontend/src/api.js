import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://crm-backend-6ujz.onrender.com" // fallback for production
    : "http://localhost:4000"); // dev fallback

const api = axios.create({ baseURL });
export default api;
