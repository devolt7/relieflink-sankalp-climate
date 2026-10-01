import { Link } from "react-router-dom";
import BreadcrumbBar from "../components/BreadcrumbBar";
import StatCard from "../components/StatCard";
import UrgencyChart from "../components/UrgencyChart";
import DistrictChart from "../components/DistrictChart";
import { useLiveDashboardStats } from "../hooks/useLiveData";
import { HeartHandshake, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { stats, loading, lastUpdated } = useLiveDashboardStats();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 animate-fade-in">
      <BreadcrumbBar
        backTo="/donor"
        backLabel="Relief Map"
        current="Situation Overview"
        category="Public Snapshot"
        subtitle="Live telemetry of relief coverage across flood-affected zones, updated as coordinators post requirements and donors fulfill claims."
        actions={
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="font-mono-data text-xs text-body-soft">
                synced {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <Link
              to="/donor"
              className="inline-flex items-center gap-1.5 rounded-xl bg-action px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-action-hover transition"
            >
              <HeartHandshake className="h-3.5 w-3.5" />
              <span>Act on Relief Map</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        }
      />

      {loading || !stats ? (
        <div className="py-16 text-center text-sm text-body-soft">Loading situation overview…</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total camps" value={stats.totalCamps} />
            <StatCard label="Total needs" value={stats.totalNeeds} />
            <StatCard label="Open needs" value={stats.openNeeds} tone="critical" />
            <StatCard label="Fulfilled" value={`${stats.fulfilledPct}%`} tone="action" />
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-body-soft">
                Overall fulfillment
              </p>
              <p className="font-mono-data text-sm font-bold text-ink">{stats.fulfilledPct}%</p>
            </div>
            <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-paper-dim">
              <div
                className="h-full rounded-full bg-fulfilled transition-all duration-500"
                style={{ width: `${stats.fulfilledPct}%` }}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <UrgencyChart byUrgency={stats.byUrgency} />
            <DistrictChart byDistrict={stats.byDistrict} />
          </div>
        </div>
      )}
    </div>
  );
}
