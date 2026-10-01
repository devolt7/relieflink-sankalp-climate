import { useCallback, useEffect, useState } from "react";
import { loadInsightCamps, summarizeImpact } from "../services/insightsService";

function MetricCard({ label, value, detail }) {
  return <article className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5"><p className="text-xs font-semibold uppercase tracking-wide text-body-soft">{label}</p><p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p><p className="mt-1 text-xs text-body-soft">{detail}</p></article>;
}

export default function ImpactPage() {
  const [data, setData] = useState(null);
  const [source, setSource] = useState("loading");
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    const result = await loadInsightCamps();
    setData(summarizeImpact(result.camps));
    setSource(result.source);
    setError(result.error);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (!data) return <main className="mx-auto max-w-6xl px-4 py-12 text-center text-sm text-body-soft">Loading impact metrics…</main>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-action">SANKALP · Climate Edition</p><h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">Relief impact</h1><p className="mt-1 text-sm text-body-soft">A live view of camp needs, fulfillment and geographic reach.</p></div>
        <div className="flex items-center gap-3"><span className="rounded-full bg-paper-dim px-3 py-1.5 text-xs font-medium text-body">{source === "live" ? "Live Supabase data" : "Sample demo data"}</span><button onClick={refresh} className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-paper">Refresh</button></div>
      </div>

      {error && <div className="mb-4 rounded-xl border border-moderate/30 bg-moderate-soft px-4 py-3 text-sm text-body">Database metrics aren’t available yet. Showing sample values so the dashboard remains usable.</div>}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Relief camps" value={data.totalCamps} detail="Camp locations in the current dataset" />
        <MetricCard label="Needs posted" value={data.totalNeeds} detail={`${data.fulfilledNeeds} fully fulfilled`} />
        <MetricCard label="Needs fulfilled" value={`${data.fulfilledPct}%`} detail="Fully fulfilled needs / total needs" />
        <MetricCard label="Average fulfilment time" value={data.avgHours == null ? "—" : data.avgHours < 24 ? `${data.avgHours.toFixed(1)} h` : `${(data.avgHours / 24).toFixed(1)} d`} detail="From need creation to its last update, fulfilled needs only" />
        <MetricCard label="Districts covered" value={data.districtCount} detail="Districts with at least one camp" />
        <MetricCard label="Families helped · estimate" value={data.familiesEstimate.toLocaleString("en-IN")} detail="Planning proxy: 25 families per fully fulfilled need" />
      </section>

      <section className="mt-5 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-end justify-between"><div><h2 className="font-display text-base font-semibold text-ink">District coverage</h2><p className="mt-1 text-xs text-body-soft">Open needs and fulfillment by district</p></div><span className="text-xs text-body-soft">{data.byDistrict.length} districts</span></div>
        {data.byDistrict.length ? <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-left text-sm"><thead className="border-b border-line text-xs uppercase tracking-wide text-body-soft"><tr><th className="pb-3 font-medium">District</th><th className="pb-3 font-medium">Needs</th><th className="pb-3 font-medium">Fulfilled</th><th className="pb-3 font-medium">Progress</th></tr></thead><tbody className="divide-y divide-line">{data.byDistrict.map((row) => <tr key={row.district}><td className="py-3 font-medium text-ink">{row.district}</td><td className="py-3 text-body">{row.needs}</td><td className="py-3 text-body">{row.fulfilled}</td><td className="py-3"><div className="flex items-center gap-2"><div className="h-2 w-24 overflow-hidden rounded-full bg-paper-dim"><div className="h-full bg-fulfilled" style={{ width: `${row.needs ? (row.fulfilled / row.needs) * 100 : 0}%` }} /></div><span className="font-mono-data text-xs text-body-soft">{row.needs ? Math.round((row.fulfilled / row.needs) * 100) : 0}%</span></div></td></tr>)}</tbody></table></div> : <p className="py-8 text-center text-sm text-body-soft">No needs have been posted yet.</p>}
      </section>
      <p className="mt-3 text-[11px] leading-5 text-body-soft">Families helped is an estimate for the pilot story, not a verified count of households. The dashboard switches to sample data if Supabase is unavailable.</p>
    </main>
  );
}
