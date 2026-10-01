import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BreadcrumbBar from "../components/BreadcrumbBar";
import {
  getCamps,
  createCamp,
  createNeed,
  updateNeedItem,
  archiveNeedItem,
  clearFulfilledNeeds,
  confirmPledgeReceived,
  getPublicPledges,
  subscribeToChanges,
  getBranches,
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
  Languages,
  QrCode,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Building2,
  CheckCircle2,
} from "lucide-react";

// Hindi/English localization dictionary (F8)
const I18N = {
  en: {
    portalTitle: "Camp Coordinator Access",
    portalSubtitle: "Enter authorization PIN to manage relief camp inventories.",
    enterBtn: "Enter Coordinator Portal",
    pinHint: "Default PIN: 1234",
    campsSidebarTitle: "Relief Camps",
    activeLocations: "active locations",
    newCampBtn: "New Camp",
    registerCampTitle: "Register Relief Camp",
    registerCampDesc: "Add a new disaster relief location with verified branch affiliation and capacity.",
    campName: "Camp Name",
    district: "District",
    state: "State",
    latitude: "Latitude",
    longitude: "Longitude",
    phone: "Contact Phone",
    capacity: "Shelter Capacity",
    nearestBranch: "Affiliated Satin Branch",
    cancel: "Cancel",
    registerSubmit: "Register Camp",
    postNeedTitle: "Post Urgent Camp Requirement",
    itemPlaceholder: "e.g. Tarpaulin Sheets, Clean Water, Medicines",
    qty: "Qty",
    urgency: "Urgency",
    addNeedBtn: "Post Requirement",
    inventoryTitle: "Inventory & Demands",
    fulfilled: "Fulfilled",
    needed: "Needed",
    confirmReceived: "Confirm Supplies Received",
    clearFulfilled: "Clear Fulfilled",
    verifiedBadge: "Verified Camp",
    pendingBadge: "Pending Verification",
    qrSmsBtn: "Offline SMS / QR",
    qrTitle: "Offline / Low-Internet Need Submission",
    qrDesc: "If cell towers are flooded or data is slow, scan this QR or send the SMS format to our toll-free bridge.",
  },
  hi: {
    portalTitle: "राहत शिविर समन्वयक पोर्टल",
    portalSubtitle: "राहत शिविर की आपूर्ति और आवश्यकताओं के प्रबंधन के लिए पिन दर्ज करें।",
    enterBtn: "पोर्टल में प्रवेश करें",
    pinHint: "डिफ़ॉल्ट पिन: 1234",
    campsSidebarTitle: "राहत शिविर",
    activeLocations: "सक्रिय स्थान",
    newCampBtn: "नया शिविर",
    registerCampTitle: "नया राहत शिविर पंजीकृत करें",
    registerCampDesc: "सैटिन शाखा और क्षमता के साथ नए राहत शिविर का विवरण जोड़ें।",
    campName: "शिविर का नाम",
    district: "ज़िला",
    state: "राज्य",
    latitude: "अक्षांश (Latitude)",
    longitude: "देशांतर (Longitude)",
    phone: "संपर्क फ़ोन नंबर",
    capacity: "आश्रय क्षमता (व्यक्तियों की संख्या)",
    nearestBranch: "संबंधित सैटिन शाखा",
    cancel: "रद्द करें",
    registerSubmit: "शिविर पंजीकृत करें",
    postNeedTitle: "अत्यावश्यक सामग्री की मांग पोस्ट करें",
    itemPlaceholder: "उदा. तिरपाल, शुद्ध पेयजल, दवाइयां, सूखा राशन",
    qty: "मात्रा",
    urgency: "प्राथमिकता",
    addNeedBtn: "मांग जोड़ें",
    inventoryTitle: "राहत सामग्री इन्वेंट्री और मांग",
    fulfilled: "प्राप्त (Fulfilled)",
    needed: "आवश्यक (Needed)",
    confirmReceived: "सामग्री प्राप्ति की पुष्टि करें",
    clearFulfilled: "पूर्ण सामग्री साफ़ करें",
    verifiedBadge: "सत्यापित शिविर",
    pendingBadge: "सत्यापन लंबित",
    qrSmsBtn: "ऑफलाइन SMS / QR",
    qrTitle: "ऑफलाइन / धीमे इंटरनेट पर मांग भेजना",
    qrDesc: "यदि बाढ़ से मोबाइल डेटा बाधित है, तो इस QR को स्कैन करें या SMS प्रारूप में भेजें।",
  },
};

