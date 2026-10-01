import { useState } from "react";
import { Link } from "react-router-dom";
import UrgencyBadge from "./UrgencyBadge";
import StatusPill from "./StatusPill";
import PledgeStatusPill from "./PledgeStatusPill";
import PledgeModal from "./PledgeModal";
import NeedProgress from "./NeedProgress";
import VerifiedBadge from "./VerifiedBadge";
import { URGENCY_ORDER } from "./urgency";
import { timeAgo, fullDate } from "../lib/format";

function DonationHistory({ donations }) {
  const [open, setOpen] = useState(false);
  if (donations.length === 0) {
    return <p className="mt-3 border-t border-line pt-2.5 text-[11px] text-body-soft">No pledges yet — be the first.</p>;
  }
  return (
    <div className="mt-3 border-t border-line pt-2.5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-[11px] font-medium uppercase tracking-wide text-body-soft hover:text-ink"
        aria-expanded={open}
      >
        <span>Donation history ({donations.length})</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul className="mt-2 space-y-2">
          {donations.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <p className="truncate text-body">
                  <span className="font-medium text-ink">{d.donorName}</span> · {d.quantity} units
                </p>
                <p className="text-[11px] text-body-soft" title={fullDate(d.createdAt)}>
                  {timeAgo(d.createdAt)}
                </p>
              </div>
              <PledgeStatusPill status={d.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CampDetailPanel({ camp, onClose }) {
  const [pledgingNeed, setPledgingNeed] = useState(null);

  if (!camp) return null;

  const rawNeeds = camp.needs || [];
  const uniqueNeeds = rawNeeds.filter((n, idx, arr) => {
    return arr.findIndex((x) => String(x.id) === String(n.id)) === idx;
  });

  const sortedNeeds = [...uniqueNeeds].sort(
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
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <VerifiedBadge verification={camp.verification} />
              {camp.phone && (
                <a href={`tel:${camp.phone}`} className="font-mono-data text-xs text-action hover:underline">
                  {camp.phone}
                </a>
              )}
            </div>

            <div className="mt-2.5 flex items-center gap-2 text-xs">
              <Link
                to={`/climate?district=${encodeURIComponent(camp.district)}`}
                className="text-[11px] font-medium text-action hover:underline"
              >
                Flood forecast →
              </Link>
              <span className="text-line-dark/20">·</span>
              <Link
                to={`/satin?branch=${encodeURIComponent(camp.branchId || "")}`}
                className="text-[11px] font-medium text-action hover:underline"
              >
                Branch node →
              </Link>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-body-soft transition-colors hover:bg-paper-dim hover:text-ink"
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
              const inTransit = need.inTransit || 0;
              const remaining = need.quantityNeeded - need.quantityFulfilled;
              const available = remaining - inTransit;
              return (
                <li key={need.id} className="rounded-xl border border-line bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-ink">{need.item}</p>
                    <UrgencyBadge urgency={need.urgency} />
                  </div>
                  <div className="mt-2.5">
                    <NeedProgress need={need} />
                    {inTransit > 0 && (
                      <p className="mt-1 text-[11px] text-body-soft">
                        {need.quantityFulfilled} received · <span className="text-fulfilled">{inTransit} pledged / on the way</span>
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <StatusPill status={need.status} />
                    {available > 0 ? (
                      <button
                        onClick={() => setPledgingNeed(need)}
                        className="rounded-md bg-action px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-action-hover"
                      >
                        Pledge · {available} needed
                      </button>
                    ) : remaining > 0 ? (
                      <span className="text-xs font-medium text-fulfilled">All pledged — awaiting delivery</span>
                    ) : (
                      <span className="text-xs font-medium text-fulfilled">Fully met — thank you</span>
                    )}
                  </div>
                  <DonationHistory donations={need.donations || []} />
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {pledgingNeed && (
        <PledgeModal
          need={camp.needs.find((n) => n.id === pledgingNeed.id) ?? pledgingNeed}
          camp={camp}
          onClose={() => setPledgingNeed(null)}
        />
      )}
    </>
  );
}
