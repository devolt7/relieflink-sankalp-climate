export function timeAgo(iso) {
  if (!iso) return "";
  const secs = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "short" });
}

export function fullDate(iso) {
  return iso
    ? new Date(iso).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "";
}

// Phone (10–13 digits, optional +91 etc.) or a basic email.
export function isValidContact(value) {
  const v = value.trim();
  if (v.includes("@")) return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const digits = v.replace(/\D/g, "");
  return /^[+\d\s\-()]+$/.test(v) && digits.length >= 10 && digits.length <= 13;
}

// Remaining units a donor can still pledge = need - received - already pledged/in transit.
export function inTransitQty(pledges = []) {
  return pledges
    .filter((p) => p.status === "Pledged" || p.status === "Dispatched")
    .reduce((sum, p) => sum + p.quantity, 0);
}
