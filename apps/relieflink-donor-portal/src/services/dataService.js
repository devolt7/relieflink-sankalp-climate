// ============================================================================
// DATA SERVICE — the single seam between UI and backend.
//
// Every component in this app calls the functions below.
// Supports both live Supabase connection (if configured) and an in-memory
// reactive store with full mock data so the app runs immediately out of the box.
// ============================================================================

import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { mockCamps, mockNeeds, mockClaims } from "../data/mockData";

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

function mapVerificationFromDb(c) {
  const v = String(c.verification_status ?? c.status ?? "verified").toLowerCase();
  return v === "pending" || v === "rejected" ? v : "verified";
}

function mapCampFromDb(c) {
  return {
    id: String(c.id),
    name: c.name,
    district: c.district,
    state: c.state || c.district,
    lat: Number(c.lat),
    lng: Number(c.lng),
    phone: c.contact_phone || c.phone,
    verification: mapVerificationFromDb(c),
    createdAt: c.created_at || c.createdAt || new Date().toISOString(),
  };
}

function mapNeedFromDb(n) {
  return {
    id: String(n.id),
    campId: String(n.camp_id || n.campId),
    item: n.item,
    quantityNeeded: Number(n.quantity_needed ?? n.quantityNeeded),
    quantityFulfilled: Number(n.quantity_fulfilled ?? n.quantityFulfilled ?? 0),
    urgency: capitalize(n.urgency),
    status: typeof n.status === "string" && (n.status.includes("_") || n.status === n.status.toLowerCase()) ? mapStatusFromDb(n.status) : n.status || "Open",
    createdAt: n.created_at || n.createdAt || new Date().toISOString(),
    updatedAt: n.updated_at || n.updatedAt || new Date().toISOString(),
  };
}

const PLEDGE_STATUS = {
  pledged: "Pledged",
  dispatched: "Dispatched",
  received: "Received",
  cancelled: "Cancelled",
};

function mapPledgeFromDb(p) {
  return {
    id: String(p.id),
    needId: String(p.need_id || p.needId),
    donorName: p.donor_name || p.donorName,
    quantity: Number(p.quantity),
    note: p.note ?? null,
    status: PLEDGE_STATUS[p.status?.toLowerCase()] ?? p.status ?? "Pledged",
    createdAt: p.created_at || p.createdAt || new Date().toISOString(),
    dispatchedAt: p.dispatched_at || p.dispatchedAt || null,
    receivedAt: p.received_at || p.receivedAt || null,
    item: p.item,
    campId: String(p.camp_id || p.campId || ""),
    campName: p.camp_name || p.campName || "",
    district: p.district || "",
    campPhone: p.camp_phone || p.campPhone || "",
  };
}

// ---------------------------------------------------------------------------
// IN-MEMORY REACTIVE DATA STORE (Fallback / Offline / Demo)
// ---------------------------------------------------------------------------

let inMemoryCamps = mockCamps.map((c) => ({
  id: String(c.id),
  name: c.name,
  district: c.district,
  state: c.state || (c.district === "Assam" ? "Assam" : c.district === "Gujarat" ? "Gujarat" : c.district === "Rajasthan" ? "Rajasthan" : "Maharashtra"),
  lat: c.lat,
  lng: c.lng,
  contact_phone: c.phone,
  verification_status: "verified",
  created_at: c.createdAt || new Date().toISOString(),
}));

let inMemoryNeeds = mockNeeds.map((n) => ({
  id: String(n.id),
  camp_id: String(n.campId),
  item: n.item,
  quantity_needed: n.quantityNeeded,
  quantity_fulfilled: n.quantityFulfilled || 0,
  urgency: n.urgency.toLowerCase(),
  status: n.status === "Partially Fulfilled" ? "partially_fulfilled" : n.status === "Fulfilled" ? "fulfilled" : "open",
  archived: false,
  created_at: n.createdAt || new Date().toISOString(),
  updated_at: n.updatedAt || new Date().toISOString(),
}));

let inMemoryClaims = [...mockClaims];

