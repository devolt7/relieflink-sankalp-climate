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

function mapCampFromDb(c) {
  return {
    id: c.id,
    name: c.name,
    district: c.district,
    state: c.state,
    lat: c.lat,
    lng: c.lng,
    phone: c.contact_phone,
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

// Subscribe once to live changes on needs/claims and notify all listeners
// (components) so their data refetches automatically. Matches the realtime
// config from Part 9 (needs + claims are both in the supabase_realtime
// publication).
supabase
  .channel("needs-and-claims-changes")
  .on("postgres_changes", { event: "*", schema: "public", table: "needs" }, notify)
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
  return data.map((c) => ({
    ...mapCampFromDb(c),
    needs: (c.needs || []).map(mapNeedFromDb),
  }));
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
  const camps = await getCampsWithNeeds();
  const needs = camps.flatMap((camp) => camp.needs.map((need) => ({ ...need, district: camp.district })));
  const byUrgency = { Critical: 0, High: 0, Moderate: 0 };
  const byDistrict = {};
  let quantityNeeded = 0;
  let quantityFulfilled = 0;
  needs.forEach((need) => {
    quantityNeeded += Number(need.quantityNeeded) || 0;
    quantityFulfilled += Number(need.quantityFulfilled) || 0;
    if (need.status !== "Fulfilled") byUrgency[need.urgency] = (byUrgency[need.urgency] || 0) + 1;
    if (need.district) byDistrict[need.district] = (byDistrict[need.district] || 0) + 1;
  });

  return {
    totalCamps: camps.length,
    totalNeeds: needs.length,
    openNeeds: needs.filter((need) => need.status !== "Fulfilled").length,
    fulfilledPct: quantityNeeded ? Math.round((quantityFulfilled / quantityNeeded) * 100) : 0,
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
