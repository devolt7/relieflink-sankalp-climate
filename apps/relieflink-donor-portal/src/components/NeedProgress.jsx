// Two-tone progress: solid = received by the camp, light = pledged / on the way.
export default function NeedProgress({ need }) {
  const total = need.quantityNeeded || 0;
  const inTransit = need.inTransit || 0;
  const pct = (n) => (total === 0 ? 0 : Math.min(100, Math.round((n / total) * 100)));
  const receivedPct = pct(need.quantityFulfilled);
  const transitPct = Math.min(100 - receivedPct, pct(inTransit));

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-paper-dim">
        <div className="h-full bg-fulfilled" style={{ width: `${receivedPct}%` }} />
        <div className="h-full bg-fulfilled/35" style={{ width: `${transitPct}%` }} />
      </div>
      <span className="font-mono-data shrink-0 text-[11px] text-body-soft">
        {need.quantityFulfilled}/{need.quantityNeeded}
      </span>
    </div>
  );
}
