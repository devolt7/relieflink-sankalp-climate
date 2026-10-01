import { useState, useEffect } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { NotificationBell } from "./NotificationUI";
import {
  Menu,
  X,
  HeartHandshake,
  CloudRain,
  Building2,
  Tent,
  TrendingUp,
  PackageCheck,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

function formatTime(date) {
  if (!date) return "—";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Navbar({ lastUpdated }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinkCls = ({ isActive }) =>
    `rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
      isActive
        ? "bg-white text-ink shadow-xs font-semibold"
        : "text-paper/75 hover:text-white hover:bg-white/10"
    }`;

  const donorPortalCls = ({ isActive }) =>
    `flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all ${
      isActive
        ? "bg-white text-ink ring-1 ring-white"
        : "bg-action text-white hover:bg-action-hover"
    }`;

  const navItems = [
    {
      to: "/donor",
      label: "Relief Map & Camps",
      sub: "Verified needs & 1-click supply pledges",
      icon: HeartHandshake,
      isPrimary: true,
    },
    {
      to: "/climate",
      label: "Flood Warning",
      sub: "Hydro forecasts & supply pre-positioning",
      icon: CloudRain,
    },
    {
      to: "/satin",
      label: "Satin Branch Recovery",
      sub: "Borrower moratoriums & relief node links",
      icon: Building2,
    },
    {
      to: "/camp",
      label: "Camp Coordinator",
      sub: "Post urgent requirements & confirm intake",
      icon: Tent,
    },
    {
      to: "/impact",
      label: "Impact & Situation",
      sub: "Verified delivery telemetry & district stats",
      icon: TrendingUp,
    },
  ];

  return (
    <header className="bg-ink text-white sticky top-0 z-50 shadow-sm border-b border-white/10">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        {/* Brand / Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2.5 hover:opacity-90 transition shrink-0 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-action text-white shadow-xs group-hover:scale-105 transition-transform">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold tracking-tight text-white">ReliefLink</span>
              <span className="rounded bg-white/10 px-1.5 py-0.2 text-[9px] font-semibold text-paper/80 uppercase tracking-wider">
                SANKALP
              </span>
            </div>
            <span className="hidden sm:inline text-[10px] text-paper/50">
              Climate Disaster Coordination
            </span>
          </div>
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          <NavLink to="/donor" className={donorPortalCls}>
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Relief Map</span>
          </NavLink>

          <NavLink to="/climate" className={navLinkCls}>
            <span>Flood Warning</span>
          </NavLink>

          <NavLink to="/satin" className={navLinkCls}>
            <span>Satin Recovery</span>
          </NavLink>

          <NavLink to="/camp" className={navLinkCls}>
            <span>Camp Portal</span>
          </NavLink>

          <NavLink to="/impact" className={navLinkCls}>
            <span>Impact Telemetry</span>
          </NavLink>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <NavLink
            to="/my-pledges"
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "bg-white text-ink font-semibold"
                  : "bg-white/5 text-paper/80 hover:text-white hover:bg-white/10 border border-white/10"
              }`
            }
          >
            <PackageCheck className="h-3.5 w-3.5 text-action" />
            <span className="hidden sm:inline">My Pledges</span>
          </NavLink>

          <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-paper/50 pl-1 font-mono-data">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fulfilled opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-fulfilled" />
            </span>
            <span>{formatTime(lastUpdated)}</span>
          </div>

          <NotificationBell />

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="lg:hidden p-1.5 rounded-lg text-paper/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Clean Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-ink p-4 space-y-2 animate-fade-in shadow-xl">
          <div className="grid gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between p-3 rounded-xl transition ${
                    isActive
                      ? "bg-action text-white shadow-xs"
                      : "bg-white/5 text-paper hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isActive ? "bg-white/20" : "bg-white/10 text-white"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs">{item.label}</p>
                      <p className={`text-[11px] ${isActive ? "text-white/80" : "text-paper/50"}`}>
                        {item.sub}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </NavLink>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <Link
              to="/my-pledges"
              className="flex items-center gap-2 text-xs text-paper/80 hover:text-white font-medium p-2"
            >
              <PackageCheck className="h-4 w-4 text-action" />
              <span>Track Pledges</span>
            </Link>
            <Link
              to="/"
              className="text-xs text-paper/60 hover:text-white p-2 font-medium"
            >
              Overview
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
