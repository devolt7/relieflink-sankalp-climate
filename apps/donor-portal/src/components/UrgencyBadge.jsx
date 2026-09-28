import { URGENCY } from "./urgency";

export default function UrgencyBadge({ urgency, size = "sm" }) {
  const cfg = URGENCY[urgency] ?? URGENCY.Moderate;
  const sizeCls = size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium font-mono-data uppercase tracking-wide ${sizeCls} ${cfg.soft}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.bg}`} />
      {cfg.label}
    </span>
  );
}
