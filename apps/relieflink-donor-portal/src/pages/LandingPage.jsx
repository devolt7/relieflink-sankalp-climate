import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getImpactMetrics,
  getCampsWithNeeds,
  getDistricts,
  subscribeToChanges,
  triggerPrepositioningSupplies,
} from "../services/dataService";
import { SAMPLE_OUTLOOK, SUPPLY_SUGGESTIONS } from "../climate/districts";
import PledgeModal from "../components/PledgeModal";
import {
  CloudRain,
  ShieldCheck,
  Building2,
  PackageCheck,
  ArrowRight,
  TrendingUp,
  Users,
  CheckCircle,
  HeartHandshake,
  Tent,
  Flame,
  Radio,
  Sparkles,
  MapPin,
  ChevronRight,
  AlertCircle,
  Phone,
  Droplets,
  Layers,
  Check,
} from "lucide-react";

export default function LandingPage() {
  const [metrics, setMetrics] = useState({
    totalCamps: 10,
    totalNeedsCount: 30,
    fulfilledRate: 64,
    familiesAssisted: 1420,
    districtsCovered: 6,
  });

  const [camps, setCamps] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [activeStoryStep, setActiveStoryStep] = useState(0);

  // Interactive Live Console State
  const [consoleTab, setConsoleTab] = useState("needs"); // "needs" | "radar" | "camps"
  const [needFilter, setNeedFilter] = useState("all"); // "all" | "critical" | "high"
  const [selectedDistrictName, setSelectedDistrictName] = useState("Sivasagar");
  const [pledgingNeed, setPledgingNeed] = useState(null);
  const [pledgingCamp, setPledgingCamp] = useState(null);
  const [prepositionMessage, setPrepositionMessage] = useState(null);
  const [isPrepositioning, setIsPrepositioning] = useState(false);

  const loadData = async () => {
    try {
      const [m, c, d] = await Promise.all([
        getImpactMetrics(),
        getCampsWithNeeds(),
        getDistricts(),
      ]);
      if (m) setMetrics(m);
      if (c) setCamps(c);
      if (d) setDistricts(d);
    } catch (err) {
      console.error("Error loading landing page data:", err);
    }
  };

  useEffect(() => {
    loadData();
    return subscribeToChanges(loadData);
  }, []);

  // Filter open needs for the interactive console
  const openNeeds = useMemo(() => {
    const list = camps.flatMap((c) =>
      (c.needs || [])
        .filter((n) => n.status !== "Fulfilled")
        .map((n) => ({ ...n, camp: c }))
    );
    // Sort critical first
    list.sort((a, b) => {
      const uA = a.urgency === "Critical" ? 3 : a.urgency === "High" ? 2 : 1;
      const uB = b.urgency === "Critical" ? 3 : b.urgency === "High" ? 2 : 1;
      return uB - uA;
    });
    return list;
  }, [camps]);

  const filteredNeeds = useMemo(() => {
    if (needFilter === "critical") return openNeeds.filter((n) => n.urgency === "Critical");
    if (needFilter === "high") return openNeeds.filter((n) => n.urgency === "High");
    return openNeeds;
  }, [openNeeds, needFilter]);

  // Current selected district outlook for the flood radar
  const currentOutlook = SAMPLE_OUTLOOK[selectedDistrictName] || {
    rainfallMm: 95,
    dischargeRatio: 1.35,
    risk: "Medium",
  };
  const currentDistrictObj = districts.find(
    (d) => d.name.toLowerCase() === selectedDistrictName.toLowerCase()
  ) || districts[0];

  const handleSimulatePreposition = async () => {
    setIsPrepositioning(true);
    try {
      const suggestions = SUPPLY_SUGGESTIONS[currentOutlook.risk] || SUPPLY_SUGGESTIONS.Medium;
      const formatted = suggestions.map((s) => ({
        item: s.item,
        suggestedQty: 50,
        priority: currentOutlook.risk === "High" ? "Critical" : "High",
      }));
      const res = await triggerPrepositioningSupplies(selectedDistrictName, formatted);
      setPrepositionMessage(`Staged ${res.count} supplies at ${res.campName}`);
      loadData();
      setTimeout(() => setPrepositionMessage(null), 4000);
    } catch (err) {
      setPrepositionMessage(err.message || "Failed to trigger staging");
      setTimeout(() => setPrepositionMessage(null), 4000);
    } finally {
      setIsPrepositioning(false);
    }
  };

  const storySteps = [
    {
      stage: "01 · Hydro Telemetry",
      title: "Rainfall Alert in Dikhow River Basin",
      subtitle: "Open-Meteo telemetry flags >75mm rainfall upstream of Sivasagar.",
      desc: "Hydro sensors detect runoff 48 hours before floodwaters breach embankment walls, alerting district authorities and field camps.",
      actionLabel: "View Flood Risk",
      actionLink: "/climate?district=Sivasagar",
    },
    {
      stage: "02 · Pre-positioning",
      title: "Supplies Staged at High-Ground Camps",
      subtitle: "Pre-positioning orders dispatched to Dikhowmukh and Girls College camps.",
      desc: "Tarpaulins, emergency rations, and water purification units are staged before connecting roads submerge.",
      actionLabel: "View Pre-positioning",
      actionLink: "/climate",
    },
    {
      stage: "03 · Verified Donor Intake",
      title: "Donors Pledge Required Units",
      subtitle: "Donors view verified real-time camp needs on the interactive map.",
      desc: "Pledges are tracked from dispatch to verified camp intake, ensuring 100% accountability without duplicate donations.",
      actionLabel: "Open Relief Map",
      actionLink: "/donor",
    },
    {
      stage: "04 · Borrower Rehabilitation",
      title: "Satin Branch Activates EMI Moratorium",
      subtitle: "Local branch #104 identifies affected borrowers at shelter camps.",
      desc: "Field recovery officers link smallholder enterprises to emergency credit and 3-month moratoriums to restart livelihoods.",
      actionLabel: "Open Branch Recovery",
      actionLink: "/satin",
    },
  ];

  return (
    <div className="min-h-screen bg-paper text-body animate-fade-in">
      {/* Hero Section */}
      <section className="bg-ink text-white border-b border-white/10 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-action/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Headlines & Portal Links */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 self-start">
                <span className="h-2 w-2 rounded-full bg-action animate-pulse" />
                <span>SANKALP · Climate Disaster Response Network</span>
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-white">
                Climate disaster relief,{" "}
                <span className="text-action">coordinated.</span>
              </h1>

              <p className="mt-4 text-sm sm:text-base lg:text-lg leading-relaxed text-paper/70 max-w-xl">
                An integrated field operations platform connecting flood early warning, emergency camp supplies, transparent donor pledges, and community economic recovery.
              </p>

              {/* Primary Action Card */}
              <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-xs max-w-xl shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-action">
                      Primary Relief Action
                    </span>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-white mt-0.5">
                      Support Relief Camps
                    </h2>
                    <p className="text-xs text-paper/70 mt-0.5">
                      View verified urgent supplies across Assam, Bihar & Gujarat camps.
                    </p>
                  </div>

                  <Link
                    to="/donor"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-action px-5 py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-action-hover shadow-md shrink-0 active:scale-95"
                  >
                    <HeartHandshake className="h-4 w-4" />
                    <span>Open Relief Map</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Sub-features organized cleanly below */}
                <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs text-paper/70">
                  <span className="font-medium text-paper/50">Field Sub-Portals:</span>
                  <Link
                    to="/camp"
                    className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition font-medium"
                  >
                    <Tent className="h-3.5 w-3.5 text-action" />
                    <span>Camp Coordinator</span>
                  </Link>
                  <span className="text-white/20">·</span>
                  <Link
                    to="/satin"
                    className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition font-medium"
                  >
                    <Building2 className="h-3.5 w-3.5 text-action" />
                    <span>Satin Recovery</span>
                  </Link>
                  <span className="text-white/20">·</span>
                  <Link
                    to="/climate"
                    className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition font-medium"
                  >
                    <CloudRain className="h-3.5 w-3.5 text-action" />
                    <span>Flood Warning</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Operations Terminal */}
            <div className="lg:col-span-6 xl:col-span-5">
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md shadow-2xl p-4 sm:p-5 flex flex-col min-h-[460px]">
                {/* Console Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-mono-data text-xs font-bold text-white uppercase tracking-wider">
                      Live Crisis Console
                    </span>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-mono-data text-paper/80 font-medium">
                    {openNeeds.length} active needs
                  </span>
                </div>

                {/* Console Mode Switcher */}
                <div className="mt-3 grid grid-cols-3 gap-1 bg-black/25 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setConsoleTab("needs")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      consoleTab === "needs"
                        ? "bg-action text-white shadow-xs"
                        : "text-paper/70 hover:text-white"
                    }`}
                  >
                    <Flame className="h-3.5 w-3.5" />
                    <span>Urgent Needs</span>
                  </button>

                  <button
                    onClick={() => setConsoleTab("radar")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      consoleTab === "radar"
                        ? "bg-action text-white shadow-xs"
                        : "text-paper/70 hover:text-white"
                    }`}
                  >
                    <Radio className="h-3.5 w-3.5" />
                    <span>Flood Radar</span>
                  </button>

                  <button
                    onClick={() => setConsoleTab("camps")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      consoleTab === "camps"
                        ? "bg-action text-white shadow-xs"
                        : "text-paper/70 hover:text-white"
                    }`}
                  >
                    <Tent className="h-3.5 w-3.5" />
                    <span>Field Camps</span>
                  </button>
                </div>

                {/* TAB 1: URGENT NEEDS FEED */}
                {consoleTab === "needs" && (
                  <div className="mt-3 flex-1 flex flex-col">
                    {/* Filter row */}
                    <div className="flex items-center justify-between gap-1 mb-2.5">
                      <span className="text-[11px] text-paper/60 uppercase font-bold tracking-wider">
                        Real-time Demands
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setNeedFilter("all")}
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition ${
                            needFilter === "all" ? "bg-white/20 text-white" : "text-paper/60 hover:text-white"
                          }`}
                        >
                          All ({openNeeds.length})
                        </button>
                        <button
                          onClick={() => setNeedFilter("critical")}
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition ${
                            needFilter === "critical" ? "bg-critical text-white" : "text-paper/60 hover:text-white"
                          }`}
                        >
                          Critical
                        </button>
                        <button
                          onClick={() => setNeedFilter("high")}
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition ${
                            needFilter === "high" ? "bg-amber-600 text-white" : "text-paper/60 hover:text-white"
                          }`}
                        >
                          High
                        </button>
                      </div>
                    </div>

                    {/* Needs list */}
                    <div className="space-y-2 overflow-y-auto max-h-[260px] pr-1">
                      {filteredNeeds.slice(0, 4).map((need) => {
                        const pct = need.quantityNeeded
                          ? Math.min(100, Math.round(((need.quantityFulfilled || 0) / need.quantityNeeded) * 100))
                          : 0;
                        const isCrit = need.urgency === "Critical";

                        return (
                          <div
                            key={need.id}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-action/60 transition flex items-center justify-between gap-3 group"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span
                                  className={`rounded-md px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                                    isCrit ? "bg-critical text-white" : "bg-amber-600 text-white"
                                  }`}
                                >
                                  {need.urgency}
                                </span>
                                <span className="text-[11px] text-paper/60 truncate font-mono-data">
                                  {need.camp?.district}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-white truncate">{need.item}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <div className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
                                  <div className="h-full bg-action" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[10px] font-mono-data text-paper/70 shrink-0">
                                  {need.quantityFulfilled}/{need.quantityNeeded}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setPledgingNeed(need);
                                setPledgingCamp(need.camp);
                              }}
                              className="shrink-0 px-2.5 py-1.5 rounded-lg bg-action hover:bg-action-hover text-white text-[11px] font-bold transition shadow-xs flex items-center gap-1"
                              title="Pledge this item directly"
                            >
                              <span>Pledge</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-paper/60 text-[11px]">Instant pledge without login</span>
                      <Link
                        to="/donor"
                        className="font-semibold text-action hover:text-emerald-300 transition flex items-center gap-1"
                      >
                        <span>View map & all needs</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* TAB 2: FLOOD RADAR */}
                {consoleTab === "radar" && (
                  <div className="mt-3 flex-1 flex flex-col">
                    <p className="text-[11px] text-paper/60 uppercase font-bold tracking-wider mb-2">
                      Catchment Hydro Monitor
                    </p>

                    {/* District tabs */}
                    <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-none">
                      {["Sivasagar", "Majuli", "Dibrugarh", "Patna", "Vijayawada", "Surat"].map((name) => (
                        <button
                          key={name}
                          onClick={() => setSelectedDistrictName(name)}
                          className={`px-2.5 py-1 text-xs rounded-lg font-semibold shrink-0 transition ${
                            selectedDistrictName === name
                              ? "bg-action text-white"
                              : "bg-white/5 text-paper/70 hover:bg-white/10"
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>

                    {/* Selected District Telemetry */}
                    <div className="mt-2.5 p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">{selectedDistrictName}</p>
                          <p className="text-[10px] text-paper/60">
                            {currentDistrictObj?.river || "River Basin"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            currentOutlook.risk === "High"
                              ? "bg-critical text-white"
                              : currentOutlook.risk === "Medium"
                              ? "bg-amber-500 text-ink"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {currentOutlook.risk} Risk Signal
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono-data text-xs">
                        <div className="bg-black/30 p-2 rounded-lg">
                          <span className="text-[10px] text-paper/60 block">72h Forecast Rain</span>
                          <span className="text-sm font-bold text-white">{currentOutlook.rainfallMm} mm</span>
                        </div>
                        <div className="bg-black/30 p-2 rounded-lg">
                          <span className="text-[10px] text-paper/60 block">Discharge Ratio</span>
                          <span className="text-sm font-bold text-white">{currentOutlook.dischargeRatio}x Baseline</span>
                        </div>
                      </div>

                      {prepositionMessage && (
                        <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 shrink-0" />
                          <span>{prepositionMessage}</span>
                        </div>
                      )}

                      <button
                        onClick={handleSimulatePreposition}
                        disabled={isPrepositioning}
                        className="w-full mt-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-action" />
                        <span>
                          {isPrepositioning ? "Dispatching..." : `Stage Emergency Supplies to ${selectedDistrictName}`}
                        </span>
                      </button>
                    </div>

                    <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-paper/60 text-[11px]">Powered by Open-Meteo API</span>
                      <Link
                        to={`/climate?district=${encodeURIComponent(selectedDistrictName)}`}
                        className="font-semibold text-action hover:text-emerald-300 transition flex items-center gap-1"
                      >
                        <span>Full flood dashboard</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* TAB 3: VERIFIED CAMPS */}
                {consoleTab === "camps" && (
                  <div className="mt-3 flex-1 flex flex-col">
                    <p className="text-[11px] text-paper/60 uppercase font-bold tracking-wider mb-2">
                      Active Relief Centers ({camps.length})
                    </p>

                    <div className="space-y-2 overflow-y-auto max-h-[260px] pr-1">
                      {camps.slice(0, 4).map((camp) => (
                        <div
                          key={camp.id}
                          className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-action/60 transition flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-bold text-action">
                                {camp.district}, {camp.state}
                              </span>
                              <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold">
                                {camp.verification}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-white truncate">{camp.name}</p>
                            <p className="text-[10px] text-paper/60 mt-0.5 font-mono-data">
                              Capacity: {camp.capacity} persons · {(camp.needs || []).length} needs posted
                            </p>
                          </div>

                          <Link
                            to={`/donor?camp=${camp.id}`}
                            className="shrink-0 p-2 rounded-lg bg-white/10 hover:bg-action text-white transition text-xs font-medium"
                            title="View camp on map"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <Link
                        to="/camp"
                        className="text-paper/70 hover:text-white transition flex items-center gap-1"
                      >
                        <Tent className="h-3.5 w-3.5 text-action" />
                        <span>Register new camp</span>
                      </Link>
                      <Link
                        to="/donor"
                        className="font-semibold text-action hover:text-emerald-300 transition flex items-center gap-1"
                      >
                        <span>View all on map</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Quick Pledge Modal */}
      {pledgingNeed && pledgingCamp && (
        <PledgeModal
          need={pledgingNeed}
          camp={pledgingCamp}
          onClose={() => {
            setPledgingNeed(null);
            setPledgingCamp(null);
            loadData();
          }}
        />
      )}

      {/* Live Impact Numbers */}
      <section className="border-b border-line bg-white py-6">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-line">
            <div className="px-3 py-1">
              <div className="font-display text-3xl font-bold text-ink font-mono-data">
                {metrics.familiesAssisted.toLocaleString()}+
              </div>
              <p className="text-xs text-body-soft mt-1">Families Supported</p>
            </div>
            <div className="px-3 py-1 pt-3 md:pt-1">
              <div className="font-display text-3xl font-bold text-ink font-mono-data">
                {metrics.totalCamps}
              </div>
              <p className="text-xs text-body-soft mt-1">Active Relief Camps</p>
            </div>
            <div className="px-3 py-1 pt-3 md:pt-1">
              <div className="font-display text-3xl font-bold text-action font-mono-data">
                {metrics.fulfilledRate}%
              </div>
              <p className="text-xs text-body-soft mt-1">Need Fulfillment Rate</p>
            </div>
            <div className="px-3 py-1 pt-3 md:pt-1">
              <div className="font-display text-3xl font-bold text-ink font-mono-data">
                {metrics.districtsCovered}
              </div>
              <p className="text-xs text-body-soft mt-1">Monitored Basins</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Clear Portals / Entry Points */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-action/10 px-3 py-1 text-xs font-bold text-action uppercase tracking-wider mb-2">
            <span>Core Portals</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
            Three Operational Gateways
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-body-soft">
            Direct access points tailored for field coordinators, verified donors, and Satin microfinance recovery officers.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Gateway 1: Donor Portal */}
          <div className="rounded-2xl border-2 border-action/30 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-action transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-action text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Public Portal
            </div>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-action/10 text-action mb-4 group-hover:scale-105 transition-transform">
                <HeartHandshake className="h-6 w-6 text-action" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-action">
                Portal 01 · Donors & Public
              </span>
              <h3 className="font-display text-xl font-bold text-ink mt-1">
                Donor Portal & Relief Map
              </h3>
              <p className="mt-2.5 text-xs leading-relaxed text-body-soft">
                Explore geocoded relief camps, filter urgent supply deficits (food, water, medicine), and pledge specific quantities with transparent receipt confirmation.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
              <Link
                to="/donor"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-action px-4 py-2.5 text-xs font-semibold text-white hover:bg-action-hover transition shadow-xs"
              >
                <span>Enter Donor Portal</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Gateway 2: Camp Coordinator */}
          <div className="rounded-2xl border-2 border-line bg-white p-6 shadow-sm flex flex-col justify-between hover:border-action transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Field Coordinator
            </div>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 mb-4 group-hover:scale-105 transition-transform">
                <Tent className="h-6 w-6 text-amber-700" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                Portal 02 · Camp Coordinators
              </span>
              <h3 className="font-display text-xl font-bold text-ink mt-1">
                Camp Coordinator Portal
              </h3>
              <p className="mt-2.5 text-xs leading-relaxed text-body-soft">
                Authorized field access (PIN: 1234). Register new relief camps, post real-time inventory requirements, confirm physical intake of donor shipments, and access offline SMS/QR codes.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
              <Link
                to="/camp"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-xs"
              >
                <span>Enter Camp Portal</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Gateway 3: Satin Branch Recovery */}
          <div className="rounded-2xl border-2 border-line bg-white p-6 shadow-sm flex flex-col justify-between hover:border-action transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Branch Officer
            </div>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 mb-4 group-hover:scale-105 transition-transform">
                <Building2 className="h-6 w-6 text-emerald-700" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Portal 03 · Satin Finserv
              </span>
              <h3 className="font-display text-xl font-bold text-ink mt-1">
                Satin Branch Recovery Hub
              </h3>
              <p className="mt-2.5 text-xs leading-relaxed text-body-soft">
                Branch-level portfolio management. Review pending camp verifications (approve/reject), inspect inundated borrowers at relief camps, and trigger simulated 3-month EMI moratoriums.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
              <Link
                to="/satin"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-paper px-4 py-2.5 text-xs font-semibold text-ink hover:bg-paper-dim transition"
              >
                <span>Open Branch Hub</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars Overview */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 border-t border-line">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-action">
            Response Workflow
          </p>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink">
            Predict. Prepare. Recover.
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-body-soft">
            A continuous loop protecting vulnerable communities before, during, and after severe flooding events.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs flex flex-col justify-between hover:border-action/40 transition">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-action/10 text-action mb-4">
                <CloudRain className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">
                Flood Early Warning
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-body-soft">
                Continuous hydro forecasts detect cresting river basins 48 to 72 hours prior to inundation, triggering automated pre-positioning alerts.
              </p>
            </div>
            <Link
              to="/climate"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-action hover:underline"
            >
              <span>View flood telemetry</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs flex flex-col justify-between hover:border-action/40 transition">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-action/10 text-action mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">
                Verified Camp Relief
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-body-soft">
                Field coordinators post real-time shortages. Donors pledge items with full tracking from initial dispatch to verified on-site intake.
              </p>
            </div>
            <Link
              to="/donor"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-action hover:underline"
            >
              <span>Explore relief map</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs flex flex-col justify-between hover:border-action/40 transition">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-action/10 text-action mb-4">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">
                Community Recovery
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-body-soft">
                Satin Finserv branch field officers issue emergency recovery credit and 3-month loan moratoriums to prevent distress selling.
              </p>
            </div>
            <Link
              to="/satin"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-action hover:underline"
            >
              <span>Branch recovery hub</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Sivasagar Pilot Interactive Timeline */}
      <section className="border-t border-line bg-white px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-action">
                Pilot Walkthrough
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink">
                The Sivasagar Basin Response Cycle
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-body-soft max-w-xl">
                How ReliefLink connects prediction, camp pre-positioning, donor fulfillment, and credit rehabilitation.
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-paper p-1 border border-line self-start sm:self-auto">
              {storySteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStoryStep(i)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    activeStoryStep === i
                      ? "bg-action text-white"
                      : "text-body-soft hover:text-ink"
                  }`}
                >
                  Step 0{i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-paper/50 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-action">
                  {storySteps[activeStoryStep].stage}
                </span>
                <h3 className="font-display text-2xl font-bold text-ink">
                  {storySteps[activeStoryStep].title}
                </h3>
                <p className="text-xs font-semibold text-body">
                  {storySteps[activeStoryStep].subtitle}
                </p>
                <p className="text-xs sm:text-sm text-body-soft leading-relaxed">
                  {storySteps[activeStoryStep].desc}
                </p>

                <div className="pt-3">
                  <Link
                    to={storySteps[activeStoryStep].actionLink}
                    className="inline-flex items-center gap-2 rounded-xl bg-action px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-action-hover shadow-xs"
                  >
                    <span>{storySteps[activeStoryStep].actionLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Step indicator */}
              <div className="w-full lg:w-80 rounded-xl border border-line bg-white p-4 shadow-xs space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-body-soft">
                  Progress Steps
                </p>
                {storySteps.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveStoryStep(idx)}
                    className={`cursor-pointer rounded-lg p-2.5 transition border ${
                      activeStoryStep === idx
                        ? "border-action bg-action/5"
                        : "border-transparent hover:bg-paper"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-semibold ${activeStoryStep === idx ? "text-action" : "text-ink"}`}>
                        {s.stage}
                      </span>
                      {activeStoryStep > idx && <CheckCircle className="h-3.5 w-3.5 text-fulfilled" />}
                    </div>
                    <p className="text-[11px] text-body-soft truncate mt-0.5">{s.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="border-t border-line bg-white px-5 py-8 text-center text-xs text-body-soft">
        <div className="flex items-center justify-center gap-2 font-display font-bold text-ink mb-1">
          <span>ReliefLink</span>
          <span>·</span>
          <span>SANKALP Climate Edition</span>
        </div>
        <p>Verified relief camps, early warning telemetry & microfinance recovery network.</p>
      </footer>
    </div>
  );
}