function PinGate({ onAuthenticated, lang }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const SHARED_PIN = import.meta.env.VITE_COORDINATOR_PIN || "1234";
  const t = I18N[lang];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.trim() === SHARED_PIN) {
      onAuthenticated();
    } else {
      setError(lang === "hi" ? "गलत पिन। कृपया 1234 आज़माएं।" : "Incorrect PIN. Please try 1234.");
      setPin("");
    }
  };

  return (
    <div className="mx-auto my-auto max-w-md w-full rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/donor"
          className="inline-flex items-center gap-1 text-xs font-medium text-body-soft hover:text-ink transition"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-action" />
          <span>Back to Relief Map</span>
        </Link>
        <span className="text-[11px] font-mono-data text-body-soft">{t.pinHint}</span>
      </div>

      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-action/20 bg-action/10 text-action">
        <Lock className="h-5 w-5 text-action" />
      </div>
      <h2 className="font-display text-xl font-bold text-ink">{t.portalTitle}</h2>
      <p className="mt-1 text-xs text-body-soft">{t.portalSubtitle}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-body mb-2">PIN</label>
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
          <span>{t.enterBtn}</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            setPin(SHARED_PIN);
            onAuthenticated();
          }}
          className="w-full text-center rounded-xl border border-line bg-paper px-4 py-2 text-xs font-semibold text-action hover:bg-paper-dim transition"
        >
          Quick Demo Access (1234)
        </button>
      </form>
    </div>
  );
}

