import { PLEDGE_STEPS } from "./pledgeStatus";
import { fullDate } from "../lib/format";

// Pledged → Dispatched → Received stepper. Each step shows its timestamp once reached.
export default function PledgeTracker({ pledge }) {
  const reached = PLEDGE_STEPS.indexOf(pledge.status);
  const stamps = [pledge.createdAt, pledge.dispatchedAt, pledge.receivedAt];

  return (
    <ol className="flex items-start" aria-label="Pledge progress">
      {PLEDGE_STEPS.map((step, i) => {
        const done = i <= reached;
        const isLast = i === PLEDGE_STEPS.length - 1;
        return (
          <li key={step} className="relative flex-1">
            {!isLast && (
              <span
                className={`absolute left-[calc(50%+10px)] right-[calc(-50%+10px)] top-[9px] h-0.5 ${
                  i < reached ? "bg-fulfilled" : "bg-line"
                }`}
                aria-hidden
              />
            )}
            <div className="relative flex flex-col items-center text-center">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  done ? "border-fulfilled bg-fulfilled text-white" : "border-line bg-white"
                }`}
              >
                {done && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>
              <span className={`mt-1 text-[11px] font-medium ${done ? "text-ink" : "text-body-soft"}`}>{step}</span>
              <span className="font-mono-data text-[10px] leading-tight text-body-soft">
                {done && stamps[i] ? fullDate(stamps[i]) : "—"}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