let inMemoryPledges = [
  {
    id: "pledge_1",
    need_id: "need_1",
    donor_name: "Rahul Verma",
    donor_contact: "+91 98765 43210",
    quantity: 30,
    note: "Packed and ready for dispatch from Guwahati center.",
    status: "dispatched",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    dispatched_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    received_at: null,
  },
  {
    id: "pledge_2",
    need_id: "need_2",
    donor_name: "Ananya Sen",
    donor_contact: "ananya@example.org",
    quantity: 50,
    note: "Water bottles and filtration tablets delivered.",
    status: "received",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    dispatched_at: new Date(Date.now() - 43200000).toISOString(),
    received_at: new Date(Date.now() - 10000000).toISOString(),
  },
  {
    id: "pledge_3",
    need_id: "need_4",
    donor_name: "Karan Patel",
    donor_contact: "+91 99887 76655",
    quantity: 40,
    note: "Emergency ration packs pledged.",
    status: "pledged",
    created_at: new Date(Date.now() - 1800000).toISOString(),
    dispatched_at: null,
    received_at: null,
  },
];

// --- pub/sub for real-time state change propagation ------------------------
const listeners = new Set();
function notify() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      console.error("Listener error:", err);
    }
  });
}

export function subscribeToChanges(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

const alertListeners = new Set();
export function subscribeToNeedAlerts(callback) {
  alertListeners.add(callback);
  return () => alertListeners.delete(callback);
}

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

// Subscribe to Supabase realtime if active
if (isSupabaseConfigured) {
  try {
    supabase
      .channel("needs-and-claims-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "needs" }, handleNeedEvent)
      .on("postgres_changes", { event: "*", schema: "public", table: "claims" }, notify)
      .subscribe();
  } catch (err) {
    console.warn("Could not subscribe to Supabase channel:", err);
  }
}

// ---------------------------------------------------------------------------
// READS
// ---------------------------------------------------------------------------

export async function getCamps() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from("camps").select("*").order("created_at", { ascending: false });
      if (!error && data) return data.map(mapCampFromDb);
    } catch (err) {
      console.warn("Supabase getCamps failed, using in-memory store:", err);
    }
  }
  return inMemoryCamps.map(mapCampFromDb);
}

export async function getNeeds() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from("needs").select("*").eq("archived", false);
      if (!error && data) return data.map(mapNeedFromDb);
    } catch (err) {
      console.warn("Supabase getNeeds failed, using in-memory store:", err);
    }
  }
  return inMemoryNeeds.filter((n) => !n.archived).map(mapNeedFromDb);
}

export async function getCampsWithNeeds() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from("camps").select("*, needs(*)").eq("needs.archived", false);
      if (!error && data) {
        const camps = data.map((c) => ({
          ...mapCampFromDb(c),
          needs: (c.needs || []).map(mapNeedFromDb),
        }));
        rememberUrgencies(camps.flatMap((c) => c.needs));
        return camps;
      }
    } catch (err) {
      console.warn("Supabase getCampsWithNeeds failed, using in-memory store:", err);
    }
  }

  // Fallback to in-memory camps joined with active needs
  const camps = inMemoryCamps.map((c) => {
    const activeNeeds = inMemoryNeeds
      .filter((n) => String(n.camp_id) === String(c.id) && !n.archived)
      .map(mapNeedFromDb);
    return {
      ...mapCampFromDb(c),
      needs: activeNeeds,
    };
  });

  rememberUrgencies(camps.flatMap((c) => c.needs));
  return camps;
}

export async function getCampBrief(campId) {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.from("camps").select("id, name, district").eq("id", campId).maybeSingle();
      if (data) return { id: data.id, name: data.name, district: data.district };
    } catch {
      // fallback
    }
  }
  const found = inMemoryCamps.find((c) => String(c.id) === String(campId));
  return found ? { id: found.id, name: found.name, district: found.district } : null;
}

