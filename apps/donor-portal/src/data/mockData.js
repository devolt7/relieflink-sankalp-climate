// Mock dataset — mirrors the Camp / Need / Claim schema from the shared
// project plan exactly, field-for-field, so services/dataService.js can be
// swapped to real Supabase queries later without touching any UI component.

export const mockCamps = [
  { id: "camp_1", name: "Guwahati Flood Relief Camp", district: "Assam", lat: 26.1445, lng: 91.7362, phone: "+91 98640 12345", createdAt: "2026-08-07T12:00:00Z" },
  { id: "camp_6", name: "Tezpur Flood Relief Camp", district: "Assam", lat: 26.6330, lng: 92.7998, phone: "+91 98640 22345", createdAt: "2026-08-08T10:00:00Z" },
  { id: "camp_7", name: "Dibrugarh River Rescue Camp", district: "Assam", lat: 27.4728, lng: 94.9116, phone: "+91 98640 32345", createdAt: "2026-08-08T11:00:00Z" },
  { id: "camp_2", name: "Surat River Rescue Camp", district: "Gujarat", lat: 21.1702, lng: 72.8311, phone: "+91 98240 67890", createdAt: "2026-08-08T08:30:00Z" },
  { id: "camp_5", name: "Ahmedabad Relief Camp", district: "Gujarat", lat: 23.0225, lng: 72.5714, phone: "+91 98241 55555", createdAt: "2026-08-09T11:00:00Z" },
  { id: "camp_3", name: "Jaipur Relief Hub", district: "Rajasthan", lat: 26.9124, lng: 75.7873, phone: "+91 98290 11122", createdAt: "2026-08-01T08:00:00Z" },
  { id: "camp_4", name: "Mumbai Coastal Shelter", district: "Maharashtra", lat: 19.0760, lng: 72.8777, phone: "+91 98210 44556", createdAt: "2026-08-09T09:15:00Z" },
];

