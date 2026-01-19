export function getSocketUser() {
    const stored = localStorage.getItem("user");
  
    if (stored) {
      const user = JSON.parse(stored);
      return {
        id: user._id,
        username: user.username,
      };
    }
  
    // 👇 GUEST FALLBACK (CRITICAL)
    let guestId = localStorage.getItem("guest_id");
    let guestName = localStorage.getItem("guest_name");
  
    if (!guestId) {
      guestId = crypto.randomUUID();
      guestName = `Guest_${Math.floor(100000 + Math.random() * 900000)}`;
  
      localStorage.setItem("guest_id", guestId);
      localStorage.setItem("guest_name", guestName);
    }
  
    return {
      id: guestId,
      username: guestName,
    };
  }
  