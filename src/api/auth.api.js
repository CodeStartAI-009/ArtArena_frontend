import axios from "axios";

/*
  API URL resolution:
  - Local dev → http://localhost:5090
  - Production → env variable (HTTPS)
*/
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5090";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("artarena_token");

    if (token && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   AUTH APIs
========================= */

export const guestLogin = (guestId) =>
  API.post(
    "/auth/guest",
    {},
    {
      headers: guestId ? { "x-guest-id": guestId } : {},
    }
  );

export const emailSignup = (data, guestId) =>
  API.post("/auth/email", data, {
    headers: guestId ? { "x-guest-id": guestId } : {},
  });

export const getMe = () => API.get("/auth/me");

export default API;
