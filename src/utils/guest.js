import { v4 as uuidv4 } from "uuid";

export function getOrCreateGuestId() {
  let guestId = localStorage.getItem("artarena_guest_id");

  if (!guestId) {
    guestId = uuidv4();
    localStorage.setItem("artarena_guest_id", guestId);
  }

  return guestId;
}