function CampForm({ onCancel, onSuccess, lang, branches }) {
  const t = I18N[lang];
  const [formData, setFormData] = useState({
    name: "",
    state: "Assam",
    district: "Sivasagar",
    lat: "26.98",
    lng: "94.63",
    contact_phone: "+91 94350 ",
    capacity: "350",
    branchId: branches[0]?.id || "branch_sivasagar",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please provide a valid camp name.");
      return;
    }
    if (!formData.district.trim()) {
      setError("Please provide a district.");
      return;
    }
    if (!formData.state.trim()) {
      setError("Please provide a state.");
      return;
    }
    if (formData.contact_phone.trim().length < 10) {
      setError("Please provide a valid contact phone number (at least 10 digits).");
      return;
    }
    if (!formData.branchId || !formData.branchId.trim()) {
      setError("Please select the nearest affiliated Satin branch.");
      return;
    }
    const cap = parseInt(formData.capacity, 10);
    if (isNaN(cap) || cap <= 0) {
      setError("Please provide a valid positive shelter capacity.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const selectedBranch = branches.find((b) => b.id === formData.branchId);
      const camp = await createCamp({
        name: formData.name.trim(),
        state: formData.state.trim(),
        district: formData.district.trim(),
        lat: parseFloat(formData.lat) || 26.98,
        lng: parseFloat(formData.lng) || 94.63,
        contact_phone: formData.contact_phone.trim(),
        capacity: cap,
        branchId: formData.branchId,
        branchName: selectedBranch?.name || "Satin Finserv Local Branch",
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
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-critical font-medium">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-body-soft mb-1">{t.campName} *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Sivasagar Girls High School Shelter"
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-action"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-body-soft mb-1">{t.district} *</label>
          <input
            type="text"
            required
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            placeholder="e.g. Sivasagar, Majuli, Patna"
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-action"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-body-soft mb-1">{t.state} *</label>
          <input
            type="text"
            required
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            placeholder="e.g. Assam, Bihar, Gujarat"
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-action"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-body-soft mb-1">{t.phone} *</label>
          <input
            type="tel"
            required
            value={formData.contact_phone}
            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono-data text-sm font-medium text-ink outline-none focus:border-action"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-body-soft mb-1">{t.capacity} (people) *</label>
          <input
            type="number"
            min="10"
            required
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono-data text-sm font-medium text-ink outline-none focus:border-action"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-body-soft mb-1">{t.nearestBranch} *</label>
          <select
            value={formData.branchId}
            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-semibold text-ink outline-none focus:border-action"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.district})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-body-soft mb-1">{t.latitude}</label>
            <input
              type="number"
              step="any"
              value={formData.lat}
              onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono-data text-xs text-ink outline-none focus:border-action"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-body-soft mb-1">{t.longitude}</label>
            <input
              type="number"
              step="any"
              value={formData.lng}
              onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono-data text-xs text-ink outline-none focus:border-action"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-body hover:bg-paper-dim"
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-action px-5 py-2 text-xs font-semibold text-white transition hover:bg-action-hover disabled:opacity-50"
        >
          {submitting ? "Registering…" : t.registerSubmit}
        </button>
      </div>
    </form>
  );
}

function NeedForm({ campId, onNeedAdded, lang }) {
  const t = I18N[lang];
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [urgency, setUrgency] = useState("critical");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item.trim()) {
      setError("Please describe the required item.");
      return;
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a quantity greater than zero.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await createNeed({
        camp_id: campId,
        item: item.trim(),
        quantity_needed: qty,
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
          placeholder={t.itemPlaceholder}
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
          placeholder={t.qty}
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
        <span>{t.addNeedBtn}</span>
      </button>

      {error && <p className="text-xs text-critical font-medium">{error}</p>}
    </form>
  );
}

function CoordinatorNeedsList({ campId, campNeeds, onRefresh, lang, pledges }) {
  const t = I18N[lang];
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
    if (window.confirm("Archive this need from active list?")) {
      await archiveNeedItem(needId);
      onRefresh();
    }
  };

  const handleClearFulfilled = async () => {
    await clearFulfilledNeeds(campId);
    onRefresh();
  };

  const handleConfirmPledgeReceipt = async (pledgeId, itemName) => {
    await confirmPledgeReceived(pledgeId);
    setReachedBanner(itemName);
    onRefresh();
    setTimeout(() => setReachedBanner(null), 3000);
  };

  const uniqueCampNeeds = (campNeeds || []).filter((n, idx, arr) => {
    return arr.findIndex((x) => String(x.id) === String(n.id)) === idx;
  });

  const fulfilledCount = uniqueCampNeeds.filter(
    (n) => n.status === "Fulfilled" || n.quantityFulfilled >= n.quantityNeeded
  ).length;

  return (
    <div className="space-y-3">
      {reachedBanner && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
          <PartyPopper className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Receipt confirmed for “{reachedBanner}”! Fulfilled count updated live across portals.</span>
        </div>
      )}

      {uniqueCampNeeds.length > 0 && (
        <div className="flex items-center justify-between pb-1">
          <p className="text-xs text-body-soft">
            {uniqueCampNeeds.length} requirement{uniqueCampNeeds.length === 1 ? "" : "s"} logged
          </p>
          {fulfilledCount > 0 && (
            <button
              onClick={handleClearFulfilled}
              className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-body-soft hover:bg-paper-dim"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t.clearFulfilled} ({fulfilledCount})</span>
            </button>
          )}
        </div>
      )}

      {uniqueCampNeeds.length === 0 ? (
        <div className="py-12 text-center text-body-soft">
          <AlertTriangle className="mx-auto h-8 w-8 text-body-soft opacity-40 mb-2" />
          <p className="text-xs font-medium">No open requirements posted for this camp yet.</p>
          <p className="mt-0.5 text-[11px] opacity-70">Use the form above to post urgent supplies needed.</p>
        </div>
      ) : (
        uniqueCampNeeds.map((n) => {
          const isDone = n.status === "Fulfilled" || n.quantityFulfilled >= n.quantityNeeded;
          const isEdit = editingId === n.id;
          const needPledges = pledges.filter((p) => p.needId === n.id);

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
                <div>
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
                        <p className="text-[10px] uppercase font-bold text-body-soft">{t.fulfilled}</p>
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
                  </div>

                  {/* Donor Pledges attached to this need */}
                  {needPledges.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-line/70">
                      <p className="text-[11px] font-bold text-body-soft uppercase tracking-wider mb-1.5">
                        Donor Pledges ({needPledges.length})
                      </p>
                      <div className="space-y-1.5">
                        {needPledges.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between gap-2 text-xs rounded-lg bg-paper/60 px-3 py-1.5"
                          >
                            <div>
                              <span className="font-semibold text-ink">{p.donorName}</span>
                              <span className="text-body-soft"> — pledged {p.quantity} units</span>
                              <span className="ml-2 font-mono-data text-[10px] text-body-soft">({p.status})</span>
                            </div>
                            {p.status !== "Received" && (
                              <button
                                onClick={() => handleConfirmPledgeReceipt(p.id, n.item)}
                                className="flex items-center gap-1 rounded-md bg-fulfilled px-2.5 py-1 text-[11px] font-bold text-white hover:bg-action-hover"
                              >
                                <Check className="h-3 w-3" />
                                <span>Mark Received</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
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

// Modal for Offline QR / SMS Need Posting (F11)
function QrSmsModal({ camp, onClose, lang }) {
  const t = I18N[lang];
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-body-soft hover:bg-paper-dim"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-action">
          <Smartphone className="h-5 w-5" />
          <h3 className="font-display text-base font-bold text-ink">{t.qrTitle}</h3>
        </div>
        <p className="text-xs text-body-soft mb-4">{t.qrDesc}</p>

        <div className="rounded-xl border border-line bg-paper/60 p-4 text-center">
          <div className="mx-auto mb-3 flex h-32 w-32 items-center justify-center rounded-xl bg-white p-2 shadow-xs border border-line">
            {/* Visual QR Pattern Simulation */}
            <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-slate-900 rounded-lg">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-xs ${
                    i % 2 === 0 || i % 7 === 0 ? "bg-white" : "bg-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs font-bold text-ink font-mono-data">CAMP ID: {camp?.id || "CAMP-104"}</p>
          <p className="text-[11px] text-body-soft">Scan to open low-bandwidth 2G web form</p>
        </div>

        <div className="mt-4 rounded-xl border border-line bg-paper p-3 text-xs">
          <p className="font-bold text-ink mb-1">Direct Toll-Free SMS Gateway:</p>
          <p className="font-mono-data text-[11px] text-action font-semibold">SMS to: +91 92205 92205</p>
          <div className="mt-2 rounded-lg bg-white p-2 font-mono-data text-[11px] text-body-soft border border-line/80">
            RELIEF NEED {camp?.id || "CAMP"} [ITEM] [QTY] [CRITICAL/HIGH]
          </div>
          <p className="mt-1 text-[10px] text-body-soft">
            Example: RELIEF NEED {camp?.id || "CAMP_1"} WATER_20L 150 CRITICAL
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-action py-2.5 text-xs font-semibold text-white hover:bg-action-hover"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function CampPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("relieflink_camp_auth") === "true"
  );
  const [lang, setLang] = useState("en"); // "en" | "hi"
  const t = I18N[lang];

  const [camps, setCamps] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedCampId, setSelectedCampId] = useState(null);
  const [isAddingCamp, setIsAddingCamp] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [pledges, setPledges] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAuthenticated = () => {
    sessionStorage.setItem("relieflink_camp_auth", "true");
    setIsAuthenticated(true);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [campList, branchList, pledgeList] = await Promise.all([
        getCamps(),
        getBranches(),
        getPublicPledges(),
      ]);
      setCamps(campList);
      setBranches(branchList);
      setPledges(pledgeList);
      if (campList.length > 0 && !selectedCampId) {
        setSelectedCampId(campList[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      return subscribeToChanges(loadData);
    }
  }, [isAuthenticated]);

  const selectedCamp = camps.find((c) => String(c.id) === String(selectedCampId));

  return (
    <div className="min-h-[calc(100vh-49px)] bg-paper p-3 sm:p-6 flex flex-col animate-fade-in">
      {/* Top Breadcrumb Bar */}
      <div className="mx-auto max-w-6xl w-full">
        <BreadcrumbBar
          backTo="/donor"
          backLabel="Relief Map"
          current="Camp Coordinator Portal"
          category="Field Operations"
          subtitle="Manage relief camp inventory, post urgent supply shortages, and confirm delivery of donor pledges."
          actions={
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => setShowQrModal(true)}
                  className="flex items-center gap-1 rounded-xl border border-line bg-white px-2.5 py-1 text-xs font-semibold text-body hover:bg-paper-dim"
                >
                  <QrCode className="h-3.5 w-3.5 text-action" />
                  <span className="hidden sm:inline">{t.qrSmsBtn}</span>
                </button>
              )}

              {/* Hindi / English Toggle */}
              <div className="flex rounded-xl border border-line bg-white p-0.5">
                <button
                  onClick={() => setLang("en")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    lang === "en" ? "bg-action text-white" : "text-body-soft hover:text-ink"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang("hi")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    lang === "hi" ? "bg-action text-white" : "text-body-soft hover:text-ink"
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>
          }
        />
      </div>

      {!isAuthenticated ? (
        <div className="flex-1 flex items-center justify-center">
          <PinGate onAuthenticated={handleAuthenticated} lang={lang} />
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
                  <h3 className="font-display text-xs font-bold text-ink uppercase tracking-wider">{t.campsSidebarTitle}</h3>
                  <p className="text-[11px] text-body-soft font-mono-data">{camps.length} {t.activeLocations}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingCamp(true)}
                className="flex items-center gap-1 rounded-xl bg-action px-2.5 py-1 text-xs font-semibold text-white hover:bg-action-hover"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t.newCampBtn}</span>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[70vh] lg:max-h-none">
              {camps.map((camp) => {
                const isSelected = String(camp.id) === String(selectedCampId);
                const isVer = camp.verification === "verified";

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
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                            isVer
                              ? "bg-fulfilled-soft text-fulfilled"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isVer ? "Verified" : "Pending"}
                        </span>
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
                <h2 className="font-display text-lg font-bold text-ink">{t.registerCampTitle}</h2>
                <p className="mt-1 text-xs text-body-soft mb-5">{t.registerCampDesc}</p>
                <CampForm
                  onCancel={() => setIsAddingCamp(false)}
                  onSuccess={(newCamp) => {
                    setSelectedCampId(newCamp.id);
                    setIsAddingCamp(false);
                    loadData();
                  }}
                  lang={lang}
                  branches={branches}
                />
              </div>
            ) : selectedCamp ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-0.5 text-xs font-semibold text-action border border-line">
                        <MapPin className="h-3 w-3" />
                        {selectedCamp.district}, {selectedCamp.state}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          selectedCamp.verification === "verified"
                            ? "bg-fulfilled-soft text-fulfilled border border-fulfilled/30"
                            : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}
                      >
                        {selectedCamp.verification === "verified" ? (
                          <ShieldCheck className="h-3 w-3" />
                        ) : (
                          <ShieldAlert className="h-3 w-3" />
                        )}
                        <span>{selectedCamp.verification === "verified" ? t.verifiedBadge : t.pendingBadge}</span>
                      </span>
                    </div>
                    <h2 className="font-display text-xl font-bold text-ink mt-1.5">{selectedCamp.name}</h2>
                    <p className="text-xs text-body-soft mt-0.5">
                      Affiliated: <strong className="text-ink">{selectedCamp.branchName}</strong> · Capacity:{" "}
                      <strong>{selectedCamp.capacity} persons</strong>
                    </p>
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
                    {t.postNeedTitle}
                  </h3>
                  <NeedForm campId={selectedCamp.id} onNeedAdded={loadData} lang={lang} />
                </div>

                <div className="border-t border-line pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-body-soft mb-3">
                    {t.inventoryTitle}
                  </h3>
                  <CoordinatorNeedsList
                    campId={selectedCamp.id}
                    campNeeds={selectedCamp.needs || []}
                    onRefresh={loadData}
                    lang={lang}
                    pledges={pledges}
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

      {showQrModal && (
        <QrSmsModal camp={selectedCamp} onClose={() => setShowQrModal(false)} lang={lang} />
      )}
    </div>
  );
}
