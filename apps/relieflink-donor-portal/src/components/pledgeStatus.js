// Single source of truth for the pledge lifecycle, like urgency.js is for urgency.
export const PLEDGE_STEPS = ["Pledged", "Dispatched", "Received"];

export function pledgeStatusStyle(status) {
  if (status === "Received") return "bg-fulfilled-soft text-fulfilled";
  if (status === "Dispatched") return "bg-high-soft text-high";
  if (status === "Cancelled") return "bg-paper-dim text-body-soft line-through";
  return "bg-moderate-soft text-moderate";
}
