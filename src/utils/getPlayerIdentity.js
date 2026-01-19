export function getPlayerIdentity() {
  // Logged-in user
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);

      if (user?._id && user?.username) {
        return {
          id: String(user._id),
          username: user.username,
          isGuest: false,
        };
      }
    } catch {
      // fall through to guest
    }
  }

  // Guest (persistent)
  let guestId = localStorage.getItem("guest_id");
  let guestName = localStorage.getItem("guest_name");

  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guest_id", guestId);
  }

  if (!guestName) {
    guestName = `Guest_${Math.floor(100000 + Math.random() * 900000)}`;
    localStorage.setItem("guest_name", guestName);
  }

  return {
    id: guestId,
    username: guestName,
    isGuest: true,
  };
}
