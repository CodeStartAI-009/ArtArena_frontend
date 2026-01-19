import axios from "./axios";

export const findPublicGame = () =>
  axios.post("/matchmaking/find");
