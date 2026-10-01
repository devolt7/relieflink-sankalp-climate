import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BreadcrumbBar from "../components/BreadcrumbBar";
import {
  getBranches,
  getBorrowersByBranch,
  triggerBranchRecoverySupport,
  getCamps,
  verifyCamp,
} from "../services/dataService";
import {
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Sparkles,
  CreditCard,
  CalendarCheck,
  ShieldCheck,
  Check,
  RefreshCw,
  Phone,
  MapPin,
  HeartHandshake,
  Tent,
  ArrowRight,
} from "lucide-react";

export default function SatinBranchPage() {
  const [params, setParams] = useSearchParams();
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("branch_sivasagar");
  const [borrowers, setBorrowers] = useState([]);
  const [camps, setCamps] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [activeTab, setActiveTab] = useState("borrowers"); // "borrowers" | "camps" | "approval"

  useEffect(() => {
    getBranches().then((b) => {
      setBranches(b);
      const queryBranch = params.get("branch");
      if (queryBranch) {
        const found = b.find(
          (item) =>
            item.id.toLowerCase() === queryBranch.toLowerCase() ||
            item.district.toLowerCase().includes(queryBranch.toLowerCase()) ||
            item.name.toLowerCase().includes(queryBranch.toLowerCase())
        );
        if (found) {
          setSelectedBranchId(found.id);
          return;
        }
      }
      if (b.length > 0) setSelectedBranchId(b[0].id);
    });
    getCamps().then(setCamps);
  }, [params]);

  const loadBranchData = async (branchId) => {
    const list = await getBorrowersByBranch(branchId);
    setBorrowers(list);
  };

  useEffect(() => {
    if (selectedBranchId) {
      loadBranchData(selectedBranchId);
      setSimulationResult(null);
    }
  }, [selectedBranchId]);

  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const linkedCamps = camps.filter(
    (c) => c.branchId === selectedBranchId || (selectedBranch && c.district.toLowerCase().includes(selectedBranch.district.toLowerCase()))
  );
  const pendingCamps = camps.filter((c) => c.verification === "pending");

  const handleTriggerRecovery = async () => {
    setSimulating(true);
    try {
      const res = await triggerBranchRecoverySupport(selectedBranchId);
      setSimulationResult(res);
      await loadBranchData(selectedBranchId);
    } finally {
      setSimulating(false);
    }
  };

  const handleCampVerification = async (campId, newStatus) => {
    await verifyCamp(campId, newStatus);
    const updated = await getCamps();
    setCamps(updated);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 animate-fade-in">
      <BreadcrumbBar
        backTo="/donor"
        backLabel="Relief Map"
        current="Satin Branch Recovery Hub"
        category="Borrower Rehabilitation"
        subtitle="Microfinance recovery nodes linking verified flood relief camps to emergency credit, supply drop-off, and 3-month loan moratoriums."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-body-soft">Active Branch:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => {
                setSelectedBranchId(e.target.value);
                setParams({ branch: e.target.value });
              }}
              className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink outline-none focus:border-action shadow-xs"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.district})
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Branch Snapshot Cards */}
      {selectedBranch && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl border border-line bg-white p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-body-soft">Branch Officer</p>
            <p className="font-display text-base font-bold text-ink mt-1">{selectedBranch.officer}</p>
            <p className="text-xs text-body-soft font-mono-data">{selectedBranch.contact}</p>
          </div>

          <div className="rounded-xl border border-line bg-white p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-body-soft">Active Borrowers</p>
            <p className="font-display text-2xl font-bold text-ink mt-1 font-mono-data">
              {selectedBranch.totalBorrowers}
            </p>
            <p className="text-[11px] text-body-soft">Across {selectedBranch.district}</p>
          </div>

          <div className="rounded-xl border border-line bg-white p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-body-soft">Branch Portfolio</p>
            <p className="font-display text-lg font-bold text-action mt-1 font-mono-data">
              {selectedBranch.activePortfolio}
            </p>
            <p className="text-[11px] text-body-soft">Microfinance & MSME</p>
          </div>

          <div className="rounded-xl border border-line bg-white p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-body-soft">Linked Field Camps</p>
            <p className="font-display text-2xl font-bold text-ink mt-1 font-mono-data">
              {linkedCamps.length}
            </p>
            <p className="text-[11px] text-body-soft">Serving as branch recovery nodes</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-8 flex items-center justify-between border-b border-line pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("borrowers")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "borrowers"
                ? "bg-ink text-white"
                : "bg-paper text-body-soft hover:text-ink"
            }`}
          >
            Inundated Borrowers ({borrowers.length})
          </button>
          <button
            onClick={() => setActiveTab("camps")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "camps"
                ? "bg-ink text-white"
                : "bg-paper text-body-soft hover:text-ink"
            }`}
          >
            Branch Relief Camps ({linkedCamps.length})
          </button>
          <button
            onClick={() => setActiveTab("approval")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "approval"
                ? "bg-ink text-white"
                : "bg-paper text-body-soft hover:text-ink"
            }`}
          >
            <span>Verification Queue</span>
            {pendingCamps.length > 0 && (
              <span className="rounded-full bg-critical px-1.5 py-0.2 text-[10px] text-white font-bold">
                {pendingCamps.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "borrowers" && (
          <button
            onClick={handleTriggerRecovery}
            disabled={simulating}
            className="flex items-center gap-1.5 rounded-xl bg-action px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-action-hover disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {simulating ? "Processing Approvals..." : "Trigger Recovery Support (Simulated)"}
            </span>
          </button>
        )}
      </div>

      {/* Tab Contents */}
      {activeTab === "borrowers" && (
        <div className="mt-5 space-y-4">
          {simulationResult && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">
                      Automated Disaster Relief Interventions Dispatched
                    </h4>
                    <span className="rounded-md bg-emerald-200/70 px-2 py-0.5 text-[10px] font-bold text-emerald-900 uppercase">
                      Simulated Protocol
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Simulated execution: Triggered 3-month EMI moratorium + emergency micro-loan pre-approval up to {simulationResult.emergencyCreditLimit} for {simulationResult.count} verified flood-impacted borrowers across this branch.
                  </p>
                </div>
              </div>
              <span className="font-mono-data text-xs font-bold text-emerald-800 bg-white/80 px-3 py-1 rounded-xl border border-emerald-200 self-start sm:self-auto">
                Status: Applied (Demo)
              </span>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-paper/60 text-body-soft font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Borrower & Enterprise</th>
                    <th className="px-4 py-3">Loan Details</th>
                    <th className="px-4 py-3">Flood Inundation Impact</th>
                    <th className="px-4 py-3">Current Shelter Camp</th>
                    <th className="px-4 py-3">Satin Recovery Package</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {borrowers.map((b) => (
                    <tr key={b.id} className="hover:bg-paper/30 transition">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-ink text-sm">{b.name}</p>
                        <p className="text-body-soft text-[11px]">{b.business}</p>
                        <p className="text-[10px] text-body-soft font-mono-data mt-0.5">{b.village}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-mono-data font-bold text-ink">₹ {b.outstandingPrincipal.toLocaleString()}</p>
                        <p className="text-[11px] text-body-soft font-mono-data">EMI: ₹ {b.monthlyEmi}/mo</p>
                        <span className="text-[10px] text-body-soft font-mono-data">{b.loanAccount}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block rounded-full bg-critical-soft px-2 py-0.5 text-[10px] font-bold text-critical">
                          {b.inundationStatus}
                        </span>
                        <p className="text-[11px] text-body-soft mt-1 max-w-xs">{b.livelihoodImpact}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-ink text-[11px] block">{b.shelterCamp}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Link
                            to={`/donor?district=${encodeURIComponent(selectedBranch?.district || "")}`}
                            className="text-[10px] text-action hover:underline font-semibold"
                          >
                            Find on Map
                          </Link>
                          <span className="text-[10px] text-body-soft">·</span>
                          <Link to="/camp" className="text-[10px] text-body-soft hover:underline">
                            Camp Ops
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                              b.recoveryEligibility.status.includes("Approved")
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-50 text-blue-800 border border-blue-200"
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            {b.recoveryEligibility.status}
                          </span>
                          <p className="text-[10px] text-body-soft">
                            Moratorium: <strong>{b.recoveryEligibility.moratoriumMonths} mos</strong> · Loan: <strong>₹{b.recoveryEligibility.emergencyLoanPreapproved.toLocaleString()}</strong>
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "camps" && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {linkedCamps.map((camp) => (
            <div key={camp.id} className="rounded-2xl border border-line bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-0.5 text-xs font-semibold text-action border border-line">
                    <MapPin className="h-3 w-3" />
                    {camp.district}, {camp.state}
                  </span>
                  <span className="inline-flex rounded-full bg-fulfilled-soft px-2 py-0.5 text-[10px] font-semibold text-fulfilled">
                    Verified Branch Node
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-ink mt-2">{camp.name}</h3>
                <p className="text-xs text-body-soft mt-1">
                  Shelter Capacity: <strong className="text-ink">{camp.capacity} residents</strong>
                </p>
                <p className="text-xs text-body-soft">Contact: {camp.phone}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
                <span className="text-body-soft">Field Officer: {selectedBranch?.officer}</span>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/camp?camp=${camp.id}`}
                    className="font-semibold text-body hover:underline"
                  >
                    Manage Camp
                  </Link>
                  <span>·</span>
                  <Link
                    to={`/donor?camp=${camp.id}`}
                    className="font-semibold text-action hover:underline"
                  >
                    Inspect Needs →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "approval" && (
        <div className="mt-5">
          {pendingCamps.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-12 text-center text-body-soft">
              <ShieldCheck className="mx-auto h-10 w-10 text-action mb-2 opacity-60" />
              <h3 className="font-display text-base font-semibold text-ink">All Camps Verified</h3>
              <p className="text-xs text-body-soft mt-1">
                There are currently no relief camps awaiting verification. All camps in the system are verified and trustworthy.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Link to="/camp" className="rounded-xl bg-action px-4 py-2 text-xs font-semibold text-white hover:bg-action-hover">
                  + Register New Camp
                </Link>
                <Link to="/donor" className="rounded-xl border border-line bg-paper px-4 py-2 text-xs font-semibold text-body hover:bg-paper-dim">
                  View Verified Camps on Map
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCamps.map((c) => (
                <div key={c.id} className="rounded-2xl border border-amber-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                        Pending Verification
                      </span>
                      <span className="text-xs text-body-soft font-mono-data">{c.district}, {c.state}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-ink">{c.name}</h3>
                    <p className="text-xs text-body-soft mt-0.5">
                      Phone: <span className="font-mono-data">{c.phone}</span> · Capacity: {c.capacity}
                    </p>
                    <p className="text-[11px] text-body-soft mt-1">
                      Coordinates: {c.lat}, {c.lng} · Nearest Branch: {c.branchName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCampVerification(c.id, "verified")}
                      className="flex items-center gap-1.5 rounded-xl bg-action px-4 py-2 text-xs font-semibold text-white hover:bg-action-hover transition shadow-xs"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve & Verify</span>
                    </button>
                    <button
                      onClick={() => handleCampVerification(c.id, "rejected")}
                      className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-semibold text-critical hover:bg-red-50 transition"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
