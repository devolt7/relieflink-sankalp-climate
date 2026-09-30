import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { useEffect, useRef } from "react";
import { URGENCY, URGENCY_ORDER } from "./urgency";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";

const NO_NEED_HEX = "#8a9691";
const VERIFIED_HEX = "#1e6e5c";
const PENDING_HEX = "#c99a1f";

// Highest-priority open need per camp decides the marker color — a donor
// scanning the map should see the camp's worst unmet need at a glance.
function worstOpenUrgency(needs) {
  const open = needs.filter((n) => n.status !== "Fulfilled");
  for (const level of URGENCY_ORDER) {
    if (open.some((n) => n.urgency === level)) return level;
  }
  return null;
}

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function campIcon(hex, pulse, verified) {
  // Unverified camps get a dashed amber outline so they read differently at a glance.
  const ring = verified ? "white" : PENDING_HEX;
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:22px;height:22px;">
        ${pulse ? `<div class="marker-pulse" style="position:absolute;inset:0;color:${hex};"></div>` : ""}
        <div style="position:relative;width:22px;height:22px;border-radius:9999px;background:${hex};
          border:3px ${verified ? "solid" : "dashed"} ${ring};box-shadow:0 1px 4px rgba(0,0,0,0.35);"></div>
      </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  });
}

// Cluster bubble takes the colour of the most urgent camp inside it.
function clusterIcon(cluster) {
  const markers = cluster.getAllChildMarkers();
  const levels = markers.map((m) => m.options.urgency).filter(Boolean);
  const worst = URGENCY_ORDER.find((l) => levels.includes(l));
  const hex = worst ? URGENCY[worst].hex : NO_NEED_HEX;
  return L.divIcon({
    className: "",
    html: `<div style="width:40px;height:40px;border-radius:9999px;background:${hex};color:white;border:4px solid rgba(255,255,255,0.9);
      box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;
      font:600 13px 'IBM Plex Mono',monospace;">${markers.length}</div>`,
    iconSize: [40, 40],
  });
}

function popupHtml(camp) {
  const open = camp.needs.filter((n) => n.status !== "Fulfilled");
  const level = worstOpenUrgency(camp.needs);
  const verified = camp.verification === "verified";
  const rows = [...open]
    .sort((a, b) => URGENCY_ORDER.indexOf(a.urgency) - URGENCY_ORDER.indexOf(b.urgency))
    .slice(0, 3)
    .map((n) => {
      const pct = n.quantityNeeded ? Math.min(100, Math.round((n.quantityFulfilled / n.quantityNeeded) * 100)) : 0;
      return `<div class="mt-2">
        <div class="flex items-center justify-between gap-2 text-xs"><span class="truncate text-ink">${esc(n.item)}</span>
          <span style="color:${URGENCY[n.urgency]?.hex ?? NO_NEED_HEX}" class="shrink-0 text-[10px] font-semibold uppercase">${esc(n.urgency)}</span></div>
        <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-paper-dim"><div class="h-full bg-fulfilled" style="width:${pct}%"></div></div>
      </div>`;
    })
    .join("");
  const more = open.length > 3 ? `<p class="mt-2 text-[11px] text-body-soft">+ ${open.length - 3} more</p>` : "";

  return `<div class="p-3">
    <p class="font-display text-sm font-semibold text-ink">${esc(camp.name)}</p>
    <p class="text-xs text-body-soft">${esc(camp.district)}${camp.state ? `, ${esc(camp.state)}` : ""}</p>
    <p class="mt-1.5 text-[11px] font-medium" style="color:${verified ? VERIFIED_HEX : PENDING_HEX}">${verified ? "✓ Verified camp" : "⚠ Unverified camp"}</p>
    ${camp.phone ? `<a href="tel:${esc(camp.phone)}" class="font-mono-data mt-1 inline-block text-xs text-action">${esc(camp.phone)}</a>` : ""}
    <p class="mt-2 text-xs text-body-soft">${open.length ? `${open.length} open need${open.length === 1 ? "" : "s"}${level ? ` · worst: ${esc(level)}` : ""}` : "All needs met"}</p>
    ${rows}${more}
    <button data-view-camp class="mt-3 w-full rounded-md bg-action px-3 py-1.5 text-xs font-medium text-white hover:bg-action-hover">View camp &amp; help</button>
  </div>`;
}

// Clusters overlapping camps (e.g. several in Sivasagar) and spiderfies them at max zoom.
function ClusterLayer({ camps, onSelectCamp }) {
  const map = useMap();
  const onSelectRef = useRef(onSelectCamp);
  useEffect(() => {
    onSelectRef.current = onSelectCamp;
  }, [onSelectCamp]);

  useEffect(() => {
    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: clusterIcon,
    });

    camps.forEach((camp) => {
      if (!Number.isFinite(camp.lat) || !Number.isFinite(camp.lng)) return;
      const level = worstOpenUrgency(camp.needs);
      const hex = level ? URGENCY[level].hex : NO_NEED_HEX;
      const marker = L.marker([camp.lat, camp.lng], {
        icon: campIcon(hex, level === "Critical", camp.verification === "verified"),
        urgency: level,
      });
      marker.bindPopup(popupHtml(camp), { minWidth: 240, maxWidth: 280 });
      marker.on("popupopen", (e) => {
        const btn = e.popup.getElement()?.querySelector("[data-view-camp]");
        if (btn) btn.onclick = () => onSelectRef.current?.(camp);
      });
      group.addLayer(marker);
    });

    map.addLayer(group);
    return () => {
      map.removeLayer(group);
    };
  }, [camps, map]);

  return null;
}

// Refit only when the *set* of visible camps changes (a filter), not on every
// realtime refresh — otherwise the map would jump while a donor is panning.
function FitBounds({ camps }) {
  const map = useMap();
  const signature = camps.map((c) => c.id).sort().join("|");
  useEffect(() => {
    const pts = camps.filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng)).map((c) => [c.lat, c.lng]);
    if (pts.length === 0) return;
    map.fitBounds(L.latLngBounds(pts), { padding: [48, 48], maxZoom: 12 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, map]);
  return null;
}

export default function CampMap({ camps, onSelectCamp }) {
  return (
    <MapContainer center={[26.2, 92.9]} zoom={6} scrollWheelZoom className="h-full w-full" style={{ background: "#e9ece7" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds camps={camps} />
      <ClusterLayer camps={camps} onSelectCamp={onSelectCamp} />
    </MapContainer>
  );
}