export async function getFilteredNeeds({ district = "all", item = "all", urgency = "all" } = {}) {
  const camps = await getCampsWithNeeds();
  const allNeeds = camps.flatMap((camp) =>
    camp.needs.map((n) => ({
      ...n,
      camp,
    }))
  );

  return allNeeds.filter((n) => {
    if (n.status === "Fulfilled") return false;
    if (district !== "all" && (!n.camp || n.camp.district !== district)) return false;
    if (item !== "all" && n.item !== item) return false;
    if (urgency !== "all" && n.urgency !== urgency) return false;
    return true;
  });
}

export async function getDashboardStats() {
  if (isSupabaseConfigured) {
    try {
      const [{ data: summary }, { data: urgencyRows }, { data: districtRows }] = await Promise.all([
        supabase.from("dashboard_summary").select("*").single(),
        supabase.from("dashboard_urgency_breakdown").select("*"),
        supabase.from("dashboard_district_breakdown").select("*"),
      ]);

      if (summary && urgencyRows && districtRows) {
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
    } catch (err) {
      console.warn("Supabase dashboard stats failed, computing from memory:", err);
    }
  }

  // In-memory calculation
  const camps = inMemoryCamps;
  const activeNeeds = inMemoryNeeds.filter((n) => !n.archived);
  const openNeedsList = activeNeeds.filter((n) => n.status !== "fulfilled");

  let totalQtyNeeded = 0;
  let totalQtyFulfilled = 0;
  activeNeeds.forEach((n) => {
    totalQtyNeeded += Number(n.quantity_needed || 0);
    totalQtyFulfilled += Number(n.quantity_fulfilled || 0);
  });

  const fulfilledPct = totalQtyNeeded > 0 ? Math.min(100, Math.round((totalQtyFulfilled / totalQtyNeeded) * 100)) : 0;

  const byUrgency = { Critical: 0, High: 0, Moderate: 0 };
  openNeedsList.forEach((n) => {
    const key = capitalize(n.urgency);
    if (byUrgency[key] !== undefined) {
      byUrgency[key]++;
    } else {
      byUrgency.Moderate++;
    }
  });

  const byDistrict = {};
  activeNeeds.forEach((n) => {
    const camp = camps.find((c) => String(c.id) === String(n.camp_id));
    const dist = camp?.district || "Other";
    byDistrict[dist] = (byDistrict[dist] || 0) + 1;
  });

  return {
    totalCamps: camps.length,
    totalNeeds: activeNeeds.length,
    openNeeds: openNeedsList.length,
    fulfilledPct,
    byUrgency,
    byDistrict,
  };
}

// ---------------------------------------------------------------------------
// WRITES & MUTATIONS
// ---------------------------------------------------------------------------

export async function submitClaim({ needId, donorName, donorContact, quantityClaimed }) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc("process_claim", {
        p_need_id: needId,
        p_donor_name: donorName,
        p_donor_contact: donorContact,
        p_quantity_claimed: quantityClaimed,
      });
      if (!error && data?.success) {
        notify();
        return data;
      }
    } catch {
      // fallback to memory
    }
  }

  // In-memory claim processing
  const need = inMemoryNeeds.find((n) => String(n.id) === String(needId));
  if (!need) throw new Error("Need not found");

  const qty = Number(quantityClaimed);
  need.quantity_fulfilled = (need.quantity_fulfilled || 0) + qty;
  if (need.quantity_fulfilled >= need.quantity_needed) {
    need.status = "fulfilled";
  } else {
    need.status = "partially_fulfilled";
  }
  need.updated_at = new Date().toISOString();

  inMemoryClaims.push({
    id: `claim_${Date.now()}`,
    needId: String(needId),
    donorName,
    donorContact,
    quantityClaimed: qty,
    claimedAt: new Date().toISOString(),
  });

  notify();
  return { success: true, message: "Claim recorded successfully" };
}

export async function getPublicPledges() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc("get_public_pledges");
      if (!error && data) return data.map(mapPledgeFromDb);
    } catch {
      // fallback
    }
  }

  return inMemoryPledges.map((p) => {
    const need = inMemoryNeeds.find((n) => String(n.id) === String(p.need_id));
    const camp = need ? inMemoryCamps.find((c) => String(c.id) === String(need.camp_id)) : null;
    return mapPledgeFromDb({
      ...p,
      item: need?.item || "Essential Item",
      camp_id: camp?.id,
      camp_name: camp?.name,
      district: camp?.district,
      camp_phone: camp?.contact_phone,
    });
  });
}

