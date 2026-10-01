import StatCard from "../components/StatCard";
import UrgencyChart from "../components/UrgencyChart";
import DistrictChart from "../components/DistrictChart";
import { useLiveDashboardStats } from "../hooks/useLiveData";

export default function DashboardPage() {
  const { stats, loading, error, lastUpdated, refresh } = useLiveDashboardStats();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Situation overview</h1>
          <p className="mt-0.5 text-xs text-body-soft">
            Public snapshot of relief coverage, refreshed live as camps report and donors claim needs.
          </p>
        </div>
        {lastUpdated && (
          <p className="font-mono-data hidden text-[11px] text-body-soft sm:block">
            updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>

      {loading || (!stats && !error) ? (
        <div className="py-16 text-center text-sm text-body-soft">Loading dashboard…</div>
      ) : error ? (
        <div role="alert" className="rounded-xl border border-line bg-white p-6 text-sm text-body">Dashboard data could not be loaded. Check the Supabase configuration and database access, then <button className="font-semibold text-action underline" onClick={refresh}>try again</button>.</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total camps" value={stats.totalCamps} />
            <StatCard label="Total needs" value={stats.totalNeeds} />
            <StatCard label="Open needs" value={stats.openNeeds} tone="critical" />
            <StatCard label="Fulfilled" value={`${stats.fulfilledPct}%`} tone="action" />
          </div>

          <div className="rounded-xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wide text-body-soft">
                Overall fulfillment
              </p>
              <p className="font-mono-data text-sm font-semibold text-ink">{stats.fulfilledPct}%</p>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-paper-dim">
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
