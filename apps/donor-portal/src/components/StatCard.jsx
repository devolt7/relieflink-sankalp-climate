export default function StatCard({ label, value, sub, tone = "ink" }) {
  const toneCls = {
    ink: "text-ink",
    critical: "text-critical",
    action: "text-action",
  }[tone];

  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-body-soft">{label}</p>
      <p className={`font-display mt-1 text-3xl font-semibold ${toneCls}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-body-soft">{sub}</p>}
    </div>
  );
}
