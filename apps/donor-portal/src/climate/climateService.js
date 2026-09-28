import { SAMPLE_OUTLOOK } from "./districts";

const CACHE_KEY = "relieflink_climate_outlook_v1";

function classifyRisk(rainfallMm, discharge, historicDischarge) {
  let score = 0;
  if (rainfallMm >= 150) score += 2;
  else if (rainfallMm >= 75) score += 1;

  if (historicDischarge > 0 && discharge > 0) {
    const ratio = discharge / historicDischarge;
    if (ratio >= 1.5) score += 2;
    else if (ratio >= 1.2) score += 1;
    return { risk: score >= 3 ? "High" : score > 0 ? "Medium" : "Low", dischargeRatio: ratio };
  }

  return { risk: score >= 2 ? "High" : score > 0 ? "Medium" : "Low", dischargeRatio: null };
}

async function fetchDistrictOutlook(district) {
  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.search = new URLSearchParams({
    latitude: district.lat,
    longitude: district.lng,
    daily: "precipitation_sum",
    forecast_days: "3",
    timezone: "Asia/Kolkata",
  });

  const floodUrl = new URL("https://flood-api.open-meteo.com/v1/flood");
  floodUrl.search = new URLSearchParams({
    latitude: district.lat,
    longitude: district.lng,
    daily: "river_discharge",
    past_days: "30",
    forecast_days: "7",
    timezone: "Asia/Kolkata",
  });

  const [weatherResponse, floodResponse] = await Promise.all([
    fetch(weatherUrl, { signal: AbortSignal.timeout(12000) }),
    fetch(floodUrl, { signal: AbortSignal.timeout(12000) }),
  ]);
  if (!weatherResponse.ok || !floodResponse.ok) throw new Error("Forecast service unavailable");

  const [weather, flood] = await Promise.all([weatherResponse.json(), floodResponse.json()]);
  const rain = weather.daily?.precipitation_sum || [];
  const flows = flood.daily?.river_discharge || [];
  const currentIndex = 30;
  const dischargeHistory = flows.slice(0, currentIndex).filter(Number.isFinite).sort((a, b) => a - b);
  const historicDischarge = dischargeHistory.length
    ? dischargeHistory[Math.floor((dischargeHistory.length - 1) * 0.9)]
    : 0;
  const forecastDischarge = flows.slice(currentIndex).filter(Number.isFinite);
  const discharge = forecastDischarge.length ? Math.max(...forecastDischarge) : 0;
  const rainfallMm = rain.reduce((sum, value) => sum + (Number(value) || 0), 0);
  const classification = classifyRisk(rainfallMm, discharge, historicDischarge);

  return {
    ...district,
    rainfallMm: Math.round(rainfallMm),
    discharge,
    dischargeRatio: classification.dischargeRatio,
    risk: classification.risk,
    forecastDays: weather.daily?.time || [],
    source: "Open-Meteo forecast + flood model",
    updatedAt: new Date().toISOString(),
  };
}

function sampleOutlook(district) {
  const sample = SAMPLE_OUTLOOK[district.name] || { rainfallMm: 40, dischargeRatio: 1.05, risk: "Low" };
  return {
    ...district,
    ...sample,
    discharge: null,
    forecastDays: [],
    source: "Sample demo fallback",
    updatedAt: null,
  };
}

function readCache() {
  try {
    const value = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (!value?.savedAt) return null;
    return value.outlook;
  } catch {
    return null;
  }
}

export async function loadClimateOutlook(districts) {
  const saved = readCache();
  const results = await Promise.allSettled(districts.map(fetchDistrictOutlook));
  const live = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);

  if (live.length === districts.length) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), outlook: live }));
    } catch {
      // Browser storage may be unavailable in private or restricted contexts.
    }
    return { outlook: live, source: "live", warning: null };
  }

  if (saved?.length) {
    const byName = new Map(saved.map((entry) => [entry.name, entry]));
    const merged = districts.map((district) => byName.get(district.name) || sampleOutlook(district));
    return { outlook: merged, source: "cached", warning: "Forecast service unavailable. Showing the last saved outlook or demo samples." };
  }

  if (live.length) {
    const byName = new Map(live.map((entry) => [entry.name, entry]));
    return {
      outlook: districts.map((district) => byName.get(district.name) || sampleOutlook(district)),
      source: "sample",
      warning: "Some forecast requests failed. Missing districts use clearly marked demo samples.",
    };
  }

  return {
    outlook: districts.map(sampleOutlook),
    source: "sample",
    warning: "Forecast service is offline. Showing sample demo values; these are not live alerts.",
  };
}
