import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { URGENCY, URGENCY_ORDER } from "./urgency";
import UrgencyBadge from "./UrgencyBadge";
import "leaflet/dist/leaflet.css";

// Highest-priority open need per camp decides the marker color — a donor
// scanning the map should see the camp's worst unmet need at a glance.
function worstOpenUrgency(needs) {
  const open = needs.filter((n) => n.status !== "Fulfilled");
  if (open.length === 0) return null;
  for (const level of URGENCY_ORDER) {
    if (open.some((n) => n.urgency === level)) return level;
  }
  return null;
}

function divIcon(hex, pulse) {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:22px;height:22px;">
        ${pulse ? `<div class="marker-pulse" style="position:absolute;inset:0;color:${hex};"></div>` : ""}
        <div style="
          position:relative;width:22px;height:22px;border-radius:9999px;
          background:${hex};border:3px solid white;
          box-shadow:0 1px 4px rgba(0,0,0,0.35);
        "></div>
      </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  });
}

// Recenters the map when the visible camp set changes (e.g. after filtering).
function FitBounds({ camps }) {
  const map = useMap();
  useEffect(() => {
    if (camps.length === 0) return;
    const bounds = L.latLngBounds(camps.map((c) => [c.lat, c.lng]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
  }, [camps, map]);
  return null;
}

export default function CampMap({ camps, onSelectCamp }) {
  const center = useMemo(() => {
    if (camps.length === 0) return [26.9, 75.8];
    const lat = camps.reduce((s, c) => s + c.lat, 0) / camps.length;
    const lng = camps.reduce((s, c) => s + c.lng, 0) / camps.length;
    return [lat, lng];
  }, [camps]);

  return (
    <MapContainer
      center={center}
      zoom={8}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: "#e9ece7" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds camps={camps} />
      {camps.map((camp) => {
        const level = worstOpenUrgency(camp.needs);
        const cfg = level ? URGENCY[level] : null;
        const hex = cfg ? cfg.hex : "#8a9691";
        const icon = divIcon(hex, level === "Critical");
        const openNeeds = camp.needs.filter((n) => n.status !== "Fulfilled");

        return (
          <Marker
            key={camp.id}
            position={[camp.lat, camp.lng]}
            icon={icon}
            eventHandlers={{ click: () => onSelectCamp?.(camp) }}
          >
            <Popup>
              <div className="p-3">
                <p className="font-display text-sm font-semibold text-ink">{camp.name}</p>
                <p className="text-xs text-body-soft mb-2">{camp.district} district</p>
                {level ? (
                  <UrgencyBadge urgency={level} />
                ) : (
                  <span className="text-[11px] text-fulfilled font-medium">All needs met</span>
                )}
                <p className="text-xs text-body-soft mt-2">
                  {openNeeds.length} open need{openNeeds.length === 1 ? "" : "s"}
                </p>
                <button
                  onClick={() => onSelectCamp?.(camp)}
                  className="mt-3 w-full rounded-md bg-action px-3 py-1.5 text-xs font-medium text-white hover:bg-action-hover transition-colors"
                >
                  View camp & help
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
