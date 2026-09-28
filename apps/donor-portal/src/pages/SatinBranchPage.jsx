import { useCallback, useEffect, useMemo, useState } from "react";
import { BRANCHES, SAMPLE_BORROWERS, loadInsightCamps } from "../services/insightsService";

export default function SatinBranchPage() {
  const [branchId, setBranchId] = useState(BRANCHES[0].id);
  const [camps, setCamps] = useState([]);
  const [source, setSource] = useState("loading");
  const [recoveryList, setRecoveryList] = useState(null);

  const refresh = useCallback(async () => {
    const result = await loadInsightCamps();
    setCamps(result.camps);
    setSource(result.source);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const branch = BRANCHES.find((item) => item.id === branchId) || BRANCHES[0];
  const areaCamps = useMemo(() => camps.filter((camp) => branch.areas.some((area) => area.toLowerCase() === String(camp.district || "").toLowerCase())), [camps, branch]);
  const borrowers = useMemo(() => SAMPLE_BORROWERS.filter((borrower) => branch.areas.includes(borrower.district)), [branch]);
  const openNeeds = areaCamps.reduce((sum, camp) => sum + (camp.needs || []).filter((need) => need.status !== "Fulfilled" && need.quantityFulfilled < need.quantityNeeded).length, 0);

  const triggerRecovery = () => {
    const result = borrowers.map((borrower, index) => ({
      ...borrower,
      support: index % 2 === 0 ? "60-day EMI moratorium review" : "Emergency micro-loan eligibility review",
      status: "Simulated · officer review required",
    }));
    setRecoveryList(result);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-action">Recover · Satin Finserv</p><h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">Branch field dashboard</h1><p className="mt-1 text-sm text-body-soft">Coordinate nearby relief camps and preview a recovery-support workflow.</p></div>
        <span className="rounded-full bg-moderate-soft px-3 py-1.5 text-xs font-semibold text-body">Simulation · no borrower data is real</span>
      </div>

      <section className="mb-5 rounded-2xl border border-line bg-white p-4 shadow-sm sm:flex sm:items-end sm:justify-between sm:gap-4 sm:p-5">
        <div className="min-w-64 flex-1"><label htmlFor="branch-select" className="mb-2 block text-xs font-semibold text-body">Satin branch / service area</label><select id="branch-select" value={branchId} onChange={(event) => { setBranchId(event.target.value); setRecoveryList(null); }} className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink sm:max-w-md">{BRANCHES.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.state}</option>)}</select></div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-0 sm:w-80"><div className="rounded-xl bg-paper p-3"><p className="text-[11px] uppercase tracking-wide text-body-soft">Area camps</p><p className="mt-1 font-display text-2xl font-semibold text-ink">{areaCamps.length}</p></div><div className="rounded-xl bg-paper p-3"><p className="text-[11px] uppercase tracking-wide text-body-soft">Open needs</p><p className="mt-1 font-display text-2xl font-semibold text-ink">{openNeeds}</p></div></div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.25fr]">
        <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2"><div><h2 className="font-display text-base font-semibold text-ink">Field nodes · relief camps</h2><p className="mt-1 text-xs text-body-soft">Camps matched to {branch.areas.join(", ")}</p></div><span className="rounded-full bg-paper-dim px-2.5 py-1 text-[11px] text-body">{source === "live" ? "Live camps" : "Sample camps"}</span></div>
          {areaCamps.length ? <ul className="divide-y divide-line">{areaCamps.map((camp) => { const open = (camp.needs || []).filter((need) => need.status !== "Fulfilled" && need.quantityFulfilled < need.quantityNeeded).length; return <li key={camp.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{camp.name}</p><p className="mt-0.5 text-xs text-body-soft">{camp.district}{camp.state ? `, ${camp.state}` : ""}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${open ? "bg-critical-soft text-critical" : "bg-fulfilled-soft text-fulfilled"}`}>{open} open needs</span></li>; })}</ul> : <div className="rounded-xl bg-paper p-5 text-sm text-body-soft">No camps in this branch’s assigned districts yet. Live data appears here when camp records use a matching district name.</div>}
        </section>

        <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-base font-semibold text-ink">Affected borrowers · sample records</h2><p className="mt-1 text-xs text-body-soft">Fictional pilot records for workflow demonstration only.</p></div><button onClick={triggerRecovery} disabled={!borrowers.length} className="rounded-lg bg-action px-3 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-50">Trigger recovery support</button></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[570px] text-left text-xs"><thead className="border-b border-line text-[10px] uppercase tracking-wide text-body-soft"><tr><th className="pb-3 font-medium">Borrower</th><th className="pb-3 font-medium">Area / impact signal</th><th className="pb-3 font-medium">Exposure</th><th className="pb-3 font-medium">Outstanding sample</th></tr></thead><tbody className="divide-y divide-line">{borrowers.map((person) => <tr key={person.id}><td className="py-3"><span className="block font-semibold text-ink">{person.name}</span><span className="text-body-soft">{person.id}</span></td><td className="py-3"><span className="block text-ink">{person.district}</span><span className="text-body-soft">{person.signal}</span></td><td className="py-3 text-body">{person.exposure}</td><td className="py-3 font-mono-data text-body">{person.loan}</td></tr>)}</tbody></table></div>
          {!borrowers.length && <p className="py-6 text-center text-sm text-body-soft">No sample records mapped to this branch.</p>}
          {recoveryList && <div className="mt-5 rounded-xl border border-action/20 bg-fulfilled-soft/50 p-4"><div className="mb-3"><p className="font-semibold text-ink">Simulated eligibility review created</p><p className="mt-1 text-xs text-body-soft">This does not contact borrowers or change any real loan.</p></div><ul className="space-y-2">{recoveryList.map((person) => <li key={person.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-white/80 px-3 py-2 text-xs"><span className="font-medium text-ink">{person.name} · {person.district}</span><span className="text-fulfilled">{person.support}</span></li>)}</ul></div>}
        </section>
      </div>
      <p className="mt-4 text-[11px] leading-5 text-body-soft">This prototype illustrates a referral and review step only. Satin policy, borrower consent, eligibility checks, and authorized officer approval must be implemented before any real financial support action.</p>
    </main>
  );
}
