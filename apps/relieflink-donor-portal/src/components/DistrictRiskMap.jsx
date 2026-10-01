import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const RISK_STYLES = {
  High: { color: "#c1272d", fillColor: "#c1272d" },
  Medium: { color: "#d97a2c", fillColor: "#d97a2c" },
  Low: { color: "#1e6e5c", fillColor: "#1e6e5c" },
};

export default function DistrictRiskMap({ outlook, onSelect }) {
  return (
    <MapContainer center={[24.5, 87]} zoom={5} scrollWheelZoom className="h-full min-h-80 w-full rounded-xl">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {outlook.map((district) => {
        const style = RISK_STYLES[district.risk] || RISK_STYLES.Low;
        return (
          <CircleMarker
            key={district.name}
            center={[district.lat, district.lng]}
            radius={district.risk === "High" ? 15 : district.risk === "Medium" ? 12 : 9}
            pathOptions={{ ...style, fillOpacity: 0.62, weight: 2 }}
            eventHandlers={{ click: () => onSelect(district.name) }}
          >
            <Popup>
              <strong>{district.name}, {district.state}</strong><br />
              {district.risk} screening signal · {district.rainfallMm} mm forecast rain
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
