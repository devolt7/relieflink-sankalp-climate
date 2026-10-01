import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getImpactMetrics } from "../services/dataService";
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
} from "lucide-react";

export default function LandingPage() {
  const [metrics, setMetrics] = useState({
    totalCamps: 9,
    totalNeedsCount: 28,
    fulfilledRate: 64,
    familiesAssisted: 1420,
    districtsCovered: 5,
  });

  const [activeStoryStep, setActiveStoryStep] = useState(0);

  useEffect(() => {
    getImpactMetrics().then((m) => {
      if (m) setMetrics(m);
    });
  }, []);

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
      <section className="bg-ink text-white border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
              <span className="h-2 w-2 rounded-full bg-action" />
              <span>SANKALP · Climate Disaster Response Network</span>
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-white">
              Climate disaster relief,{" "}
              <span className="text-action">coordinated.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-paper/70 max-w-2xl">
              An integrated field operations platform connecting flood early warning, emergency camp supplies, transparent donor pledges, and community economic recovery.
            </p>

            {/* Minimal useful option in big */}
            <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xs max-w-2xl shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-action">
                    Primary Relief Action
                  </span>
                  <h2 className="font-display text-xl font-bold text-white mt-0.5">
                    Support Relief Camps
                  </h2>
                  <p className="text-xs text-paper/70 mt-1">
                    View verified urgent supplies across Assam, Bihar & Gujarat camps.
                  </p>
                </div>

                <Link
                  to="/donor"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-action px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-action-hover shadow-md shrink-0 active:scale-95"
                >
                  <HeartHandshake className="h-4 w-4" />
                  <span>Open Relief Map</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Sub-features organized cleanly below */}
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-paper/70">
                <span className="font-medium text-paper/50">Field Sub-Portals:</span>
                <Link
                  to="/camp"
                  className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition font-medium"
                >
                  <Tent className="h-3.5 w-3.5 text-action" />
                  <span>Camp Coordinator Access</span>
                </Link>
                <span className="text-white/20">·</span>
                <Link
                  to="/satin"
                  className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition font-medium"
                >
                  <Building2 className="h-3.5 w-3.5 text-action" />
                  <span>Satin Branch Recovery</span>
                </Link>
                <span className="text-white/20">·</span>
                <Link
                  to="/climate"
                  className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition font-medium"
                >
                  <CloudRain className="h-3.5 w-3.5 text-action" />
                  <span>Flood Early Warning</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* 3 Pillars Overview */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
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
