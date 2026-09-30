import { NavLink } from "react-router-dom";
import { NotificationBell } from "./NotificationUI";

function formatTime(date) {
  if (!date) return "—";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function Navbar({ lastUpdated }) {
  const dashboardCls = ({ isActive }) =>
    `rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
      isActive ? "bg-white text-ink" : "text-paper/70 hover:text-white"
    }`;

  // The donor portal is the primary destination for this app, so it gets a
  // distinct, high-contrast CTA button rather than blending in as a plain nav tab.
  const donorPortalCls = ({ isActive }) =>
    `group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold sm:px-4 shadow-sm ring-1 transition-all ${
      isActive
        ? "bg-white text-ink ring-white"
        : "bg-action text-white ring-action-hover hover:bg-action-hover hover:shadow-md active:scale-[0.98]"
    }`;

  return (
    <header className="bg-ink text-white">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-action">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
            </svg>
          </div>
          <span className="font-display hidden text-sm font-semibold tracking-tight min-[420px]:inline">ReliefLink</span>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/" end className={donorPortalCls}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="hidden shrink-0 sm:block"
            >
              <path d="M12 21s-7-5.2-9.5-9.6C.6 7.5 2.6 4 6.2 4c2 0 3.4 1 4.8 2.6C12.4 5 13.8 4 15.8 4c3.6 0 5.6 3.5 3.7 7.4C17 15.8 12 21 12 21Z" />
            </svg>
            <span className="hidden sm:inline">Go to Donor Portal</span>
            <span className="sm:hidden">Donate</span>
          </NavLink>
          <NavLink to="/dashboard" className={dashboardCls}>
            Dashboard
          </NavLink>
          <NavLink to="/my-pledges" className={dashboardCls}>
            <span className="hidden sm:inline">My Pledges</span>
            <span className="sm:hidden">Pledges</span>
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1.5 font-mono-data text-[11px] text-paper/60 sm:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-action opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-action" />
          </span>
          <span>live · {formatTime(lastUpdated)}</span>
        </div>
        <NotificationBell />
        </div>
      </div>
    </header>
  );
}
