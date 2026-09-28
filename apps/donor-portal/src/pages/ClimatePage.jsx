import { useCallback, useEffect, useMemo, useState } from "react";
import DistrictRiskMap from "../components/DistrictRiskMap";
import { DISTRICTS, SUPPLY_SUGGESTIONS } from "../climate/districts";
import { loadClimateOutlook } from "../climate/climateService";

const RISK_STYLES = {
  High: "border-critical/20 bg-critical-soft text-critical",
  Medium: "border-high/20 bg-high-soft text-high",
  Low: "border-fulfilled/20 bg-fulfilled-soft text-fulfilled",
};

function RiskBadge({ risk }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${RISK_STYLES[risk] || RISK_STYLES.Low}`}>{risk} risk</span>;
}

export default function ClimatePage() {
  const [outlook, setOutlook] = useState([]);
  const [selectedName, setSelectedName] = useState("Sivasagar");
  const [source, setSource] = useState("loading");
  const [warning, setWarning] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await loadClimateOutlook(DISTRICTS);
    setOutlook(result.outlook);
    setSource(result.source);
    setWarning(result.warning);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const selected = useMemo(() => outlook.find((district) => district.name === selectedName) || outlook[0], [outlook, selectedName]);
  const suggestions = selected ? SUPPLY_SUGGESTIONS[selected.risk] : [];
  const sourceLabel = source === "live" ? "Live forecast" : source === "cached" ? "Last saved" : source === "loading" ? "Loading forecast" : "Demo sample";

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-action">Predict · Climate readiness</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">Flood early warning</h1>
          <p className="mt-1 max-w-2xl text-sm text-body-soft">A district screening signal combines the next 3 days of rain with forecast river flow to guide supply staging before impact.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-paper-dim px-3 py-1.5 text-xs font-medium text-body">{sourceLabel}</span>
          <button onClick={refresh} disabled={loading} className="rounded-lg bg-action px-3 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:opacity-60">{loading ? "Refreshing…" : "Refresh forecast"}</button>
        </div>
      </div>

      {warning && <div className="mb-4 rounded-lg border border-moderate/30 bg-moderate-soft px-4 py-3 text-sm text-body">{warning}</div>}

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <section className="overflow-hidden rounded-2xl border border-line bg-white p-3 shadow-sm sm:p-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="font-display text-base font-semibold text-ink">District risk map</h2>
            <span className="text-xs text-body-soft">Assam · Bihar · Andhra Pradesh</span>
          </div>
          <DistrictRiskMap outlook={outlook} onSelect={setSelectedName} />
          <div className="mt-3 flex flex-wrap gap-4 px-1 text-xs text-body-soft">
            {[["High", "bg-critical"], ["Medium", "bg-high"], ["Low", "bg-fulfilled"]].map(([name, color]) => <span key={name} className="inline-flex items-center gap-1.5"><i className={`h-2.5 w-2.5 rounded-full ${color}`} />{name}</span>)}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div><h2 className="font-display text-base font-semibold text-ink">Suggested pre-positioning</h2><p className="mt-0.5 text-xs text-body-soft">Select a district to view a planning checklist.</p></div>
            {selected && <RiskBadge risk={selected.risk} />}
          </div>
          <label className="mb-4 block text-xs font-semibold text-body" htmlFor="risk-district">District</label>
          <select id="risk-district" value={selected?.name || selectedName} onChange={(event) => setSelectedName(event.target.value)} className="mb-4 w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink">
            {DISTRICTS.map((district) => <option key={district.name} value={district.name}>{district.name}, {district.state}</option>)}
          </select>

          {selected ? (
            <>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-paper p-3">
                <div><p className="text-[11px] uppercase tracking-wide text-body-soft">3-day rain</p><p className="mt-1 font-mono-data text-lg font-semibold text-ink">{selected.rainfallMm} <small className="text-xs font-normal">mm</small></p></div>
                <div><p className="text-[11px] uppercase tracking-wide text-body-soft">River flow</p><p className="mt-1 font-mono-data text-lg font-semibold text-ink">{selected.dischargeRatio ? `${selected.dischargeRatio.toFixed(1)}×` : "—"} <small className="text-xs font-normal">vs recent p90</small></p></div>
              </div>
              <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-body-soft">Stage these supplies</p>
              <ul className="divide-y divide-line">
                {suggestions.map((supply) => <li key={supply.item} className="flex items-center justify-between gap-3 py-3"><span className="text-sm font-medium text-ink">{supply.item}</span><span className="text-right text-xs text-body-soft">{supply.quantity}</span></li>)}
              </ul>
              <p className="mt-3 text-[11px] leading-5 text-body-soft">Planning suggestions are indicative, not official evacuation or flood warnings. Confirm with district authorities before dispatch.</p>
            </>
          ) : <p className="py-8 text-center text-sm text-body-soft">Loading district forecast…</p>}
        </section>
      </div>

      <section className="mt-5 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 font-display text-base font-semibold text-ink">District outlook</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {outlook.map((district) => <button key={district.name} onClick={() => setSelectedName(district.name)} className={`rounded-xl border p-3 text-left transition hover:border-action ${selectedName === district.name ? "border-action ring-1 ring-action" : "border-line"}`}><div className="flex items-center justify-between gap-2"><span className="font-semibold text-ink">{district.name}</span><RiskBadge risk={district.risk} /></div><p className="mt-2 text-xs text-body-soft">{district.state} · {district.rainfallMm} mm / 3 days</p><p className="mt-1 text-[11px] text-body-soft">{district.source}</p></button>)}
        </div>
      </section>
      <p className="mt-4 text-[11px] leading-5 text-body-soft">Risk is a transparent heuristic screening score, not a calibrated hydrological warning. High = ≥150 mm forecast rain or a combined rainfall and river-flow signal; Medium = elevated rainfall or river flow. Open-Meteo weather and GloFAS-derived river-discharge estimates can differ from local gauge conditions. Data: <a className="underline" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> and Copernicus GloFAS. Base map © OpenStreetMap contributors.</p>
    </main>
  );
}