export async function getMyPledges(contact) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc("get_my_pledges", { p_contact: contact });
      if (!error && data) return data.map(mapPledgeFromDb);
    } catch {
      // fallback
    }
  }

  const normalized = contact?.trim()?.toLowerCase();
  const matched = inMemoryPledges.filter(
    (p) => !normalized || p.donor_contact?.toLowerCase() === normalized || p.donor_name?.toLowerCase() === normalized
  );

  return matched.map((p) => {
    const need = inMemoryNeeds.find((n) => String(n.id) === String(p.need_id));
    const camp = need ? inMemoryCamps.find((c) => String(c.id) === String(need.camp_id)) : null;
    return mapPledgeFromDb({
      ...p,
      item: need?.item || "Emergency Supplies",
      camp_id: camp?.id,
      camp_name: camp?.name || "Relief Center",
      district: camp?.district || "Area",
      camp_phone: camp?.contact_phone || "+91 98000 00000",
    });
  });
}

export async function createPledge({ needId, donorName, donorContact, quantity, note }) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc("create_pledge", {
        p_need_id: String(needId),
        p_donor_name: donorName,
        p_donor_contact: donorContact,
        p_quantity: quantity,
        p_note: note || null,
      });
      if (!error && data?.success !== false) {
        notify();
        return data;
      }
    } catch {
      // fallback
    }
  }

  const need = inMemoryNeeds.find((n) => String(n.id) === String(needId));
  if (!need) throw new Error("Need item not found");

  const qty = Number(quantity);
  const newPledge = {
    id: `pledge_${Date.now()}`,
    need_id: String(needId),
    donor_name: donorName,
    donor_contact: donorContact,
    quantity: qty,
    note: note || null,
    status: "pledged",
    created_at: new Date().toISOString(),
    dispatched_at: null,
    received_at: null,
  };

  inMemoryPledges.unshift(newPledge);

  // Update need state
  need.quantity_fulfilled = (need.quantity_fulfilled || 0) + qty;
  if (need.quantity_fulfilled >= need.quantity_needed) {
    need.status = "fulfilled";
  } else {
    need.status = "partially_fulfilled";
  }
  need.updated_at = new Date().toISOString();

  notify();
  return { success: true, pledgeId: newPledge.id };
}

export async function markPledgeDispatched(pledgeId, contact) {
  if (isSupabaseConfigured) {
    try {
      await supabase.rpc("mark_pledge_dispatched", { p_pledge_id: pledgeId, p_contact: contact });
      notify();
      return;
    } catch {
      // fallback
    }
  }

  const pledge = inMemoryPledges.find((p) => String(p.id) === String(pledgeId));
  if (pledge) {
    pledge.status = "dispatched";
    pledge.dispatched_at = new Date().toISOString();
    notify();
  }
}

export async function cancelPledge(pledgeId, contact) {
  if (isSupabaseConfigured) {
    try {
      await supabase.rpc("cancel_pledge", { p_pledge_id: pledgeId, p_contact: contact });
      notify();
      return;
    } catch {
      // fallback
    }
  }

  const pledge = inMemoryPledges.find((p) => String(p.id) === String(pledgeId));
  if (pledge && pledge.status !== "cancelled") {
    pledge.status = "cancelled";
    const need = inMemoryNeeds.find((n) => String(n.id) === String(pledge.need_id));
    if (need) {
      need.quantity_fulfilled = Math.max(0, (need.quantity_fulfilled || 0) - pledge.quantity);
      if (need.quantity_fulfilled === 0) {
        need.status = "open";
      } else if (need.quantity_fulfilled < need.quantity_needed) {
        need.status = "partially_fulfilled";
      }
    }
    notify();
  }
}

