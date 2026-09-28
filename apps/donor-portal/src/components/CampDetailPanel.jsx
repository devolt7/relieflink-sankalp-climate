import { useState } from "react";
import UrgencyBadge from "./UrgencyBadge";
import StatusPill from "./StatusPill";
import ClaimModal from "./ClaimModal";
import { URGENCY_ORDER } from "./urgency";

export default function CampDetailPanel({ camp, onClose }) {
  const [claimingNeed, setClaimingNeed] = useState(null);

  if (!camp) return null;

  const sortedNeeds = [...camp.needs].sort(
    (a, b) => URGENCY_ORDER.indexOf(a.urgency) - URGENCY_ORDER.indexOf(b.urgency)
  );

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-ink/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[10000] flex w-full max-w-md flex-col bg-paper shadow-2xl">
        <div className="flex items-start justify-between border-b border-line bg-white px-5 py-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-body-soft">
              {camp.district} district
            </p>
            <h2 className="font-display text-lg font-semibold text-ink">{camp.name}</h2>
            <a href={`tel:${camp.phone}`} className="mt-1 inline-block font-mono-data text-xs text-action hover:underline">
              {camp.phone}
            </a>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-body-soft hover:bg-paper-dim hover:text-ink transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-body-soft">
            {sortedNeeds.length} tracked need{sortedNeeds.length === 1 ? "" : "s"}
          </p>
          <ul className="space-y-3">
            {sortedNeeds.map((need) => {
              const remaining = need.quantityNeeded - need.quantityFulfilled;
              const pct = need.quantityNeeded === 0 ? 0 : Math.round((need.quantityFulfilled / need.quantityNeeded) * 100);
              return (
                <li key={need.id} className="rounded-xl border border-line bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-ink">{need.item}</p>
                    <UrgencyBadge urgency={need.urgency} />
                  </div>
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-paper-dim overflow-hidden">
                      <div className="h-full bg-fulfilled" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-mono-data text-[11px] text-body-soft shrink-0">
                      {need.quantityFulfilled}/{need.quantityNeeded}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <StatusPill status={need.status} />
                    {remaining > 0 ? (
                      <button
                        onClick={() => setClaimingNeed(need)}
                        className="rounded-md bg-action px-3 py-1.5 text-xs font-medium text-white hover:bg-action-hover transition-colors"
                      >
                        Claim this need
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-fulfilled">Fully met — thank you</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {claimingNeed && (
        <ClaimModal
          need={claimingNeed}
          campName={camp.name}
          onClose={() => setClaimingNeed(null)}
        />
      )}
    </>
  );
}
