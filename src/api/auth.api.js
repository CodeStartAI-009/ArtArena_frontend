import axios from "axios";

/* =========================
   API INSTANCE
========================= */
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5090",
});

/* =========================
   AUTH TOKEN INTERCEPTOR
========================= */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("artarena_token");

  if (token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* =========================
   GUEST LOGIN (WITH REFERRAL)
========================= */
export const guestLogin = (guestId) => {
  const referralCode = localStorage.getItem("referralCode");

  return API.post(
    "/auth/guest",
    {
      referralCode, // 🔗 send referral if exists
    },
    {
      headers: guestId ? { "x-guest-id": guestId } : {},
    }
  );
};

/* =========================
   EMAIL SIGNUP / LOGIN
========================= */
export const emailSignup = (data, guestId) =>
  API.post("/auth/email", data, {
    headers: guestId ? { "x-guest-id": guestId } : {},
  });

/* =========================
   GET CURRENT USER
========================= */
export const getMe = () => API.get("/auth/me");

export default API;
