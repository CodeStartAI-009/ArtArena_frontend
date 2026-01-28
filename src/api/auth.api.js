import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5090",
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem("artarena_token");
  if (token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const guestLogin = (guestId) =>
  API.post("/auth/guest", {}, {
    headers: guestId ? { "x-guest-id": guestId } : {}
  });

export const emailSignup = (data, guestId) =>
  API.post("/auth/email", data, {
    headers: guestId ? { "x-guest-id": guestId } : {}
  });

export const getMe = () => API.get("/auth/me");

export default API;
