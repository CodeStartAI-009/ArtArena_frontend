import axios from "./axios";

export const getGameState = (code) =>
  axios.get(`/game/${code}`);
