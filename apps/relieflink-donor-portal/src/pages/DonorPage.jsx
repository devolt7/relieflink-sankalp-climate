import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CampMap from "../components/CampMap";
import Filters from "../components/Filters";
import { DEFAULT_FILTERS } from "../lib/filters";
import NeedsList, { flattenRows } from "../components/NeedsList";
import CampDetailPanel from "../components/CampDetailPanel";
import { useLiveCampsWithNeeds, useLivePledges } from "../hooks/useLiveData";
import { inTransitQty } from "../lib/format";

const FILTERS_KEY = "relieflink_donor_filters";
const MOBILE_VIEW_KEY = "relieflink_donor_mobile_view";
const SELECTED_CAMP_KEY = "relieflink_donor_selected_camp";

function readStoredFilters() {
  try {
    const raw = sessionStorage.getItem(FILTERS_KEY);
    // merge over defaults so filters saved before "verifiedOnly" existed still work
    return raw ? { ...DEFAULT_FILTERS, ...JSON.parse(raw) } : DEFAULT_FILTERS;
  } catch {
    return DEFAULT_FILTERS;
  }
}

export default function DonorPage() {
  const { camps: rawCamps, loading } = useLiveCampsWithNeeds();
  const { pledgesByNeed, pledgeError } = useLivePledges();
  const [params, setParams] = useSearchParams();
  // Filters, the map/list tab, and the open camp all survive a page refresh.
  const [filters, setFilters] = useState(readStoredFilters);
  const [selectedCampId, setSelectedCampId] = useState(() => sessionStorage.getItem(SELECTED_CAMP_KEY));
  const [mobileView, setMobileView] = useState(
    () => sessionStorage.getItem(MOBILE_VIEW_KEY) || "map"
  ); // "map" | "list"

  useEffect(() => {
    sessionStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    sessionStorage.setItem(MOBILE_VIEW_KEY, mobileView);
  }, [mobileView]);

  useEffect(() => {
    if (selectedCampId) {
      sessionStorage.setItem(SELECTED_CAMP_KEY, selectedCampId);
    } else {
      sessionStorage.removeItem(SELECTED_CAMP_KEY);
    }
  }, [selectedCampId]);

  // Attach donation history + "on the way" quantities to each need; rejected camps never show.
  const camps = useMemo(
    () =>
      rawCamps
        .filter((c) => c.verification !== "rejected")
        .map((c) => ({
          ...c,
          needs: c.needs.map((n) => {
            const donations = pledgesByNeed[n.id] || [];
            return { ...n, donations, inTransit: inTransitQty(donations) };
          }),
        })),
    [rawCamps, pledgesByNeed]
  );

  // Deep link from an alert: /?camp=<id> opens that camp's panel.
  useEffect(() => {
    const campParam = params.get("camp");
    if (campParam) {
      setSelectedCampId(campParam);
      setFilters(DEFAULT_FILTERS); // make sure the camp isn't filtered off the map
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const districts = useMemo(() => [...new Set(camps.map((c) => c.district))].sort(), [camps]);
  const items = useMemo(
    () => [...new Set(camps.flatMap((c) => c.needs.map((n) => n.item)))].sort(),
    [camps]
  );

  const filteredCamps = useMemo(() => {
    return camps
      .map((camp) => {
        if (filters.district !== "all" && camp.district !== filters.district) return null;
        if (filters.verifiedOnly && camp.verification !== "verified") return null;
        const needs = camp.needs.filter((n) => {
          if (filters.item !== "all" && n.item !== filters.item) return false;
          if (filters.urgency !== "all" && n.urgency !== filters.urgency) return false;
          return true;
        });
        if (needs.length === 0) return null;
        return { ...camp, needs };
      })
      .filter(Boolean);
  }, [camps, filters]);

  const rows = useMemo(() => {
    return flattenRows(filteredCamps).sort((a, b) => {
      const order = { Critical: 0, High: 1, Moderate: 2 };
      return order[a.urgency] - order[b.urgency];
    });
  }, [filteredCamps]);

  // Keep the selected camp's data fresh after a claim updates quantities;
  // also how a refresh re-opens whichever camp was previously selected.
  const liveSelectedCamp = selectedCampId ? camps.find((c) => c.id === selectedCampId) ?? null : null;
  const setSelectedCamp = (camp) => setSelectedCampId(camp ? camp.id : null);

  return (
    <div className="flex h-[calc(100vh-49px)] flex-col sm:flex-row">
      {/* Side panel: filters + list */}
      <div
        className={`flex w-full flex-col border-r border-line bg-white sm:w-[380px] sm:shrink-0 ${
          mobileView === "list" ? "flex" : "hidden sm:flex"
        }`}
      >
        {pledgeError && (
          <p className="border-b border-line bg-moderate-soft px-4 py-2 text-xs text-moderate">{pledgeError.message}</p>
        )}
        <div className="border-b border-line px-4 py-4">
          <h1 className="font-display text-lg font-semibold text-ink">Where help is needed</h1>
          <p className="mt-0.5 text-xs text-body-soft">
            {loading ? "Loading needs…" : `${rows.length} open needs across ${filteredCamps.length} camps`}
          </p>
          <div className="mt-3">
            <Filters districts={districts} items={items} filters={filters} onChange={setFilters} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-body-soft">Loading…</div>
          ) : (
            <NeedsList rows={rows} camps={filteredCamps} onSelectCamp={setSelectedCamp} />
          )}
        </div>
      </div>

      {/* Map */}
      <div className={`relative flex-1 ${mobileView === "map" ? "block" : "hidden sm:block"}`}>
        {!loading && <CampMap camps={filteredCamps} onSelectCamp={setSelectedCamp} />}
      </div>

      {/* Mobile toggle */}
      <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 sm:hidden">
        <div className="flex rounded-full bg-ink p-1 shadow-lg">
          {["map", "list"].map((v) => (
            <button
              key={v}
              onClick={() => setMobileView(v)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                mobileView === v ? "bg-white text-ink" : "text-white/70"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <CampDetailPanel camp={liveSelectedCamp} onClose={() => setSelectedCamp(null)} />
    </div>
  );
}
