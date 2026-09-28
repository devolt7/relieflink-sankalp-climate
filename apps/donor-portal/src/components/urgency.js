// Single source of truth for urgency → color/label mapping, so the map
// markers, list rail, badges, and charts never drift out of sync.
export const URGENCY = {
  Critical: {
    label: "Critical",
    hex: "#c1272d",
    text: "text-critical",
    bg: "bg-critical",
    soft: "bg-critical-soft text-critical",
    ring: "ring-critical",
  },
  High: {
    label: "High",
    hex: "#d97a2c",
    text: "text-high",
    bg: "bg-high",
    soft: "bg-high-soft text-high",
    ring: "ring-high",
  },
  Moderate: {
    label: "Moderate",
    hex: "#c99a1f",
    text: "text-moderate",
    bg: "bg-moderate",
    soft: "bg-moderate-soft text-moderate",
    ring: "ring-moderate",
  },
};

export const URGENCY_ORDER = ["Critical", "High", "Moderate"];

export function statusStyle(status) {
  if (status === "Fulfilled") return "bg-fulfilled-soft text-fulfilled";
  if (status === "Partially Fulfilled") return "bg-moderate-soft text-moderate";
  return "bg-paper-dim text-body-soft";
}
