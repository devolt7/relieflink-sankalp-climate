import { pledgeStatusStyle } from "./pledgeStatus";

export default function PledgeStatusPill({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${pledgeStatusStyle(status)}`}>
      {status}
    </span>
  );
}
