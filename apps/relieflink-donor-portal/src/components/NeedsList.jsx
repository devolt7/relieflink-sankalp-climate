import { URGENCY } from "./urgency";
import UrgencyBadge from "./UrgencyBadge";
import StatusPill from "./StatusPill";
import NeedProgress from "./NeedProgress";
import VerifiedBadge from "./VerifiedBadge";

// Flattens camps→needs into rows for the list view, each carrying its
// parent camp's name/district for display and filtering.
export function flattenRows(camps) {
  return camps.flatMap((camp) =>
    camp.needs.map((need) => ({
      ...need,
      campName: camp.name,
      district: camp.district,
      verification: camp.verification,
    }))
  );
}

export default function NeedsList({ rows, onSelectCamp, camps }) {
  if (rows.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
        <p className="font-display text-sm font-semibold text-ink">No needs match these filters</p>
        <p className="mt-1 text-xs text-body-soft">Try widening the district, item, or urgency filter.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {rows.map((row) => {
        const cfg = URGENCY[row.urgency];
        return (
          <li key={`${row.campId}_${row.id}`} className="relative">
            <span className={`absolute left-0 top-0 h-full w-1 ${cfg.bg}`} aria-hidden />
            <button
              onClick={() => {
                const camp = camps.find((c) => c.id === row.campId);
                onSelectCamp?.(camp);
              }}
              className="w-full px-4 py-3 pl-5 text-left hover:bg-paper-dim/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{row.item}</p>
                  <p className="truncate text-xs text-body-soft">
                    {row.campName} · {row.district}
                  </p>
                </div>
                <UrgencyBadge urgency={row.urgency} />
              </div>
              <div className="mt-2">
                <NeedProgress need={row} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <StatusPill status={row.status} />
                {row.inTransit > 0 && (
                  <span className="text-[11px] text-fulfilled">{row.inTransit} on the way</span>
                )}
                {row.verification !== "verified" && <VerifiedBadge verification={row.verification} />}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
