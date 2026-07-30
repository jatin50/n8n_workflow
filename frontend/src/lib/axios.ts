import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
  withCredentials: true, // send the httpOnly accessToken/refreshToken cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
