import axios from "axios";

const API = axios.create({
  baseURL: "https://art-arena-frontend-krr6.vercel.app/",
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem("artarena_token");
  if (token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const guestLogin = (guestId) =>
  API.post(
    "/auth/guest",
    {},
    { headers: guestId ? { "x-guest-id": guestId } : {} }
  );

export const emailSignup = (data, guestId) =>
  API.post("/auth/email", data, {
    headers: guestId ? { "x-guest-id": guestId } : {},
  });

export const getMe = () => API.get("/auth/me");