export async function confirmPledgeReceived(pledgeId) {
  if (isSupabaseConfigured) {
    try {
      await supabase.rpc("confirm_pledge_received", { p_pledge_id: pledgeId });
      notify();
      return;
    } catch {
      // fallback
    }
  }

  const pledge = inMemoryPledges.find((p) => String(p.id) === String(pledgeId));
  if (pledge) {
    pledge.status = "received";
    pledge.received_at = new Date().toISOString();
    notify();
  }
}

// ---------------------------------------------------------------------------
// COORDINATOR ACTIONS (Camp creation, Need posting, Archiving)
// ---------------------------------------------------------------------------

export async function createCamp(campData) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from("camps").insert(campData).select();
      if (!error && data?.[0]) {
        notify();
        return mapCampFromDb(data[0]);
      }
    } catch {
      // fallback
    }
  }

  const newCamp = {
    id: `camp_${Date.now()}`,
    name: campData.name,
    district: campData.district,
    state: campData.state || campData.district,
    lat: Number(campData.lat),
    lng: Number(campData.lng),
    contact_phone: campData.contact_phone || campData.phone,
    verification_status: "verified",
    created_at: new Date().toISOString(),
  };

  inMemoryCamps.unshift(newCamp);
  notify();
  return mapCampFromDb(newCamp);
}

export async function createNeed(needData) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from("needs").insert(needData).select();
      if (!error && data?.[0]) {
        notify();
        return mapNeedFromDb(data[0]);
      }
    } catch {
      // fallback
    }
  }

  const urgencyVal = (needData.urgency || "high").toLowerCase();
  const newNeed = {
    id: `need_${Date.now()}`,
    camp_id: String(needData.camp_id || needData.campId),
    item: needData.item,
    quantity_needed: Number(needData.quantity_needed || needData.quantityNeeded),
    quantity_fulfilled: 0,
    urgency: urgencyVal,
    status: "open",
    archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  inMemoryNeeds.unshift(newNeed);
  notify();

  // If critical, trigger alert listeners
  if (urgencyVal === "critical") {
    alertListeners.forEach((cb) => cb(mapNeedFromDb(newNeed)));
  }

  return mapNeedFromDb(newNeed);
}

export async function updateNeedItem(needId, updates) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from("needs").update(updates).eq("id", needId).select();
      if (!error && data?.[0]) {
        notify();
        return mapNeedFromDb(data[0]);
      }
    } catch {
      // fallback
    }
  }

  const need = inMemoryNeeds.find((n) => String(n.id) === String(needId));
  if (need) {
    if (updates.item !== undefined) need.item = updates.item;
    if (updates.quantity_needed !== undefined) need.quantity_needed = Number(updates.quantity_needed);
    if (updates.urgency !== undefined) need.urgency = updates.urgency.toLowerCase();
    need.updated_at = new Date().toISOString();
    notify();
    return mapNeedFromDb(need);
  }
}

export async function archiveNeedItem(needId) {
  if (isSupabaseConfigured) {
    try {
      await supabase.from("needs").update({ archived: true }).eq("id", needId);
      notify();
      return;
    } catch {
      // fallback
    }
  }

  const need = inMemoryNeeds.find((n) => String(n.id) === String(needId));
  if (need) {
    need.archived = true;
    notify();
  }
}

export async function clearFulfilledNeeds(campId) {
  if (isSupabaseConfigured) {
    try {
      const fulfilled = inMemoryNeeds.filter(
        (n) => String(n.camp_id) === String(campId) && (n.status === "fulfilled" || n.quantity_fulfilled >= n.quantity_needed)
      );
      const ids = fulfilled.map((n) => n.id);
      if (ids.length > 0) {
        await supabase.from("needs").update({ archived: true }).in("id", ids);
      }
      notify();
      return;
    } catch {
      // fallback
    }
  }

  inMemoryNeeds.forEach((n) => {
    if (String(n.camp_id) === String(campId) && (n.status === "fulfilled" || n.quantity_fulfilled >= n.quantity_needed)) {
      n.archived = true;
    }
  });
  notify();
}
