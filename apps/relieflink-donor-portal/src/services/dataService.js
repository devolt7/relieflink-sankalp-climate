// ============================================================================
// DATA SERVICE — the single seam between UI and backend.
//
// Every component in this app calls the functions below. This file talks to
// the real Supabase project and translates between:
//   - the database's snake_case fields (camp_id, quantity_needed, ...)
//     and the UI's camelCase fields (campId, quantityNeeded, ...)
//   - the database's lowercase enum values (critical, open, ...)
//     and the UI's Title Case values (Critical, Open, ...)
// so that every existing component (built against the mock data shape)
// keeps working unchanged.
// ============================================================================

import { supabase } from "../lib/supabaseClient";

// --- value translation helpers ---------------------------------------------

function capitalize(word) {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function mapStatusFromDb(status) {
  if (status === "partially_fulfilled") return "Partially Fulfilled";
  if (status === "fulfilled") return "Fulfilled";
  return "Open";
}

// Person 1 adds a camp verification column (pending / verified / rejected).
// Until it exists in the database, camps are treated as verified so nothing
// is wrongly flagged.
function mapVerificationFromDb(c) {
  const v = String(c.verification_status ?? c.status ?? "verified").toLowerCase();
  return v === "pending" || v === "rejected" ? v : "verified";
}

function mapCampFromDb(c) {
  return {
    id: c.id,
    name: c.name,
    district: c.district,
    state: c.state,
    lat: c.lat,
    lng: c.lng,
    phone: c.contact_phone,
    verification: mapVerificationFromDb(c),
    createdAt: c.created_at,
  };
}

function mapNeedFromDb(n) {
  return {
    id: n.id,
    campId: n.camp_id,
    item: n.item,
    quantityNeeded: n.quantity_needed,
    quantityFulfilled: n.quantity_fulfilled,
    urgency: capitalize(n.urgency),
    status: mapStatusFromDb(n.status),
    createdAt: n.created_at,
    updatedAt: n.updated_at,
  };
}

// --- pub/sub so components can "subscribe" the same way they would to a
// realtime channel. Real Supabase realtime events (below) call notify(). ---
const listeners = new Set();
function notify() {
  listeners.forEach((cb) => cb());
}
export function subscribeToChanges(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Need-alert listeners: fired when a NEW critical need appears, or an existing
// need is escalated to critical. Used for the donor-side alert banner (F9).
const alertListeners = new Set();
export function subscribeToNeedAlerts(callback) {
  alertListeners.add(callback);
  return () => alertListeners.delete(callback);
}

// Last urgency we saw per need, so an UPDATE can be told apart from a real escalation.
const knownUrgency = new Map();
function rememberUrgencies(needs) {
  needs.forEach((n) => knownUrgency.set(String(n.id), n.urgency));
}

function handleNeedEvent(payload) {
  notify();
  const row = payload.new;
  if (!row || row.archived) return;
  const urgency = capitalize(row.urgency);
  const id = String(row.id);
  const before = knownUrgency.get(id);
  knownUrgency.set(id, urgency);
  const isNew = payload.eventType === "INSERT";
  const escalated = payload.eventType === "UPDATE" && before && before !== "Critical";
  if (urgency === "Critical" && row.status !== "fulfilled" && (isNew || escalated)) {
    alertListeners.forEach((cb) => cb(mapNeedFromDb(row)));
  }
}

// Subscribe once to live changes on needs/claims and notify all listeners
// (components) so their data refetches automatically. The pledge functions
// "touch" needs.updated_at, so pledge activity also arrives as a needs event.
supabase
  .channel("needs-and-claims-changes")
  .on("postgres_changes", { event: "*", schema: "public", table: "needs" }, handleNeedEvent)
  .on("postgres_changes", { event: "*", schema: "public", table: "claims" }, notify)
  .subscribe();

// ---------------------------------------------------------------------------
// READS
// ---------------------------------------------------------------------------

export async function getCamps() {
  const { data, error } = await supabase.from("camps").select("*");
  if (error) throw error;
  return data.map(mapCampFromDb);
}

export async function getNeeds() {
  const { data, error } = await supabase.from("needs").select("*").eq("archived", false);
  if (error) throw error;
  return data.map(mapNeedFromDb);
}

// Camps joined with their needs — the shape the map and list views need.
// Archived needs (soft-deleted by a coordinator) are filtered out of the
// nested needs array but camps still come through even with 0 open needs.
export async function getCampsWithNeeds() {
  const { data, error } = await supabase.from("camps").select("*, needs(*)").eq("needs.archived", false);
  if (error) throw error;
  const camps = data.map((c) => ({
    ...mapCampFromDb(c),
    needs: (c.needs || []).map(mapNeedFromDb),
  }));
  rememberUrgencies(camps.flatMap((c) => c.needs));
  return camps;
}

// Name + district of one camp, for alert text.
export async function getCampBrief(campId) {
  const { data } = await supabase.from("camps").select("id, name, district").eq("id", campId).maybeSingle();
  return data ? { id: data.id, name: data.name, district: data.district } : null;
}

// Filter needs with optional filters (district, item, urgency). Returns needs
// with their camp data joined. Only returns open/partially fulfilled needs.
export async function getFilteredNeeds({ district = "all", item = "all", urgency = "all" } = {}) {
  const { data, error } = await supabase.from("needs").select("*, camps(*)").eq("archived", false);
  if (error) throw error;

  return data
    .map((n) => ({
      ...mapNeedFromDb(n),
      camp: n.camps ? mapCampFromDb(n.camps) : undefined,
    }))
    .filter((n) => {
      if (n.status === "Fulfilled") return false;
      if (district !== "all" && (!n.camp || n.camp.district !== district)) return false;
      if (item !== "all" && n.item !== item) return false;
      if (urgency !== "all" && n.urgency !== urgency) return false;
      return true;
    });
}

export async function getDashboardStats() {
  const [{ data: summary, error: summaryError }, { data: urgencyRows, error: urgencyError }, { data: districtRows, error: districtError }] =
    await Promise.all([
      supabase.from("dashboard_summary").select("*").single(),
      supabase.from("dashboard_urgency_breakdown").select("*"),
      supabase.from("dashboard_district_breakdown").select("*"),
    ]);

  if (summaryError) throw summaryError;
  if (urgencyError) throw urgencyError;
  if (districtError) throw districtError;

  const byUrgency = { Critical: 0, High: 0, Moderate: 0 };
  urgencyRows.forEach((row) => {
    const key = capitalize(row.urgency);
    byUrgency[key] = (row.open_count || 0) + (row.partial_count || 0);
  });

  const byDistrict = {};
  districtRows.forEach((row) => {
    byDistrict[row.district] = row.total_needs;
  });

  return {
    totalCamps: summary.total_camps,
    totalNeeds: summary.total_needs,
    openNeeds: summary.open_needs + summary.partially_fulfilled_needs,
    fulfilledPct: Math.round(summary.overall_fulfillment_percent || 0),
    byUrgency,
    byDistrict,
  };
}

// ---------------------------------------------------------------------------
// WRITES
// ---------------------------------------------------------------------------

// Donor submits a claim from the Claim Modal. Always goes through Person 2's
// process_claim function — never inserts into claims directly — so
// validation, over-claim protection, duplicate protection, and status
// derivation all happen correctly on the backend.
export async function submitClaim({ needId, donorName, donorContact, quantityClaimed }) {
  const { data, error } = await supabase.rpc("process_claim", {
    p_need_id: needId,
    p_donor_name: donorName,
    p_donor_contact: donorContact,
    p_quantity_claimed: quantityClaimed,
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error || "Claim was rejected");

  notify();
  return data;
}


// ---------------------------------------------------------------------------
// PLEDGES (F3) — Pledged -> Dispatched -> Received
// All of these call the SECURITY DEFINER functions in supabase/pledge_flow.sql.
// ---------------------------------------------------------------------------

const PLEDGE_STATUS = {
  pledged: "Pledged",
  dispatched: "Dispatched",
  received: "Received",
  cancelled: "Cancelled",
};

function mapPledgeFromDb(p) {
  return {
    id: p.id,
    needId: p.need_id,
    donorName: p.donor_name,
    quantity: p.quantity,
    note: p.note ?? null,
    status: PLEDGE_STATUS[p.status] ?? "Pledged",
    createdAt: p.created_at,
    dispatchedAt: p.dispatched_at,
    receivedAt: p.received_at,
    // only present on "my pledges"
    item: p.item,
    campId: p.camp_id,
    campName: p.camp_name,
    district: p.district,
    campPhone: p.camp_phone,
  };
}

// Turn "function does not exist" into something a teammate can act on.
function friendlyRpcError(error) {
  if (error?.code === "PGRST202" || error?.code === "42883") {
    return new Error("Pledge backend isn't set up yet — run supabase/pledge_flow.sql in the Supabase SQL editor.");
  }
  return error;
}

async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw friendlyRpcError(error);
  if (data && data.success === false) throw new Error(data.error || "Request was rejected");
  return data;
}

// Public donation history for every need (donor names + quantities, never contacts).
export async function getPublicPledges() {
  const data = await rpc("get_public_pledges");
  return (data || []).map(mapPledgeFromDb);
}

export async function getMyPledges(contact) {
  const data = await rpc("get_my_pledges", { p_contact: contact });
  return (data || []).map(mapPledgeFromDb);
}

export async function createPledge({ needId, donorName, donorContact, quantity, note }) {
  const data = await rpc("create_pledge", {
    p_need_id: String(needId),
    p_donor_name: donorName,
    p_donor_contact: donorContact,
    p_quantity: quantity,
    p_note: note || null,
  });
  notify();
  return data;
}

export async function markPledgeDispatched(pledgeId, contact) {
  await rpc("mark_pledge_dispatched", { p_pledge_id: pledgeId, p_contact: contact });
  notify();
}

export async function cancelPledge(pledgeId, contact) {
  await rpc("cancel_pledge", { p_pledge_id: pledgeId, p_contact: contact });
  notify();
}

// Camp-side action. The Camp Portal's "Mark Received" button calls this; the
// donor portal only uses it for the ?demo=1 simulation button.
export async function confirmPledgeReceived(pledgeId) {
  await rpc("confirm_pledge_received", { p_pledge_id: pledgeId });
  notify();
}
