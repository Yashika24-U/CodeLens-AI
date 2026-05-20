import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5173/api",
  // CRITICAL: This allows the browser to send/receive HttpOnly cookies
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Session expired or unauthorised");
    }
    return Promise.reject(error);
  },
);

export default api;
