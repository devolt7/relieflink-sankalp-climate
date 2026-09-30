import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDonor } from "../context/DonorContext";
import { timeAgo } from "../lib/format";

const TOAST_MS = 12000;

const TYPE_STYLE = {
  critical: { bar: "border-critical", dot: "bg-critical", label: "text-critical" },
  received: { bar: "border-fulfilled", dot: "bg-fulfilled", label: "text-fulfilled" },
};

// On-screen banners for new alerts; auto-dismiss, click "View" to jump to the camp.
export function Toasts() {
  const { notifications, toastIds, dismissToast } = useDonor();
  const navigate = useNavigate();
  const timers = useRef(new Map());

  useEffect(() => {
    toastIds.forEach((id) => {
      if (!timers.current.has(id)) timers.current.set(id, setTimeout(() => dismissToast(id), TOAST_MS));
    });
    timers.current.forEach((t, id) => {
      if (!toastIds.includes(id)) {
        clearTimeout(t);
        timers.current.delete(id);
      }
    });
  }, [toastIds, dismissToast]);

  const toasts = toastIds.map((id) => notifications.find((n) => n.id === id)).filter(Boolean);
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-3 top-14 z-[10100] flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-96">
      {toasts.map((t) => {
        const s = TYPE_STYLE[t.type] ?? TYPE_STYLE.critical;
        return (
          <div
            key={t.id}
            role={t.type === "critical" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border border-line border-l-4 bg-white p-3 shadow-xl ${s.bar}`}
          >
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${s.dot} ${t.type === "critical" ? "animate-pulse" : ""}`} />
            <div className="min-w-0 flex-1">
              <p className={`text-[11px] font-semibold uppercase tracking-wide ${s.label}`}>{t.title}</p>
              <p className="mt-0.5 text-sm text-ink">{t.body}</p>
              {t.link && (
                <button
                  onClick={() => {
                    dismissToast(t.id);
                    navigate(t.link);
                  }}
                  className="mt-1.5 text-xs font-medium text-action hover:underline"
                >
                  {t.type === "critical" ? "View camp & help →" : "View my pledges →"}
                </button>
              )}
            </div>
            <button onClick={() => dismissToast(t.id)} aria-label="Dismiss" className="rounded p-1 text-body-soft hover:bg-paper-dim hover:text-ink">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Bell in the navbar with the alert history.
export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useDonor();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markAllRead();
        }}
        aria-label={`Alerts${unreadCount ? `, ${unreadCount} new` : ""}`}
        className="relative rounded-md p-2 text-paper/70 transition-colors hover:text-white"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-critical px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-line bg-white text-body shadow-2xl">
          <p className="border-b border-line px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-body-soft">Alerts</p>
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-body-soft">
              Nothing yet. New critical needs and delivery confirmations show up here.
            </p>
          ) : (
            <ul className="max-h-80 divide-y divide-line overflow-y-auto">
              {notifications.map((n) => {
                const s = TYPE_STYLE[n.type] ?? TYPE_STYLE.critical;
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => {
                        setOpen(false);
                        if (n.link) navigate(n.link);
                      }}
                      className="flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-paper-dim/60"
                    >
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                      <span className="min-w-0">
                        <span className={`block text-[11px] font-semibold uppercase tracking-wide ${s.label}`}>{n.title}</span>
                        <span className="block text-sm text-ink">{n.body}</span>
                        <span className="font-mono-data text-[10px] text-body-soft">{timeAgo(n.at)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
