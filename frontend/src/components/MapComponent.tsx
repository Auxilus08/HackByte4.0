"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import useSWR from "swr";
import { fetcher, API_ROUTES, Accident } from "@/lib/api";

// Fix leaflet icon issues in Next.js
const createIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const redIcon = createIcon('red');
const yellowIcon = createIcon('gold');
const greenIcon = createIcon('green'); // resolved?

export default function MapComponent() {
  const { data: accidentsData } = useSWR<{ total: number; items: Accident[] }>(
    `${API_ROUTES.accidents}?limit=100`, 
    fetcher,
    { refreshInterval: 10000 }
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full w-full bg-gray-900 border border-gray-800 rounded-xl animate-pulse flex items-center justify-center">Loading map...</div>;

  // Default center (India roughly)
  const defaultCenter: [number, number] = [21.1458, 79.0882]; // Nagpur, India

  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-gray-800 shadow-lg z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={5} 
        scrollWheelZoom={true} 
        className="h-full w-full bg-gray-900"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {accidentsData?.items?.filter(a => a.location?.lat && a.location?.lng).map((accident) => (
          <Marker 
            key={accident.id} 
            position={[accident.location.lat, accident.location.lng]}
            icon={accident.criticality === "Highly Critical" ? redIcon : yellowIcon}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded text-white font-medium ${
                    accident.criticality === "Highly Critical" ? "bg-red-500" : "bg-yellow-500"
                  }`}>
                    {accident.criticality}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                    {accident.status.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{accident.location_name}</h3>
                <p className="text-sm text-gray-600 mb-2">{accident.description || "No description"}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {accident.assistance_required?.map(tag => (
                    <span key={tag} className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                      {tag.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <style jsx global>{`
        .map-tiles {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
        .leaflet-container {
          background-color: #111827 !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