// urgency: "Critical" | "High" | "Moderate"
// status is derived (Open / Partially Fulfilled / Fulfilled) but stored
// here as a starting value, same as Person 2's Claim function would set it.
export const mockNeeds = [
  { id: "need_1", campId: "camp_1", item: "Emergency Food Packs", quantityNeeded: 250, quantityFulfilled: 70, urgency: "Critical", status: "Partially Fulfilled", createdAt: "2026-08-07T12:30:00Z", updatedAt: "2026-08-08T06:00:00Z" },
  { id: "need_2", campId: "camp_1", item: "Clean Drinking Water", quantityNeeded: 300, quantityFulfilled: 120, urgency: "Critical", status: "Partially Fulfilled", createdAt: "2026-08-07T12:35:00Z", updatedAt: "2026-08-08T06:15:00Z" },
  { id: "need_3", campId: "camp_1", item: "Inflatable Boats", quantityNeeded: 40, quantityFulfilled: 10, urgency: "High", status: "Partially Fulfilled", createdAt: "2026-08-07T12:40:00Z", updatedAt: "2026-08-08T06:30:00Z" },
  { id: "need_4", campId: "camp_6", item: "Emergency Food Packs", quantityNeeded: 180, quantityFulfilled: 55, urgency: "Critical", status: "Partially Fulfilled", createdAt: "2026-08-08T10:10:00Z", updatedAt: "2026-08-09T07:40:00Z" },
  { id: "need_5", campId: "camp_6", item: "Clean Drinking Water", quantityNeeded: 220, quantityFulfilled: 85, urgency: "Critical", status: "Partially Fulfilled", createdAt: "2026-08-08T10:15:00Z", updatedAt: "2026-08-09T07:50:00Z" },
  { id: "need_6", campId: "camp_7", item: "Rescue Boats", quantityNeeded: 30, quantityFulfilled: 8, urgency: "High", status: "Partially Fulfilled", createdAt: "2026-08-08T11:10:00Z", updatedAt: "2026-08-09T08:00:00Z" },
  { id: "need_7", campId: "camp_7", item: "Medical Kits", quantityNeeded: 90, quantityFulfilled: 20, urgency: "High", status: "Partially Fulfilled", createdAt: "2026-08-08T11:15:00Z", updatedAt: "2026-08-09T08:10:00Z" },
  { id: "need_8", campId: "camp_2", item: "Tarpaulin Sheets", quantityNeeded: 120, quantityFulfilled: 25, urgency: "Critical", status: "Partially Fulfilled", createdAt: "2026-08-08T09:10:00Z", updatedAt: "2026-08-09T07:10:00Z" },
  { id: "need_5", campId: "camp_2", item: "Rescue Life Jackets", quantityNeeded: 80, quantityFulfilled: 18, urgency: "High", status: "Partially Fulfilled", createdAt: "2026-08-08T09:20:00Z", updatedAt: "2026-08-09T07:25:00Z" },
  { id: "need_6", campId: "camp_2", item: "Portable Water Filters", quantityNeeded: 100, quantityFulfilled: 35, urgency: "High", status: "Partially Fulfilled", createdAt: "2026-08-08T09:25:00Z", updatedAt: "2026-08-09T07:45:00Z" },
  { id: "need_7", campId: "camp_3", item: "Blankets", quantityNeeded: 200, quantityFulfilled: 0, urgency: "High", status: "Open", createdAt: "2026-08-01T08:12:00Z", updatedAt: "2026-08-06T14:00:00Z" },
  { id: "need_8", campId: "camp_3", item: "First Aid Kits", quantityNeeded: 60, quantityFulfilled: 0, urgency: "Critical", status: "Open", createdAt: "2026-08-01T08:15:00Z", updatedAt: "2026-08-01T08:15:00Z" },
  { id: "need_9", campId: "camp_3", item: "Cooking Fuel (cylinders)", quantityNeeded: 40, quantityFulfilled: 10, urgency: "High", status: "Partially Fulfilled", createdAt: "2026-08-03T06:55:00Z", updatedAt: "2026-08-06T09:00:00Z" },
  { id: "need_10", campId: "camp_4", item: "Dry Food Kits", quantityNeeded: 180, quantityFulfilled: 55, urgency: "High", status: "Partially Fulfilled", createdAt: "2026-08-09T10:00:00Z", updatedAt: "2026-08-10T08:20:00Z" },
  { id: "need_11", campId: "camp_4", item: "Medical Supplies", quantityNeeded: 90, quantityFulfilled: 20, urgency: "Critical", status: "Partially Fulfilled", createdAt: "2026-08-09T10:05:00Z", updatedAt: "2026-08-10T08:35:00Z" },
  { id: "need_12", campId: "camp_4", item: "Clean Blankets", quantityNeeded: 120, quantityFulfilled: 40, urgency: "High", status: "Partially Fulfilled", createdAt: "2026-08-09T10:10:00Z", updatedAt: "2026-08-10T08:50:00Z" },  { id: "need_14", campId: "camp_5", item: "Water Purification Tablets", quantityNeeded: 150, quantityFulfilled: 45, urgency: "High", status: "Partially Fulfilled", createdAt: "2026-08-09T11:15:00Z", updatedAt: "2026-08-10T09:05:00Z" },
  { id: "need_15", campId: "camp_5", item: "Emergency Blankets", quantityNeeded: 90, quantityFulfilled: 20, urgency: "Moderate", status: "Partially Fulfilled", createdAt: "2026-08-09T11:20:00Z", updatedAt: "2026-08-10T09:10:00Z" },];

export const mockClaims = [
  { id: "claim_1", needId: "need_1", donorName: "Aarav Sharma", donorContact: "+91 90000 11111", quantityClaimed: 40, claimedAt: "2026-08-07T09:00:00Z" },
  { id: "claim_2", needId: "need_4", donorName: "Priya Singh", donorContact: "priya@example.com", quantityClaimed: 25, claimedAt: "2026-08-09T07:10:00Z" },
];
