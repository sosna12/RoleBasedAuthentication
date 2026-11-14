import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD
    ? "https://rolebasedauthentication-qd6f.onrender.com/api"
    : "http://localhost:5000/api"
);

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

// Automatically attach the JWT to protected API requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
