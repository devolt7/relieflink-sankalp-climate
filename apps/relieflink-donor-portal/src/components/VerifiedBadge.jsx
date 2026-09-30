// Camp trust marker. "verified" is the quiet default; pending camps are clearly flagged.
export default function VerifiedBadge({ verification, size = "sm" }) {
  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  if (verification === "verified") {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-fulfilled-soft font-medium text-fulfilled ${pad}`}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Verified
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-moderate-soft font-medium text-moderate ${pad}`}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
      Unverified
    </span>
  );
}
