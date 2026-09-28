// Representative district coordinates for the Climate Edition pilot.
// Coordinates are used for regional screening only, not official warnings.
export const DISTRICTS = [
  { name: "Sivasagar", state: "Assam", lat: 26.98, lng: 94.63 },
  { name: "Dibrugarh", state: "Assam", lat: 27.47, lng: 94.91 },
  { name: "Guwahati", state: "Assam", lat: 26.14, lng: 91.74 },
  { name: "Patna", state: "Bihar", lat: 25.61, lng: 85.14 },
  { name: "Bhagalpur", state: "Bihar", lat: 25.24, lng: 86.98 },
  { name: "Vijayawada", state: "Andhra Pradesh", lat: 16.51, lng: 80.65 },
  { name: "Rajahmundry", state: "Andhra Pradesh", lat: 17.00, lng: 81.80 },
];

export const SUPPLY_SUGGESTIONS = {
  High: [
    { item: "Safe drinking water", quantity: "500 litres per 100 families" },
    { item: "Dry food packs", quantity: "100 family packs" },
    { item: "First-aid and essential medicines", quantity: "25 kits" },
    { item: "Tarpaulins and blankets", quantity: "100 sets" },
    { item: "Water purification tablets", quantity: "1,000 tablets" },
  ],
  Medium: [
    { item: "Safe drinking water", quantity: "250 litres per 100 families" },
    { item: "Dry food packs", quantity: "50 family packs" },
    { item: "First-aid kits", quantity: "15 kits" },
    { item: "Water purification tablets", quantity: "500 tablets" },
  ],
  Low: [
    { item: "Water purification tablets", quantity: "200 tablets" },
    { item: "First-aid kits", quantity: "5 kits" },
    { item: "Dry food reserve", quantity: "25 family packs" },
  ],
};

export const SAMPLE_OUTLOOK = {
  Sivasagar: { rainfallMm: 168, dischargeRatio: 1.8, risk: "High" },
  Dibrugarh: { rainfallMm: 126, dischargeRatio: 1.45, risk: "High" },
  Guwahati: { rainfallMm: 74, dischargeRatio: 1.18, risk: "Medium" },
  Patna: { rainfallMm: 42, dischargeRatio: 1.05, risk: "Low" },
  Bhagalpur: { rainfallMm: 88, dischargeRatio: 1.3, risk: "Medium" },
  Vijayawada: { rainfallMm: 35, dischargeRatio: 1.02, risk: "Low" },
  Rajahmundry: { rainfallMm: 58, dischargeRatio: 1.12, risk: "Low" },
};
