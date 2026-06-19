import axios from "axios";
// import { useAuthStore } from "@/store/auth"; // <- your Zustand auth store

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT on every request.
api.interceptors.request.use((config) => {
  // Recommended: read straight from your Zustand store (works outside React):
  //   const token = useAuthStore.getState().token;
  // Placeholder below keeps this file standalone until you wire the store.
  const token =
    typeof window !== "undefined" ? localStorage.getItem("pulse_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Optional: bounce to login on an expired/invalid token.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // useAuthStore.getState().clear();
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;