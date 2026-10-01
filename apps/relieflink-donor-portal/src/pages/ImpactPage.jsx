import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BreadcrumbBar from "../components/BreadcrumbBar";
import { getImpactMetrics, getDashboardStats, subscribeToChanges } from "../services/dataService";
import UrgencyChart from "../components/UrgencyChart";
import DistrictChart from "../components/DistrictChart";
import {
  TrendingUp,
  Clock,
  HeartHandshake,
  CheckCircle2,
  Users,
  Building2,
  ArrowRight,
  ShieldCheck,
  Tent,
} from "lucide-react";

export default function ImpactPage() {
  const [metrics, setMetrics] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [m, s] = await Promise.all([getImpactMetrics(), getDashboardStats()]);
      setMetrics(m);
      setDashboardStats(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return subscribeToChanges(loadData);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 animate-fade-in">
      <BreadcrumbBar
        backTo="/donor"
        backLabel="Relief Map"
        current="Impact & Situation Telemetry"
        category="Public Accountability"
        subtitle="Real-time operational metrics across Assam, Bihar & Gujarat flood response: supply turnaround speed, verified intake proofs, and overall need fulfillment."
        actions={
          <Link
            to="/donor"
            className="inline-flex items-center gap-1.5 rounded-xl bg-action px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-action-hover transition"
          >
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Support Camps on Map</span>
          </Link>
        }
      />

      {loading || !metrics ? (
        <div className="py-24 text-center text-body-soft">
          <p className="text-sm font-semibold">Aggregating live impact telemetry...</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-body-soft mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Families Assisted</span>
                <Users className="h-4 w-4 text-action" />
              </div>
              <div className="font-display text-3xl font-bold text-ink font-mono-data">
                {metrics.familiesAssisted.toLocaleString()}+
              </div>
              <p className="text-[11px] text-body-soft mt-1">
                Derived from delivered rations & shelter units
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-body-soft mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Avg Fulfilment Speed</span>
                <Clock className="h-4 w-4 text-action" />
              </div>
              <div className="font-display text-3xl font-bold text-ink font-mono-data">
                {metrics.avgFulfillmentTimeHours}
              </div>
              <p className="text-[11px] text-body-soft mt-1">
                From donor pledge to verified camp intake
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-body-soft mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Overall Fulfilled</span>
                <CheckCircle2 className="h-4 w-4 text-fulfilled" />
              </div>
              <div className="font-display text-3xl font-bold text-fulfilled font-mono-data">
                {metrics.fulfilledRate}%
              </div>
              <p className="text-[11px] text-body-soft mt-1">
                {metrics.fulfilledNeedsCount} of {metrics.totalNeedsCount} requirements reached
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-body-soft mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Relief Camps Covered</span>
                <Tent className="h-4 w-4 text-action" />
              </div>
              <div className="font-display text-3xl font-bold text-ink font-mono-data">
                {metrics.totalCamps}
              </div>
              <p className="text-[11px] text-body-soft mt-1">
                Across {metrics.districtsCovered} disaster-prone districts
              </p>
            </div>
          </div>

          {/* Fulfillment Progress Bar Card */}
          <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-bold text-ink">Crisis Response Fulfillment Trajectory</h3>
                <p className="text-xs text-body-soft">
                  Proportion of posted field requirements claimed and delivered by verified donors.
                </p>
              </div>
              <span className="font-display text-xl font-bold text-fulfilled font-mono-data">
                {metrics.fulfilledRate}% Fulfilled
              </span>
            </div>
            <div className="mt-4 h-3.5 w-full overflow-hidden rounded-full bg-paper-dim">
              <div
                className="h-full rounded-full bg-fulfilled transition-all duration-700"
                style={{ width: `${metrics.fulfilledRate}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-body-soft font-mono-data">
              <span>{metrics.fulfilledNeedsCount} needs fulfilled</span>
              <span>{metrics.totalNeedsCount - metrics.fulfilledNeedsCount} active gaps remaining</span>
            </div>
          </div>

          {/* Charts Grid */}
          {dashboardStats && (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-xs">
                <h3 className="font-display text-base font-bold text-ink mb-1">
                  Demand Urgency Breakdown
                </h3>
                <p className="text-xs text-body-soft mb-4">
                  Distribution of open requirements by urgency level.
                </p>
                <UrgencyChart byUrgency={dashboardStats.byUrgency} />
              </div>

              <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-xs">
                <h3 className="font-display text-base font-bold text-ink mb-1">
                  Geographic Coverage by District
                </h3>
                <p className="text-xs text-body-soft mb-4">
                  Camps and operational need density across affected river basins.
                </p>
                <DistrictChart byDistrict={dashboardStats.byDistrict} />
              </div>
            </div>
          )}

          {/* SANKALP Pillars Summary */}
          <div className="rounded-2xl border border-line bg-paper/60 p-6">
            <h3 className="font-display text-base font-bold text-ink mb-4">
              Integrated Climate Response Pipeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-line bg-white p-4">
                <span className="text-xs font-bold text-action">01 · PREDICT</span>
                <h4 className="font-bold text-sm text-ink mt-1">Open-Meteo Early Warning</h4>
                <p className="text-xs text-body-soft mt-1 leading-relaxed">
                  Real-time precipitation and hydro telemetry forecasts river breaches 48-72 hours in advance.
                </p>
                <Link to="/climate" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-action hover:underline">
                  <span>Explore early warning</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="rounded-xl border border-line bg-white p-4">
                <span className="text-xs font-bold text-action">02 · RELIEF</span>
                <h4 className="font-bold text-sm text-ink mt-1">Verified Camps & Pledges</h4>
                <p className="text-xs text-body-soft mt-1 leading-relaxed">
                  Field coordinators post prioritized supplies. Donors track items from pledge to confirmed delivery.
                </p>
                <Link to="/donor" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-action hover:underline">
                  <span>Open donor portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="rounded-xl border border-line bg-white p-4">
                <span className="text-xs font-bold text-action">03 · RECOVER</span>
                <h4 className="font-bold text-sm text-ink mt-1">Satin Branch Recovery</h4>
                <p className="text-xs text-body-soft mt-1 leading-relaxed">
                  Local microfinance branches trigger emergency loan moratoriums and micro-credit relief to rebuild livelihoods.
                </p>
                <Link to="/satin" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-action hover:underline">
                  <span>Branch recovery layer</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
