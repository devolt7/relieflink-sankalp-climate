import { getCampsWithNeeds } from "./dataService";
import { mockCamps, mockNeeds } from "../data/mockData";

const demoCamps = mockCamps.map((camp) => ({
  ...camp,
  state: camp.state || (camp.district === "Assam" ? "Assam" : camp.district),
  needs: mockNeeds.filter((need) => need.campId === camp.id),
}));

export async function loadInsightCamps() {
  try {
    return { camps: await getCampsWithNeeds(), source: "live", error: null };
  } catch (error) {
    return { camps: demoCamps, source: "sample", error };
  }
}

export function summarizeImpact(camps) {
  const needs = camps.flatMap((camp) => (camp.needs || []).map((need) => ({ ...need, district: camp.district })));
  const fulfilled = needs.filter((need) => need.status === "Fulfilled" || need.quantityFulfilled >= need.quantityNeeded);
  const times = fulfilled.map((need) => {
    const start = new Date(need.createdAt).getTime();
    const end = new Date(need.updatedAt).getTime();
    return Number.isFinite(start) && Number.isFinite(end) && end >= start ? (end - start) / 3600000 : null;
  }).filter(Number.isFinite);
  const byDistrict = new Map();

  needs.forEach((need) => {
    const district = need.district || "Unknown";
    const current = byDistrict.get(district) || { district, needs: 0, fulfilled: 0 };
    current.needs += 1;
    if (need.status === "Fulfilled" || need.quantityFulfilled >= need.quantityNeeded) current.fulfilled += 1;
    byDistrict.set(district, current);
  });

  return {
    totalCamps: camps.length,
    totalNeeds: needs.length,
    fulfilledNeeds: fulfilled.length,
    fulfilledPct: needs.length ? Math.round((fulfilled.length / needs.length) * 100) : 0,
    avgHours: times.length ? times.reduce((sum, hours) => sum + hours, 0) / times.length : null,
    districtCount: new Set(camps.map((camp) => camp.district).filter(Boolean)).size,
    // Estimate only: pilot planning proxy, not a count of registered households.
    familiesEstimate: fulfilled.length * 25,
    byDistrict: [...byDistrict.values()].sort((a, b) => b.needs - a.needs),
  };
}

export const BRANCHES = [
  { id: "sivasagar", name: "Sivasagar Branch", district: "Sivasagar", state: "Assam", areas: ["Sivasagar", "Charaideo"] },
  { id: "dibrugarh", name: "Dibrugarh Branch", district: "Dibrugarh", state: "Assam", areas: ["Dibrugarh", "Tinsukia"] },
  { id: "guwahati", name: "Guwahati Branch", district: "Kamrup Metropolitan", state: "Assam", areas: ["Guwahati", "Kamrup", "Barpeta"] },
  { id: "patna", name: "Patna Branch", district: "Patna", state: "Bihar", areas: ["Patna", "Nalanda", "Vaishali"] },
];

// Clearly fictional pilot records for demonstrating a possible recovery workflow.
export const SAMPLE_BORROWERS = [
  { id: "B-1042", name: "Ananya Das", district: "Sivasagar", exposure: "Small farm", loan: "₹42,000", signal: "Crop access disrupted" },
  { id: "B-1088", name: "Rahul Gogoi", district: "Sivasagar", exposure: "Small business", loan: "₹68,000", signal: "Market closed" },
  { id: "B-1104", name: "Mina Hazarika", district: "Charaideo", exposure: "Small farm", loan: "₹35,000", signal: "Field inundation reported" },
  { id: "B-1129", name: "Jatin Saikia", district: "Dibrugarh", exposure: "Small business", loan: "₹55,000", signal: "Transport disruption" },
  { id: "B-1172", name: "Rupa Bora", district: "Tinsukia", exposure: "Small farm", loan: "₹47,000", signal: "Field access disrupted" },
  { id: "B-2011", name: "Suman Kumar", district: "Patna", exposure: "Small business", loan: "₹62,000", signal: "Local flooding reported" },
  { id: "B-2045", name: "Pooja Devi", district: "Vaishali", exposure: "Small farm", loan: "₹39,000", signal: "Crop access disrupted" },
  { id: "B-2081", name: "Arvind Rai", district: "Nalanda", exposure: "Small business", loan: "₹51,000", signal: "Transport disruption" },
];
