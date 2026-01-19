import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5090", // backend URL
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
