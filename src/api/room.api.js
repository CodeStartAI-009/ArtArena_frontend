// src/api/room.api.js
import API from "./axios";

/* =========================
   CREATE ROOM
========================= */
export const createRoom = (data) => {
  return API.post("/rooms", data);
};

/* =========================
   GET ROOM
========================= */
export const getRoom = (code) => {
  return API.get(`/rooms/${code}`);
};

/* =========================
   JOIN ROOM
========================= */
export const joinRoom = (code) => {
  return API.post(`/rooms/${code}/join`);
};
