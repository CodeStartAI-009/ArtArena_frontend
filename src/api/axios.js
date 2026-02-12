import axios from "axios";
const API_BASE_URL =
   "https://artarena-backend.onrender.com"|| "http://localhost:5090";

const API = axios.create({
  baseURL: API_BASE_URL, // backend URL
  withCredentials: true,
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem("artarena_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
