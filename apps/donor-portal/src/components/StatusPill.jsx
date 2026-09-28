import { statusStyle } from "./urgency";

export default function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyle(status)}`}>
      {status}
    </span>
  );
}
