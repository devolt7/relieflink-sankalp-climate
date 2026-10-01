import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BreadcrumbBar from "../components/BreadcrumbBar";
import {
  getDistricts,
  getDistrictClimateForecast,
  triggerPrepositioningSupplies,
  getCamps,
} from "../services/dataService";
import {
  CloudRain,
  Waves,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  PackagePlus,
  ArrowRight,
  RefreshCw,
  MapPin,
  Building2,
  Tent,
  HeartHandshake,
} from "lucide-react";

export default function ClimatePage() {
  const [params, setParams] = useSearchParams();
  const [districts, setDistricts] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState("sivasagar");
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prepositioning, setPrepositioning] = useState(false);
  const [prepositionSuccess, setPrepositionSuccess] = useState(null);
  const [camps, setCamps] = useState([]);

  useEffect(() => {
    getDistricts().then((d) => {
      setDistricts(d);
      const queryDistrict = params.get("district");
      if (queryDistrict) {
        const found = d.find(
          (item) =>
            item.id.toLowerCase() === queryDistrict.toLowerCase() ||
            item.name.toLowerCase().includes(queryDistrict.toLowerCase())
        );
        if (found) {
          setSelectedDistrictId(found.id);
          return;
        }
      }
      if (d.length > 0) setSelectedDistrictId(d[0].id);
    });
    getCamps().then(setCamps);
  }, [params]);

  const loadForecast = useCallback(async (districtId) => {
    setLoading(true);
    setPrepositionSuccess(null);
    try {
      const data = await getDistrictClimateForecast(districtId);
      setForecast(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDistrictId) {
      loadForecast(selectedDistrictId);
    }
  }, [selectedDistrictId, loadForecast]);

  const handlePreposition = async () => {
    if (!forecast || !forecast.suggestedSupplies) return;
    setPrepositioning(true);
    try {
      const res = await triggerPrepositioningSupplies(forecast.district.name, forecast.suggestedSupplies);
      setPrepositionSuccess(res);
      getCamps().then(setCamps);
    } catch (err) {
      alert(err?.message || "Failed to pre-position supplies");
    } finally {
      setPrepositioning(false);
    }
  };

  const currentDistrictCamps = camps.filter((c) =>
    forecast && (c.district.toLowerCase().includes(forecast.district.name.toLowerCase()) || forecast.district.name.toLowerCase().includes(c.district.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 animate-fade-in">
      <BreadcrumbBar
        backTo="/donor"
        backLabel="Relief Map"
        current="Flood Early Warning & Pre-positioning"
        category="Predict & Prepare"
        subtitle="Live precipitation forecasts and river discharge thresholds from Open-Meteo. Identify flood-risk basins 48h before inundation and stage supplies."
        actions={
          <button
            onClick={() => loadForecast(selectedDistrictId)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-semibold text-body hover:bg-paper-dim transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Live Telemetry</span>
          </button>
        }
      />

      {/* District Selector Carousel */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {districts.map((d) => {
          const isSelected = d.id === selectedDistrictId;
          return (
            <button
              key={d.id}
              onClick={() => {
                setSelectedDistrictId(d.id);
                setParams({ district: d.name });
              }}
              className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition border ${
                isSelected
                  ? "bg-action text-white border-action shadow-xs"
                  : "bg-white text-body border-line hover:bg-paper-dim"
              }`}
            >
              <MapPin className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-action"}`} />
              <span>{d.name}</span>
              <span className={`text-[10px] ${isSelected ? "text-white/80" : "text-body-soft"}`}>
                ({d.state})
              </span>
            </button>
          );
        })}
      </div>

      {loading || !forecast ? (
        <div className="py-24 text-center text-body-soft">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-action mb-3" />
          <p className="text-sm font-semibold">Analyzing basin climate telemetry & hydro-data...</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Risk Analysis Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-ink">{forecast.district.name} Catchment</h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        forecast.riskTier === "High"
                          ? "bg-critical-soft text-critical border border-critical/30"
                          : forecast.riskTier === "Medium"
                          ? "bg-high-soft text-high border border-high/30"
                          : "bg-fulfilled-soft text-fulfilled border border-fulfilled/30"
                      }`}
                    >
                      {forecast.riskTier === "High" ? (
                        <ShieldAlert className="h-3 w-3" />
                      ) : (
                        <ShieldCheck className="h-3 w-3" />
                      )}
                      <span>{forecast.riskTier} Flood Risk</span>
                    </span>
                  </div>
                  <p className="text-xs text-body-soft mt-1">
                    River Basin: <strong className="text-ink">{forecast.riverCatchment}</strong>
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-mono-data text-body-soft bg-paper px-2.5 py-1 rounded-lg border border-line">
                    Source: {forecast.source}
                  </span>
                </div>
              </div>

              {/* Hydro Metrics Grid */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-line bg-paper/50 p-4">
                  <div className="flex items-center justify-between text-body-soft mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider">3-Day Rainfall</span>
                    <CloudRain className="h-4 w-4 text-action" />
                  </div>
                  <div className="font-display text-2xl font-bold text-ink font-mono-data">
                    {forecast.rainfallForecastMm} <span className="text-sm font-normal text-body-soft">mm</span>
                  </div>
                  <p className="text-[11px] text-body-soft mt-1">
                    Threshold: &gt;{forecast.district.riskThresholds.high}mm for High Alert
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-paper/50 p-4">
                  <div className="flex items-center justify-between text-body-soft mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider">River Flow Rate</span>
                    <Waves className="h-4 w-4 text-action" />
                  </div>
                  <div className="font-display text-2xl font-bold text-ink font-mono-data">
                    {forecast.riverDischargeM3s.toLocaleString()}{" "}
                    <span className="text-sm font-normal text-body-soft">m³/s</span>
                  </div>
                  <p className="text-[11px] text-body-soft mt-1">
                    Estimated discharge volume
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-paper/50 p-4">
                  <div className="flex items-center justify-between text-body-soft mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider">Lead Time</span>
                    <span className="text-xs font-bold text-action font-mono-data">48 - 72 hrs</span>
                  </div>
                  <div className="font-display text-2xl font-bold text-ink">
                    Pre-Alert
                  </div>
                  <p className="text-[11px] text-body-soft mt-1">
                    Advantage over sudden flash flooding
                  </p>
                </div>
              </div>

              {/* Catchment action link */}
              <div className="mt-5 flex items-center justify-between pt-4 border-t border-line text-xs">
                <Link
                  to={`/donor?district=${encodeURIComponent(forecast.district.name)}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-action hover:underline"
                >
                  <HeartHandshake className="h-4 w-4" />
                  <span>View open needs in {forecast.district.name} on Relief Map →</span>
                </Link>

                <Link
                  to={`/satin?branch=${encodeURIComponent(forecast.district.linkedBranchId || "")}`}
                  className="text-body-soft hover:text-ink font-medium"
                >
                  Branch recovery node →
                </Link>
              </div>
            </div>

            {/* Linked Relief Camps in District */}
            <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <h3 className="font-display text-base font-bold text-ink">
                    Relief Camps in {forecast.district.name} ({currentDistrictCamps.length})
                  </h3>
                  <p className="text-xs text-body-soft">Active staging and intake shelters in this flood zone</p>
                </div>
                <Link to={`/donor?district=${encodeURIComponent(forecast.district.name)}`} className="text-xs font-semibold text-action hover:underline">
                  Filter on Donor Map →
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentDistrictCamps.map((c) => (
                  <div key={c.id} className="rounded-xl border border-line bg-paper/40 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs sm:text-sm text-ink truncate">{c.name}</h4>
                        <span className="inline-flex rounded-full bg-fulfilled-soft px-2 py-0.5 text-[10px] font-semibold text-fulfilled">
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-body-soft mt-1">Capacity: {c.capacity} individuals</p>
                      <p className="text-xs text-body-soft">Branch: {c.branchName}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between text-xs">
                      <span className="text-body-soft">📞 {c.phone}</span>
                      <div className="flex items-center gap-2">
                        <Link to={`/camp?camp=${c.id}`} className="font-semibold text-body hover:underline">
                          Camp Ops
                        </Link>
                        <span>·</span>
                        <Link to={`/donor?camp=${c.id}`} className="font-semibold text-action hover:underline">
                          Pledge →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pre-positioning Panel */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-action/40 bg-white p-5 sm:p-6 shadow-sm ring-1 ring-action/20">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <PackagePlus className="h-5 w-5 text-action" />
                  <h3 className="font-display text-base font-bold text-ink">Suggested Pre-positioning</h3>
                </div>
                <span className="rounded-lg bg-action/10 px-2 py-0.5 text-[11px] font-bold text-action">
                  Automated
                </span>
              </div>

              <p className="mt-2 text-xs text-body-soft">
                Based on <strong className="text-ink">{forecast.riskTier} flood risk</strong> in {forecast.district.name}, our logistics algorithm auto-recommends staging these critical items:
              </p>

              <div className="mt-4 space-y-2.5">
                {forecast.suggestedSupplies.map((s, idx) => (
                  <div key={idx} className="rounded-xl border border-line bg-paper/50 p-3 flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`inline-block rounded-md px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider mb-1 ${
                          s.priority === "Critical"
                            ? "bg-critical-soft text-critical"
                            : s.priority === "High"
                            ? "bg-high-soft text-high"
                            : "bg-paper-dim text-body-soft"
                        }`}
                      >
                        {s.priority}
                      </span>
                      <h4 className="text-xs font-bold text-ink">{s.item}</h4>
                      <p className="text-[11px] text-body-soft">{s.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono-data text-xs font-bold text-action">
                        {s.suggestedQty} {s.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {prepositionSuccess && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      Successfully pre-positioned {prepositionSuccess.count} supply items to {prepositionSuccess.campName}!
                    </span>
                  </div>
                  <Link
                    to={`/donor?district=${encodeURIComponent(forecast.district.name)}`}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-900 underline font-semibold"
                  >
                    <span>Inspect these pre-positioned requirements on the Donor Map →</span>
                  </Link>
                </div>
              )}

              <button
                onClick={handlePreposition}
                disabled={prepositioning || currentDistrictCamps.length === 0}
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-action px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-action-hover disabled:opacity-50"
              >
                <PackagePlus className="h-4 w-4" />
                <span>
                  {prepositioning
                    ? "Dispatching to Camps..."
                    : `Pre-position to ${forecast.district.name} Camps`}
                </span>
              </button>

              <div className="mt-3 flex items-center justify-between text-[11px] text-body-soft pt-2 border-t border-line/60">
                <Link to="/camp" className="text-action hover:underline font-semibold">
                  + Add New Camp to {forecast.district.name}
                </Link>
                <Link to="/impact" className="text-body-soft hover:underline">
                  View Fulfillment %
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
