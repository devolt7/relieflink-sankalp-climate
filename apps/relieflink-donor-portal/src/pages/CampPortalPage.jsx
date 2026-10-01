import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  getCamps,
  createCamp,
  createNeed,
  updateNeedItem,
  archiveNeedItem,
  clearFulfilledNeeds,
  subscribeToChanges,
} from "../services/dataService";
import {
  Tent,
  MapPin,
  Plus,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Lock,
  ArrowRight,
  Edit2,
  Trash2,
  X,
  PartyPopper,
  Sparkles,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";

function PinGate({ onAuthenticated }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const SHARED_PIN = import.meta.env.VITE_COORDINATOR_PIN || "1234";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.trim() === SHARED_PIN) {
      onAuthenticated();
    } else {
      setError("Incorrect PIN. Please try 1234.");
      setPin("");
    }
  };

  return (
    <div className="mx-auto my-auto max-w-md w-full rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-xl">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-critical">
        <Lock className="h-5 w-5 text-critical" />
      </div>
      <h2 className="font-display text-xl font-bold text-ink">Camp Coordinator Access</h2>
      <p className="mt-1 text-xs text-body-soft">
        Enter the authorization PIN to manage relief camp locations and post supply demands.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-body">Access PIN</label>
            <span className="font-mono-data text-xs text-body-soft">Default PIN: 1234</span>
          </div>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-center font-mono-data text-lg font-bold tracking-[0.5em] text-ink outline-none focus:border-action focus:ring-1 focus:ring-action"
            placeholder="••••"
            autoFocus
          />
          {error && <p className="mt-2 text-xs font-medium text-critical">{error}</p>}
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-action px-5 py-3 text-sm font-semibold text-white transition hover:bg-action-hover"
        >
          <span>Enter Coordinator Portal</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function CampForm({ onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    state: "Assam",
    district: "Assam",
    lat: "26.15",
    lng: "91.75",
    contact_phone: "+91 98000 12345",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const camp = await createCamp({
        name: formData.name,
        state: formData.state,
        district: formData.district,
        lat: parseFloat(formData.lat) || 26.15,
        lng: parseFloat(formData.lng) || 91.75,
        contact_phone: formData.contact_phone,
      });
      onSuccess(camp);
    } catch (err) {
      setError(err?.message || "Failed to register camp");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-critical">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-body-soft mb-1">Camp Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Majuli River Rescue Camp"
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-action"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-body-soft mb-1">District / Region</label>
          <input
            type="text"
            required
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            placeholder="e.g. Assam, Gujarat"
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-action"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-body-soft mb-1">State</label>
          <input
            type="text"
            required
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            placeholder="e.g. Assam"
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-action"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-body-soft mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            required
            value={formData.lat}
            onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono-data text-sm font-medium text-ink outline-none focus:border-action"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-body-soft mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            required
            value={formData.lng}
            onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono-data text-sm font-medium text-ink outline-none focus:border-action"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-body-soft mb-1">Contact Phone</label>
          <input
            type="tel"
            required
            value={formData.contact_phone}
            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono-data text-sm font-medium text-ink outline-none focus:border-action"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-body hover:bg-paper-dim"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-action px-5 py-2 text-xs font-semibold text-white transition hover:bg-action-hover disabled:opacity-50"
        >
          {submitting ? "Registering…" : "Register Camp"}
        </button>
      </div>
    </form>
  );
}

function NeedForm({ campId, onNeedAdded }) {
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [urgency, setUrgency] = useState("critical");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createNeed({
        camp_id: campId,
        item: item.trim(),
        quantity_needed: parseInt(quantity, 10),
        urgency,
      });
      setItem("");
      setQuantity("");
      setUrgency("high");
      onNeedAdded();
    } catch (err) {
      setError(err?.message || "Failed to post requirement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 items-stretch">
      <div className="flex-1">
        <input
          type="text"
          required
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="e.g. Tarpaulin Sheets, Clean Water, Medical Kits"
          className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-sm font-medium text-ink outline-none focus:border-action"
        />
      </div>

      <div className="w-full sm:w-28">
        <input
          type="number"
          min="1"
          required
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Qty"
          className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 font-mono-data text-sm font-medium text-ink outline-none focus:border-action"
        />
      </div>

      <div className="w-full sm:w-36">
        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs font-medium text-ink outline-none focus:border-action"
        >
          <option value="critical">🔴 Critical</option>
          <option value="high">🟠 High</option>
          <option value="moderate">🟡 Moderate</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-action px-4 py-2 text-xs font-semibold text-white transition hover:bg-action-hover disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        <span>Post Need</span>
      </button>

      {error && <p className="text-xs text-critical">{error}</p>}
    </form>
  );
}

function CoordinatorNeedsList({ campId, campNeeds, onRefresh }) {
  const [editingId, setEditingId] = useState(null);
  const [editItem, setEditItem] = useState("");
  const [editQty, setEditQty] = useState(0);
  const [editUrgency, setEditUrgency] = useState("high");
  const [reachedBanner, setReachedBanner] = useState(null);

  const startEdit = (n) => {
    setEditingId(n.id);
    setEditItem(n.item);
    setEditQty(n.quantityNeeded);
    setEditUrgency(n.urgency.toLowerCase());
  };

  const handleSaveEdit = async (needId) => {
    await updateNeedItem(needId, {
      item: editItem,
      quantity_needed: editQty,
      urgency: editUrgency,
    });
    setEditingId(null);
    onRefresh();
  };

  const handleArchive = async (needId) => {
    await archiveNeedItem(needId);
    onRefresh();
  };

  const handleClearFulfilled = async () => {
    await clearFulfilledNeeds(campId);
    onRefresh();
  };

  const handleConfirmReached = async (need) => {
    setReachedBanner(need.item);
    await archiveNeedItem(need.id);
    onRefresh();
    setTimeout(() => setReachedBanner(null), 3000);
  };

  const fulfilledCount = campNeeds.filter(
    (n) => n.status === "Fulfilled" || n.quantityFulfilled >= n.quantityNeeded
  ).length;

  return (
    <div className="space-y-3">
      {reachedBanner && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
          <PartyPopper className="h-4 w-4 shrink-0" />
          <span>Supplies fully reached for “{reachedBanner}”! Need cleared from the list.</span>
        </div>
      )}

      {campNeeds.length > 0 && (
        <div className="flex items-center justify-between pb-1">
          <p className="text-xs text-body-soft">
            {campNeeds.length} requirement{campNeeds.length === 1 ? "" : "s"} logged
          </p>
          {fulfilledCount > 0 && (
            <button
              onClick={handleClearFulfilled}
              className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-body-soft hover:bg-paper-dim"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Clear fulfilled ({fulfilledCount})
            </button>
          )}
        </div>
      )}

      {campNeeds.length === 0 ? (
        <div className="py-12 text-center text-body-soft">
          <AlertTriangle className="mx-auto h-8 w-8 text-body-soft opacity-40 mb-2" />
          <p className="text-xs font-medium">No open requirements posted for this camp yet.</p>
          <p className="mt-0.5 text-[11px] opacity-70">Use the form above to post urgent supplies needed.</p>
        </div>
      ) : (
        campNeeds.map((n) => {
          const isDone = n.status === "Fulfilled" || n.quantityFulfilled >= n.quantityNeeded;
          const isEdit = editingId === n.id;

          return (
            <div key={n.id} className="rounded-xl border border-line bg-white p-4 shadow-xs">
              {isEdit ? (
                <div className="space-y-3">
                  <input
                    value={editItem}
                    onChange={(e) => setEditItem(e.target.value)}
                    className="w-full rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-ink"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editQty}
                      onChange={(e) => setEditQty(parseInt(e.target.value) || 0)}
                      className="w-24 rounded-lg border border-line px-3 py-1.5 text-xs font-mono-data"
                    />
                    <select
                      value={editUrgency}
                      onChange={(e) => setEditUrgency(e.target.value)}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="moderate">Moderate</option>
                    </select>
                    <button
                      onClick={() => handleSaveEdit(n.id)}
                      className="ml-auto rounded-lg bg-action px-3 py-1 text-xs font-medium text-white hover:bg-action-hover"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-line px-3 py-1 text-xs text-body hover:bg-paper-dim"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          n.urgency === "Critical"
                            ? "bg-critical-soft text-critical"
                            : n.urgency === "High"
                            ? "bg-high-soft text-high"
                            : "bg-moderate-soft text-moderate"
                        }`}
                      >
                        {n.urgency}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isDone ? "bg-fulfilled-soft text-fulfilled" : "bg-paper-dim text-body-soft"
                        }`}
                      >
                        {n.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-ink truncate">{n.item}</h4>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-body-soft">Fulfilled</p>
                      <p className="font-mono-data text-sm font-bold text-ink">
                        {n.quantityFulfilled} / {n.quantityNeeded}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(n)}
                        className="rounded-lg p-1.5 text-body-soft hover:bg-paper-dim"
                        title="Edit need"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleArchive(n.id)}
                        className="rounded-lg p-1.5 text-body-soft hover:bg-red-50 hover:text-critical"
                        title="Archive need"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {isDone && (
                    <button
                      onClick={() => handleConfirmReached(n)}
                      className="flex items-center gap-1 rounded-lg bg-fulfilled px-3 py-1.5 text-xs font-semibold text-white hover:bg-action-hover"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Confirm Reached</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default function CampPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("relieflink_camp_auth") === "true"
  );
  const [camps, setCamps] = useState([]);
  const [selectedCampId, setSelectedCampId] = useState(null);
  const [isAddingCamp, setIsAddingCamp] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleAuthenticated = () => {
    sessionStorage.setItem("relieflink_camp_auth", "true");
    setIsAuthenticated(true);
  };

  const loadCamps = async () => {
    setLoading(true);
    try {
      const data = await getCamps();
      setCamps(data);
      if (data.length > 0 && !selectedCampId) {
        setSelectedCampId(data[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCamps();
      return subscribeToChanges(loadCamps);
    }
  }, [isAuthenticated]);

  const selectedCamp = camps.find((c) => String(c.id) === String(selectedCampId));

  return (
    <div className="min-h-[calc(100vh-49px)] bg-paper p-4 sm:p-6 flex flex-col">
      {!isAuthenticated ? (
        <div className="flex-1 flex items-center justify-center">
          <PinGate onAuthenticated={handleAuthenticated} />
        </div>
      ) : (
        <div className="mx-auto max-w-6xl w-full flex-1 flex flex-col lg:flex-row gap-5">
          {/* Camps Sidebar */}
          <aside className="w-full lg:w-80 rounded-2xl border border-line bg-white shadow-xs flex flex-col shrink-0 overflow-hidden">
            <div className="p-4 border-b border-line flex items-center justify-between bg-paper/60">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-action/10 text-action">
                  <Tent className="h-4 w-4 text-action" />
                </div>
                <div>
                  <h3 className="font-display text-xs font-bold text-ink uppercase tracking-wider">Relief Camps</h3>
                  <p className="text-[11px] text-body-soft font-mono-data">{camps.length} active locations</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingCamp(true)}
                className="flex items-center gap-1 rounded-xl bg-action px-2.5 py-1 text-xs font-semibold text-white hover:bg-action-hover"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New</span>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[70vh] lg:max-h-none">
              {camps.map((camp) => {
                const isSelected = String(camp.id) === String(selectedCampId);
                return (
                  <button
                    key={camp.id}
                    onClick={() => {
                      setSelectedCampId(camp.id);
                      setIsAddingCamp(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? "border-action bg-action/5 text-ink shadow-xs"
                        : "border-line bg-paper/30 hover:bg-paper text-body"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-body-soft mb-0.5">
                        <MapPin className="h-3 w-3 text-action" />
                        <span>{camp.district}</span>
                      </div>
                      <p className="font-bold text-xs sm:text-sm text-ink truncate">{camp.name}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 ${isSelected ? "text-action" : "text-body-soft"}`} />
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Area */}
          <main className="flex-1 rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-xs flex flex-col">
            {isAddingCamp ? (
              <div>
                <button
                  onClick={() => setIsAddingCamp(false)}
                  className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-body-soft hover:text-ink mb-4"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to camps</span>
                </button>
                <h2 className="font-display text-lg font-bold text-ink">Register Relief Camp</h2>
                <p className="mt-1 text-xs text-body-soft mb-5">
                  Add a new disaster relief camp location to track urgent supplies and field requirements.
                </p>
                <CampForm
                  onCancel={() => setIsAddingCamp(false)}
                  onSuccess={(newCamp) => {
                    setSelectedCampId(newCamp.id);
                    setIsAddingCamp(false);
                    loadCamps();
                  }}
                />
              </div>
            ) : selectedCamp ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-0.5 text-xs font-semibold text-action border border-line">
                      <MapPin className="h-3 w-3" />
                      {selectedCamp.district}, {selectedCamp.state}
                    </span>
                    <h2 className="font-display text-xl font-bold text-ink mt-1.5">{selectedCamp.name}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data text-xs text-body-soft bg-paper px-3 py-1.5 rounded-xl border border-line">
                      📞 {selectedCamp.phone}
                    </span>
                    <Link
                      to={`/donor?camp=${selectedCamp.id}`}
                      className="rounded-xl bg-paper px-3 py-1.5 text-xs font-semibold text-action border border-line hover:bg-paper-dim"
                    >
                      View on Map →
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-body-soft mb-2.5">
                    Post Urgent Requirement
                  </h3>
                  <NeedForm campId={selectedCamp.id} onNeedAdded={loadCamps} />
                </div>

                <div className="border-t border-line pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-body-soft mb-3">
                    Camp Inventory & Demand Tracker
                  </h3>
                  <CoordinatorNeedsList
                    campId={selectedCamp.id}
                    campNeeds={selectedCamp.needs || []}
                    onRefresh={loadCamps}
                  />
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-body-soft">
                <Tent className="mx-auto h-10 w-10 text-body-soft opacity-40 mb-3" />
                <h3 className="font-display text-base font-semibold text-ink">Select a Relief Camp</h3>
                <p className="mt-1 text-xs text-body-soft">Choose a camp from the sidebar or register a new camp.</p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
