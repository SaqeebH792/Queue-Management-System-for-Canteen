import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:8080/api/users").trim(),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default api;
